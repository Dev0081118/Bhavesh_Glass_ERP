const {
  User,
  Party,
  Product,
  Inventory,
  Purchase,
  Production,
  SaleBill,
  Payment,
  Dispatch,
  LR,
  Activity,
} = require("../models");
const { getSettings } = require("./systemController");

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_PRESETS = {
  "7d": { key: "7d", label: "Last 7 days", days: 7, granularity: "day" },
  "30d": { key: "30d", label: "Last 30 days", days: 30, granularity: "day" },
  "90d": { key: "90d", label: "Last 90 days", days: 90, granularity: "week" },
};

const BOOKED_SALE_BILL_STATUSES = ["Confirmed", "Partially Paid", "Paid"];
const OPEN_SALE_BILL_STATUSES = ["Draft", "Confirmed", "Partially Paid"];
const PENDING_PURCHASE_STATUSES = ["Draft", "Pending", "Ordered", "Partially Received"];
const ACTIVE_PRODUCTION_STATUSES = ["Planned", "In Progress", "On Hold", "Partially Completed"];
const ACTIVE_DISPATCH_STATUSES = ["Ready to Dispatch", "Dispatched", "In Transit"];
const ACTIVE_USER_MATCH = { role: { $ne: "Super Admin" } };
const SERVICE_STATUSES = [
  { id: "whatsapp_ai", label: "WhatsApp AI", status: "not_configured" },
  { id: "reports", label: "Reports", status: "not_configured" },
];

// =========================
// HELPERS
// =========================

const startOfUtcDay = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const toKey = (date) => date.toISOString().slice(0, 10);

const formatShortDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

const round = (value) => Math.round(Number(value) || 0);

const changePercent = (current, previous) => {
  if (!previous) return null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const firstOrNull = (rows) => (rows && rows.length ? rows[0] : null);

const countFrom = (rows) => firstOrNull(rows)?.count || 0;

const resolveRange = (rawRange) => {
  const preset = RANGE_PRESETS[rawRange] || RANGE_PRESETS["30d"];
  const to = new Date();
  const from = startOfUtcDay(new Date(to.getTime() - (preset.days - 1) * DAY_MS));
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = startOfUtcDay(
    new Date(previousTo.getTime() - (preset.days - 1) * DAY_MS)
  );

  return { ...preset, from, to, previousFrom, previousTo };
};

const buildBuckets = (range) => {
  const buckets = [];

  if (range.granularity === "week") {
    const bucketCount = Math.ceil(range.days / 7);

    for (let index = 0; index < bucketCount; index += 1) {
      const end = new Date(range.to.getTime() - (bucketCount - 1 - index) * 7 * DAY_MS);
      const start = startOfUtcDay(new Date(end.getTime() - 6 * DAY_MS));
      buckets.push({ start, end, key: toKey(start), label: formatShortDate(start) });
    }

    return buckets;
  }

  for (let index = 0; index < range.days; index += 1) {
    const start = new Date(range.from.getTime() + index * DAY_MS);
    buckets.push({
      start,
      end: new Date(start.getTime() + DAY_MS - 1),
      key: toKey(start),
      label: formatShortDate(start),
    });
  }

  return buckets;
};

const findBucketIndex = (buckets, key) => {
  const time = Date.parse(`${key}T00:00:00.000Z`);

  if (Number.isNaN(time)) return -1;

  for (let index = 0; index < buckets.length; index += 1) {
    if (time >= buckets[index].start.getTime() && time <= buckets[index].end.getTime()) {
      return index;
    }
  }

  return -1;
};

const fillSeries = (rows, buckets, valueField = "total") => {
  const values = new Array(buckets.length).fill(0);

  (rows || []).forEach((row) => {
    const index = findBucketIndex(buckets, row._id);
    if (index >= 0) values[index] += Number(row[valueField]) || 0;
  });

  return values.map(round);
};

const dailyGroup = (dateField, sumExpression) => [
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } }, total: sumExpression } },
];

