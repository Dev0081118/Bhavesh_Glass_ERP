require("dotenv").config();

const mongoose = require("mongoose");

const {
  Product,
  Inventory,
  StockTransaction,
} = require("../models");

const {
  getStockUnit,
  getStockFactor,
  updateLowStockNotification,
} = require("../services/inventoryService");

/*
 * UNIT CONVERSION -> STOCK MIGRATION
 *
 * Before:
 *   Product.unit = Sheet, 1 Sheet = 50 Piece
 *   Inventory counted in Sheet (10 Sheet), minimumStockLevel was
 *   compared against Sheet, so "minimum 10" meant 500 Piece.
 *
 * After:
 *   Inventory counts in the converted unit (Piece), so the same
 *   stock reads 500 Piece and "minimum 10" means 10 Piece.
 *
 * Usage:
 *   node src/scripts/migrateStockToConvertedUnit.js            (dry run)
 *   node src/scripts/migrateStockToConvertedUnit.js --apply
 *   node src/scripts/migrateStockToConvertedUnit.js --apply --fix-notifications
 */

const APPLY = process.argv.includes("--apply");

const FIX_NOTIFICATIONS = process.argv.includes("--fix-notifications");

const roundQuantity = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 1000000) / 1000000;

const scale = (value, factor) =>
  roundQuantity(Number(value || 0) * factor);

const formatNumber = (value) => Number(roundQuantity(value)).toLocaleString("en-IN");

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({});

  let migratedProducts = 0;
  let untouchedProducts = 0;
  let skippedProducts = 0;
  let migratedTransactions = 0;
  const migratedIds = [];

  for (const product of products) {
    const stockUnit = getStockUnit(product);

    const storedUnit = String(product.stockUnit || "").trim();

    if (storedUnit && storedUnit.toLowerCase() === stockUnit.toLowerCase()) {
      skippedProducts += 1;
      continue;
    }

    const factor = getStockFactor(product);

    const inventory = await Inventory.findOne({ product: product._id });

    const available = Number(inventory?.availableQuantity || 0);

    const quantity = Number(inventory?.quantity || 0);

    if (factor === 1) {
      /*
       * No conversion, so stock already is in the stock unit.
       * Only the marker is written.
       */
      if (APPLY) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { stockUnit } }
        );
      }

      untouchedProducts += 1;

      console.log(
        `${APPLY ? "OK  " : "DRY "} ${product.sku}: ${stockUnit} (no number change)`
      );

      continue;
    }

    console.log(
      `${APPLY ? "OK  " : "DRY "} ${product.sku}: 1 ${product.unit} = ${factor} ${stockUnit} | ` +
        `stock ${formatNumber(available)} ${product.unit} -> ${formatNumber(
          scale(available, factor)
        )} ${stockUnit}` +
        (available === quantity
          ? ""
          : ` | total ${formatNumber(quantity)} -> ${formatNumber(
              scale(quantity, factor)
            )} ${stockUnit}`) +
        (product.minimumStockLevel
          ? ` | minimum ${formatNumber(product.minimumStockLevel)} ${stockUnit} (was ${formatNumber(
              product.minimumStockLevel
            )} ${product.unit})`
          : "")
    );

    if (!APPLY) {
      migratedProducts += 1;

      continue;
    }

    if (inventory) {
      await Inventory.updateOne(
        { _id: inventory._id },
        {
          $set: {
            availableQuantity: scale(inventory.availableQuantity, factor),
            quantity: scale(inventory.quantity, factor),
            reservedQuantity: scale(inventory.reservedQuantity, factor),
          },
        }
      );
    }

    /*
     * Stock history keeps `quantity` + `unit` exactly as they
     * were entered, but the stored stock-unit value is rescaled
     * so historical sums stay comparable.
     */
    const transactions = await StockTransaction.find({
      product: product._id,
    })
      .select("_id primaryQuantity")
      .lean();

    if (transactions.length) {
      await StockTransaction.bulkWrite(
        transactions.map((transaction) => ({
          updateOne: {
            filter: {
              _id: transaction._id,
            },

            update: {
              $set: {
                primaryQuantity: scale(
                  transaction.primaryQuantity,
                  factor
                ),
              },
            },
          },
        }))
      );

      migratedTransactions += transactions.length;
    }

    await Product.updateOne(
      { _id: product._id },
      { $set: { stockUnit } }
    );

    migratedProducts += 1;

    migratedIds.push(product._id);
  }

  if (FIX_NOTIFICATIONS && migratedIds.length && APPLY) {
    /*
     * Existing low stock notifications were worded in the old
     * unit, so re-evaluate them against the migrated stock.
     */
    const migratedProducts = await Product.find({
      _id: { $in: migratedIds },
    });

    let refreshed = 0;

    for (const product of migratedProducts) {
      const inventory = await Inventory.findOne({
        product: product._id,
      });

      if (!inventory) continue;

      await updateLowStockNotification(product, inventory);

      refreshed += 1;
    }

    console.log(
      `\nRe-evaluated low stock notifications for ${refreshed} product(s) in the new stock unit.`
    );
  }

  if (FIX_NOTIFICATIONS && !APPLY) {
    console.log(
      "\n(--fix-notifications only runs together with --apply.)"
    );
  }

  console.log(
    `\n${APPLY ? "Applied" : "Dry run"} summary: ` +
      `${migratedProducts} product(s) converted, ` +
      `${untouchedProducts} marked only, ` +
      `${skippedProducts} already migrated, ` +
      `${migratedTransactions} transaction row(s) rescaled.`
  );

  if (!APPLY) {
    console.log("Nothing was written. Re-run with --apply to migrate.");
  }

  await mongoose.disconnect();
};

migrate().catch(async (error) => {
  console.error("Stock unit migration failed:", error.message);

  await mongoose.disconnect();

  process.exit(1);
});