// Purchase documents store no total, so the value is derived from the line items.
const PURCHASE_BASE_AMOUNT = {
  $reduce: {
    input: "$items",
    initialValue: 0,
    in: { $add: ["$$value", { $multiply: ["$$this.quantity", "$$this.rate"] }] },
  },
};

const PURCHASE_GROSS_AMOUNT = {
  $subtract: [
    {
      $add: [
        PURCHASE_BASE_AMOUNT,
        { $divide: [{ $multiply: [PURCHASE_BASE_AMOUNT, { $ifNull: ["$gst", 0] }] }, 100] },
      ],
    },
    { $ifNull: ["$discount", 0] },
  ],
};

// =========================
// AGGREGATIONS
// =========================

const queryRevenue = (range) =>
  SaleBill.aggregate([
    { $match: { status: { $in: BOOKED_SALE_BILL_STATUSES } } },
    {
      $facet: {
        current: [
          { $match: { billDate: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
        ],
        previous: [
          { $match: { billDate: { $gte: range.previousFrom, $lte: range.previousTo } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
        ],
        allTime: [{ $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } }],
        daily: [
          { $match: { billDate: { $gte: range.from, $lte: range.to } } },
          ...dailyGroup("billDate", { $sum: "$grandTotal" }),
        ],
      },
    },
  ]);

const queryReceivables = (range, now) =>
  SaleBill.aggregate([
    { $match: { status: { $ne: "Cancelled" }, paymentStatus: { $ne: "Paid" } } },
    {
      $addFields: {
        outstanding: { $subtract: ["$grandTotal", { $ifNull: ["$paidAmount", 0] }] },
      },
    },
    {
      $facet: {
        summary: [
          { $group: { _id: null, outstanding: { $sum: "$outstanding" }, count: { $sum: 1 } } },
        ],
        billed: [
          { $match: { billDate: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
        ],
        overdueSummary: [
          { $match: { dueDate: { $lt: now }, status: { $nin: ["Draft", "Cancelled"] } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$outstanding" } } },
        ],
        overdueItems: [
          { $match: { dueDate: { $lt: now }, status: { $nin: ["Draft", "Cancelled"] } } },
          { $sort: { outstanding: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "parties",
              localField: "customer",
              foreignField: "_id",
              as: "customer",
            },
          },
          { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ]);

const queryCollections = (range) =>
  Payment.aggregate([
    { $match: { status: "Completed" } },
    {
      $facet: {
        current: [
          { $match: { paymentDate: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        previous: [
          { $match: { paymentDate: { $gte: range.previousFrom, $lte: range.previousTo } } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        allTime: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
        daily: [
          { $match: { paymentDate: { $gte: range.from, $lte: range.to } } },
          ...dailyGroup("paymentDate", { $sum: "$amount" }),
        ],
      },
    },
  ]);

const queryPurchases = (range) =>
  Purchase.aggregate([
    {
      $facet: {
        daily: [
          {
            $match: {
              purchaseDate: { $gte: range.from, $lte: range.to },
              status: { $ne: "Cancelled" },
            },
          },
          ...dailyGroup("purchaseDate", { $sum: PURCHASE_GROSS_AMOUNT }),
        ],
        pendingSummary: [
          { $match: { status: { $in: PENDING_PURCHASE_STATUSES } } },
          { $addFields: { amount: PURCHASE_GROSS_AMOUNT } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
        ],
        pendingItems: [
          { $match: { status: { $in: PENDING_PURCHASE_STATUSES } } },
          { $addFields: { amount: PURCHASE_GROSS_AMOUNT } },
          { $sort: { amount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "parties",
              localField: "supplier",
              foreignField: "_id",
              as: "supplier",
            },
          },
          { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ]);

const queryLowStock = () =>
  Inventory.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      /*
       * Stock and minimumStockLevel are both counted in the
       * product stock unit, so they compare directly.
       */
      $match: {
        "product.minimumStockLevel": { $gt: 0 },
        $expr: { $lte: ["$availableQuantity", "$product.minimumStockLevel"] },
      },
    },
    {
      $facet: {
        summary: [{ $count: "count" }],
        items: [{ $sort: { availableQuantity: 1 } }, { $limit: 5 }],
      },
    },
  ]);

const queryCatalogLowStock = () =>
  Product.aggregate([
    {
      $match: {
        status: "Active",
        minimumStockLevel: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "product",
        as: "inventories",
      },
    },
    { $match: { inventories: { $size: 0 } } },
    {
      $facet: {
        summary: [{ $count: "count" }],
        items: [{ $sort: { name: 1 } }, { $limit: 5 }],
      },
    },
  ]);

const queryStuckDispatches = (now) =>
  Dispatch.aggregate([
    {
      $match: {
        status: { $in: ACTIVE_DISPATCH_STATUSES },
        expectedDeliveryDate: { $lt: now },
      },
    },
    { $sort: { expectedDeliveryDate: 1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "parties",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  ]);

const queryFreightPending = () =>
  LR.aggregate([
    { $match: { freightPaymentStatus: "Pending", status: { $ne: "Cancelled" } } },
    {
      $facet: {
        summary: [
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$freightAmount" } } },
        ],
        items: [
          { $sort: { lrDate: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "parties",
              localField: "customer",
              foreignField: "_id",
              as: "customer",
            },
          },
          { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ]);

const queryPendingPayments = () =>
  Payment.aggregate([
    { $match: { status: "Pending" } },
    {
      $facet: {
        summary: [{ $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } }],
        items: [
          { $sort: { paymentDate: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "parties",
              localField: "customer",
              foreignField: "_id",
              as: "customer",
            },
          },
          { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ]);

const queryWorkforce = (range) =>
  User.aggregate([
    { $match: ACTIVE_USER_MATCH },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
              inactive: { $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] } },
              neverLoggedIn: {
                $sum: { $cond: [{ $eq: [{ $ifNull: ["$lastLoginAt", null] }, null] }, 1, 0] },
              },
            },
          },
        ],
        loggedInInRange: [
          { $match: { lastLoginAt: { $gte: range.from, $lte: range.to } } },
          { $count: "count" },
        ],
        newInRange: [
          { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
          { $count: "count" },
        ],
        previousNew: [
          { $match: { createdAt: { $gte: range.previousFrom, $lte: range.previousTo } } },
          { $count: "count" },
        ],
        recentJoins: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { name: 1, role: 1, department: 1, status: 1, createdAt: 1 } },
        ],
        neverLoggedInItems: [
          { $match: { status: "Active", lastLoginAt: null } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { name: 1, role: 1, department: 1 } },
        ],
        inactiveItems: [
          { $match: { status: "Inactive" } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { name: 1, role: 1, department: 1 } },
        ],
        byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        byDepartment: [
          { $group: { _id: { $ifNull: ["$department", "Unassigned"] }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

const queryModuleAdoption = () =>
  User.aggregate([
    { $match: ACTIVE_USER_MATCH },
    { $project: { modules: { $objectToArray: { $ifNull: ["$access.modules", {}] } } } },
    { $unwind: "$modules" },
    {
      $group: {
        _id: "$modules.k",
        assigned: { $sum: 1 },
        enabledFor: { $sum: { $cond: ["$modules.v", 1, 0] } },
      },
    },
    { $sort: { enabledFor: -1, _id: 1 } },
  ]);

const queryActivitySummary = () =>
  Activity.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byCategory: [
          {
            $group: {
              _id: { $arrayElemAt: [{ $split: ["$action", "_"] }, 0] },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

const queryOperations = async () => {
  const [
    products,
    inventoryItems,
    purchases,
    productions,
    saleBills,
    payments,
    dispatches,
    lrs,
    parties,
  ] = await Promise.all([
    Product.countDocuments(),
    Inventory.countDocuments(),
    Purchase.countDocuments(),
    Production.countDocuments(),
    SaleBill.countDocuments(),
    Payment.countDocuments(),
    Dispatch.countDocuments(),
    LR.countDocuments(),
    Party.countDocuments(),
  ]);

  return {
    products,
    inventoryItems,
    purchases,
    productions,
    saleBills,
    payments,
    dispatches,
    lrs,
    parties,
  };
};

const queryPendingInflow = (dateWindow) =>
  Promise.all([
    Purchase.countDocuments({ status: { $in: PENDING_PURCHASE_STATUSES }, createdAt: dateWindow }),
    Payment.countDocuments({ status: "Pending", createdAt: dateWindow }),
    Dispatch.countDocuments({ status: { $in: ACTIVE_DISPATCH_STATUSES }, createdAt: dateWindow }),
    Production.countDocuments({ status: { $in: ACTIVE_PRODUCTION_STATUSES }, createdAt: dateWindow }),
  ]).then((rows) => rows.reduce((total, value) => total + value, 0));

const buildAlert = ({ id, severity, title, description, count, amount, module, items, cta }) => {
  if (!count) return null;

  return {
    id,
    severity,
    title,
    description,
    count,
    amount: amount === undefined || amount === null ? null : round(amount),
    module,
    cta,
    items: items || [],
  };
};

const severityWeight = { critical: 0, warning: 1, info: 2 };

const sortAlerts = (alerts) =>
  alerts
    .filter(Boolean)
    .sort(
      (left, right) =>
        severityWeight[left.severity] - severityWeight[right.severity] || right.count - left.count
    );

const formatDaysAgo = (value) => {
  if (!value) return null;

  const days = Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS);

  if (days <= 0) return "due today";
  if (days === 1) return "1 day overdue";
  return `${days} days overdue`;
};

const getDashboardSummary = async (req, res) => {
  try {
    const range = resolveRange(req.query.range);
    const now = new Date();
    const buckets = buildBuckets(range);

    const [
      revenueRows,
      receivablesRows,
      collectionRows,
      purchaseRows,
      lowStockRows,
      catalogLowStockRows,
      stuckDispatchItems,
      freightRows,
      pendingPaymentRows,
      workforceRows,
      moduleAdoptionRows,
      activitySummaryRows,
      operations,
      settings,
      stuckDispatchCount,
      activeDispatchCount,
      activeProductionCount,
      openSaleBillCount,
      purchaseTotal,
      productionTotal,
      dispatchTotal,
      saleBillTotal,
      paymentTotal,
      pendingInflowCurrent,
      pendingInflowPrevious,
      recentActivity,
    ] = await Promise.all([
      queryRevenue(range),
      queryReceivables(range, now),
      queryCollections(range),
      queryPurchases(range),
      queryLowStock(),
      queryCatalogLowStock(),
      queryStuckDispatches(now),
      queryFreightPending(),
      queryPendingPayments(),
      queryWorkforce(range),
      queryModuleAdoption(),
      queryActivitySummary(),
      queryOperations(),
      getSettings(),
      Dispatch.countDocuments({
        status: { $in: ACTIVE_DISPATCH_STATUSES },
        expectedDeliveryDate: { $lt: now },
      }),
      Dispatch.countDocuments({ status: { $in: ACTIVE_DISPATCH_STATUSES } }),
      Production.countDocuments({ status: { $in: ACTIVE_PRODUCTION_STATUSES } }),
      SaleBill.countDocuments({ status: { $in: OPEN_SALE_BILL_STATUSES } }),
      Purchase.countDocuments(),
      Production.countDocuments(),
      Dispatch.countDocuments(),
      SaleBill.countDocuments(),
      Payment.countDocuments({ status: { $ne: "Cancelled" } }),
      queryPendingInflow({ $gte: range.from, $lte: range.to }),
      queryPendingInflow({ $gte: range.previousFrom, $lte: range.previousTo }),
      Activity.find().populate("actor", "name role").sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const changedByUser = settings.changedBy
      ? await User.findById(settings.changedBy).select("name").lean()
      : null;

    const facetOf = (rows) => (rows && rows[0]) || {};
    const facetRows = (facet, key) => (facet && facet[key]) || [];

    const revenueFacet = facetOf(revenueRows);
    const revenueCurrent = firstOrNull(facetRows(revenueFacet, "current")) || { total: 0, count: 0 };
    const revenuePrevious = firstOrNull(facetRows(revenueFacet, "previous")) || { total: 0, count: 0 };
    const revenueAllTime = firstOrNull(facetRows(revenueFacet, "allTime")) || { total: 0, count: 0 };
    const revenueSeries = fillSeries(facetRows(revenueFacet, "daily"), buckets);

    const collectionFacet = facetOf(collectionRows);
    const collectionCurrent = firstOrNull(facetRows(collectionFacet, "current")) || { total: 0, count: 0 };
    const collectionPrevious = firstOrNull(facetRows(collectionFacet, "previous")) || { total: 0, count: 0 };
    const collectionAllTime = firstOrNull(facetRows(collectionFacet, "allTime")) || { total: 0 };
    const collectionSeries = fillSeries(facetRows(collectionFacet, "daily"), buckets);

    const receivableFacet = facetOf(receivablesRows);
    const receivableSummary = firstOrNull(facetRows(receivableFacet, "summary")) || {
      outstanding: 0,
      count: 0,
    };
    const billedInRange = firstOrNull(facetRows(receivableFacet, "billed")) || { total: 0, count: 0 };
    const overdueSummary = firstOrNull(facetRows(receivableFacet, "overdueSummary")) || {
      count: 0,
      amount: 0,
    };
    const overdueItems = facetRows(receivableFacet, "overdueItems");

    const purchaseFacet = facetOf(purchaseRows);
    const purchaseSeries = fillSeries(facetRows(purchaseFacet, "daily"), buckets);
    const pendingPurchaseSummary = firstOrNull(facetRows(purchaseFacet, "pendingSummary")) || {
      count: 0,
      amount: 0,
    };
    const pendingPurchaseItems = facetRows(purchaseFacet, "pendingItems");

    const lowStockFacet = facetOf(lowStockRows);
    const catalogLowStockFacet = facetOf(catalogLowStockRows);
    const lowStockInventoryCount = countFrom(facetRows(lowStockFacet, "summary"));
    const lowStockCatalogCount = countFrom(facetRows(catalogLowStockFacet, "summary"));

    const freightFacet = facetOf(freightRows);
    const freightSummary = firstOrNull(facetRows(freightFacet, "summary")) || {
      count: 0,
      amount: 0,
    };
    const freightItems = facetRows(freightFacet, "items");

    const pendingPaymentFacet = facetOf(pendingPaymentRows);
    const pendingPaymentSummary = firstOrNull(facetRows(pendingPaymentFacet, "summary")) || {
      count: 0,
      amount: 0,
    };
    const pendingPaymentItems = facetRows(pendingPaymentFacet, "items");

    const workforceFacet = facetOf(workforceRows);
    const workforceTotals = firstOrNull(facetRows(workforceFacet, "totals")) || {
      total: 0,
      active: 0,
      inactive: 0,
      neverLoggedIn: 0,
    };
    const loggedInInRange = countFrom(facetRows(workforceFacet, "loggedInInRange"));
    const newInRange = countFrom(facetRows(workforceFacet, "newInRange"));
    const previousNew = countFrom(facetRows(workforceFacet, "previousNew"));

    const activityFacet = facetOf(activitySummaryRows);
    const activityTotal = countFrom(facetRows(activityFacet, "total"));
    const activityByCategory = facetRows(activityFacet, "byCategory");

    const trendPoints = buckets.map((bucket, index) => ({
      key: bucket.key,
      label: bucket.label,
      sales: revenueSeries[index],
      purchases: purchaseSeries[index],
      collections: collectionSeries[index],
    }));

    const pipeline = [
      {
        id: "purchase",
        label: "Purchase",
        module: "purchase",
        total: purchaseTotal,
        active: pendingPurchaseSummary.count,
        statuses: PENDING_PURCHASE_STATUSES,
      },
      {
        id: "production",
        label: "Production",
        module: "production",
        total: productionTotal,
        active: activeProductionCount,
        statuses: ACTIVE_PRODUCTION_STATUSES,
      },
      {
        id: "dispatch",
        label: "Dispatch",
        module: "dispatch",
        total: dispatchTotal,
        active: activeDispatchCount,
        statuses: ACTIVE_DISPATCH_STATUSES,
      },
      {
        id: "sale_bill",
        label: "Sale Bill",
        module: "sale-bill",
        total: saleBillTotal,
        active: openSaleBillCount,
        statuses: OPEN_SALE_BILL_STATUSES,
      },
      {
        id: "payment",
        label: "Payment",
        module: "payment",
        total: paymentTotal,
        active: pendingPaymentSummary.count,
        statuses: ["Pending"],
      },
    ];

    const busiestStage = pipeline.reduce(
      (max, stage) => (max === null || stage.active > max.active ? stage : max),
      null
    );

    const bottleneck = busiestStage && busiestStage.active > 0 ? busiestStage : null;

    const pendingWorkBreakdown = {
      purchases: pendingPurchaseSummary.count,
      payments: pendingPaymentSummary.count,
      dispatches: activeDispatchCount,
      productions: activeProductionCount,
    };

    const pendingWorkTotal = Object.values(pendingWorkBreakdown).reduce(
      (total, value) => total + value,
      0
    );

    const lowStockCount = lowStockInventoryCount + lowStockCatalogCount;

    const lowStockItems = [
      ...facetRows(lowStockFacet, "items").map((row) => ({
        id: row._id,
        label: row.product?.name || "Unknown product",
        detail: `${round(row.availableQuantity)} ${
          row.product?.stockUnit || row.product?.unit || "units"
        } at ${
          row.location || "warehouse"
        } · minimum ${round(row.product?.minimumStockLevel)}`,
        value: null,
      })),
      ...facetRows(catalogLowStockFacet, "items").map((row) => ({
        id: row._id,
        label: row.name,
        detail: `0 ${row.stockUnit || row.unit || "units"} in catalogue · minimum ${round(
          row.minimumStockLevel
        )}`,
        value: null,
      })),
    ].slice(0, 5);

    const alerts = sortAlerts([
      buildAlert({
        id: "overdue-receivables",
        severity: "critical",
        title: "Overdue receivables",
        description: "Bills that are past their due date and not fully paid",
        count: overdueSummary.count,
        amount: overdueSummary.amount,
        module: "sale-bill",
        cta: "Review sale bills",
        items: overdueItems.map((bill) => ({
          id: bill._id,
          label: bill.customer?.name || "Unknown customer",
          detail: formatDaysAgo(bill.dueDate),
          value: round(bill.outstanding),
        })),
      }),
      buildAlert({
        id: "stuck-dispatches",
        severity: "critical",
        title: "Dispatches past delivery date",
        description: "Shipments still open after their expected delivery date",
        count: stuckDispatchCount,
        module: "dispatch",
        cta: "Open dispatch",
        items: stuckDispatchItems.map((entry) => ({
          id: entry._id,
          label: entry.customer?.name || "Unknown customer",
          detail: [entry.vehicleNumber, formatDaysAgo(entry.expectedDeliveryDate)]
            .filter(Boolean)
            .join(" · "),
          value: null,
        })),
      }),
      buildAlert({
        id: "low-stock",
        severity: "warning",
        title: "Low stock",
        description: "Items at or below their reorder level",
        count: lowStockCount,
        module: "inventory",
        cta: "Open inventory",
        items: lowStockItems,
      }),
      buildAlert({
        id: "pending-purchases",
        severity: "warning",
        title: "Purchases not received",
        description: "Orders that are still awaiting full receipt",
        count: pendingPurchaseSummary.count,
        amount: pendingPurchaseSummary.amount,
        module: "purchase",
        cta: "Open purchase",
        items: pendingPurchaseItems.map((row) => ({
          id: row._id,
          label: row.supplier?.name || "Unknown supplier",
          detail: row.status,
          value: round(row.amount),
        })),
      }),

      buildAlert({
        id: "pending-payments",
        severity: "warning",
        title: "Payments awaiting confirmation",
        description: "Recorded receipts that are not marked as completed",
        count: pendingPaymentSummary.count,
        amount: pendingPaymentSummary.amount,
        module: "payment",
        cta: "Open payments",
        items: pendingPaymentItems.map((row) => ({
          id: row._id,
          label: row.customer?.name || "Unknown customer",
          detail: row.paymentMode,
          value: round(row.amount),
        })),
      }),
      buildAlert({
        id: "freight-pending",
        severity: "warning",
        title: "Freight payments pending",
        description: "Lorry receipts whose freight is still unpaid",
        count: freightSummary.count,
        amount: freightSummary.amount,
        module: "lr",
        cta: "Open LR",
        items: freightItems.map((row) => ({
          id: row._id,
          label: row.customer?.name || "Unknown customer",
          detail: [row.transporter, row.vehicleNumber].filter(Boolean).join(" · "),
          value: round(row.freightAmount),
        })),
      }),
      buildAlert({
        id: "never-signed-in",
        severity: "info",
        title: "Active accounts that never signed in",
        description: "Staff with an active account but no recorded login",
        count: workforceTotals.neverLoggedIn,
        module: "staff",
        cta: "Open staff",
        items: facetRows(workforceFacet, "neverLoggedInItems").map((user) => ({
          id: user._id,
          label: user.name,
          detail: [user.role, user.department].filter(Boolean).join(" · "),
          value: null,
        })),
      }),
      buildAlert({
        id: "inactive-accounts",
        severity: "info",
        title: "Inactive staff accounts",
        description: "Accounts that are disabled and cannot sign in",
        count: workforceTotals.inactive,
        module: "staff",
        cta: "Review staff",
        items: facetRows(workforceFacet, "inactiveItems").map((user) => ({
          id: user._id,
          label: user.name,
          detail: [user.role, user.department].filter(Boolean).join(" · "),
          value: null,
        })),
      }),
    ]);

    const workforce = {
      total: workforceTotals.total,
      active: workforceTotals.active,
      inactive: workforceTotals.inactive,
      neverLoggedIn: workforceTotals.neverLoggedIn,
      loggedInInRange,
      newInRange,
      previousNew,
      changePct: changePercent(newInRange, previousNew),
      byRole: facetRows(workforceFacet, "byRole").map((row) => ({
        id: row._id || "Unassigned",
        label: row._id || "Unassigned",
        count: row.count,
      })),
      byDepartment: facetRows(workforceFacet, "byDepartment").map((row) => ({
        id: row._id || "Unassigned",
        label: row._id || "Unassigned",
        count: row.count,
      })),
      recentJoins: facetRows(workforceFacet, "recentJoins").map((row) => ({
        id: row._id,
        name: row.name,
        role: row.role,
        department: row.department || "Unassigned",
        status: row.status,
        joinedAt: row.createdAt,
      })),
    };

    const moduleAdoption = moduleAdoptionRows.map((row) => ({
      id: row._id,
      assigned: row.assigned,
      enabledFor: row.enabledFor,
      totalUsers: workforceTotals.total,
    }));

    const activity = {
      total: activityTotal,
      countsByCategory: activityByCategory.map((row) => ({
        id: String(row._id || "other").toLowerCase(),
        count: row.count,
      })),
      items: recentActivity.map((entry) => ({
        id: entry._id,
        action: entry.action,
        category: String(entry.action || "").split("_")[0].toLowerCase(),
        description: entry.description,
        actor: entry.actor?.name || "System",
        actorRole: entry.actor?.role || null,
        createdAt: entry.createdAt,
      })),
    };

    const totalModules = moduleAdoption.length;
    const modulesInUse = moduleAdoption.filter((row) => row.enabledFor > 0).length;
    const modulesOrgWide = moduleAdoption.filter(
      (row) => row.totalUsers > 0 && row.enabledFor === row.totalUsers
    ).length;

    return res.json({
      generatedAt: new Date().toISOString(),
      range: {
        key: range.key,
        label: range.label,
        days: range.days,
        granularity: range.granularity,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
      system: {
        isSystemActive: Boolean(settings.isSystemActive),
        reason: settings.reason || "",
        lastChangedAt: settings.lastChangedAt || null,
        changedBy: changedByUser?.name || null,
        totalModules,
        modulesInUse,
        modulesOrgWide,
        services: SERVICE_STATUSES,
      },
      kpis: {
        revenue: {
          current: round(revenueCurrent.total),
          previous: round(revenuePrevious.total),
          changePct: changePercent(round(revenueCurrent.total), round(revenuePrevious.total)),
          allTime: round(revenueAllTime.total),
          billCount: revenueCurrent.count,
          series: revenueSeries,
        },
        receivables: {
          outstanding: round(receivableSummary.outstanding),
          openBills: receivableSummary.count,
          overdueCount: overdueSummary.count,
          overdueAmount: round(overdueSummary.amount),
          billedInRange: round(billedInRange.total),
          billedCountInRange: billedInRange.count,
          collectedInRange: round(collectionCurrent.total),
          collectedPrevious: round(collectionPrevious.total),
          collectedChangePct: changePercent(
            round(collectionCurrent.total),
            round(collectionPrevious.total)
          ),
          collectedAllTime: round(collectionAllTime.total),
          series: collectionSeries,
        },
        pendingWork: {
          total: pendingWorkTotal,
          breakdown: pendingWorkBreakdown,
          inflow: pendingInflowCurrent,
          previousInflow: pendingInflowPrevious,
          changePct: changePercent(pendingInflowCurrent, pendingInflowPrevious),
        },
        workforce: {
          total: workforce.total,
          active: workforce.active,
          inactive: workforce.inactive,
          loggedInInRange: workforce.loggedInInRange,
          neverLoggedIn: workforce.neverLoggedIn,
          newInRange: workforce.newInRange,
          changePct: workforce.changePct,
        },
      },
      trend: {
        granularity: range.granularity,
        points: trendPoints,
      },
      pipeline: pipeline.map((stage) => ({
        ...stage,
        isBottleneck: Boolean(bottleneck) && stage.id === bottleneck.id,
      })),
      alerts: {
        total: alerts.length,
        counts: {
          critical: alerts
            .filter((alert) => alert.severity === "critical")
            .reduce((total, alert) => total + alert.count, 0),
          warning: alerts
            .filter((alert) => alert.severity === "warning")
            .reduce((total, alert) => total + alert.count, 0),
          info: alerts
            .filter((alert) => alert.severity === "info")
            .reduce((total, alert) => total + alert.count, 0),
        },
        items: alerts,
      },
      workforce,
      moduleAdoption,
      activity,
      operations,
    });


  } catch (error) {
    console.error("Unable to build dashboard summary:", error.message);
    return res.status(500).json({ message: "Unable to load the dashboard summary." });
  }
};

module.exports = { getDashboardSummary };





