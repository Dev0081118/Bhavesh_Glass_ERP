const mongoose = require("mongoose");

const referenceMappings = {
  supplierId: "supplier",
  productId: "product",
  customerId: "customer",
  managerId: "manager",
  saleBillId: "saleBill",
  dispatchId: "dispatch",
  paymentId: "payment",
  lrId: "lr",
  partyId: "party",
};

const normalizePayload = (payload, options = {}) => {
  const normalized = { ...payload };

  Object.entries(referenceMappings).forEach(([frontendKey, modelKey]) => {
    if (normalized[frontendKey] && !normalized[modelKey]) {
      normalized[modelKey] = normalized[frontendKey];
    }
    delete normalized[frontendKey];
  });

  if (Array.isArray(normalized.items)) {
    normalized.items = normalized.items.map((item) => {
      const nextItem = { ...item };
      if (nextItem.productId && !nextItem.product) nextItem.product = nextItem.productId;
      delete nextItem.productId;
      delete nextItem.name;
      delete nextItem.sku;
      return nextItem;
    });
  }

  if (Array.isArray(normalized.rawMaterials)) {
    normalized.rawMaterials = normalized.rawMaterials.map((item) => ({
      ...item,
      product: item.product || item.productId,
      productId: undefined,
      name: undefined,
    }));
  }

  if (options.stringReferenceId) {
    normalized.referenceId = normalized.referenceId
      ? String(normalized.referenceId)
      : normalized.referenceId;
  }

  return normalized;
};

const createResourceController = (Model, options = {}) => {
  const list = async (req, res) => {
    const filter = options.listFilter ? options.listFilter(req) : {};
    let query = Model.find(filter).sort({ createdAt: -1 });

    if (options.populate) {
      options.populate.forEach((path) => {
        query = query.populate(path);
      });
    }

    const documents = await query;
    return res.json({ data: documents });
  };

  const getOne = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const document = await Model.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Record not found." });
    }

    return res.json({ data: document });
  };

  const create = async (req, res) => {
    let payload = normalizePayload(req.body, options);

    /*
     * Optional beforeCreate hook (e.g. SaleBill captures a billing
     * snapshot from the global System Settings). Runs after payload
     * normalization and receives the already-validated req.user.
     */
    if (options.beforeCreate) {
      payload = (await options.beforeCreate(req, payload)) || payload;
    }

    const document = await Model.create({
      ...payload,
      ...(options.createdBy ? { createdBy: req.user._id } : {}),
    });
    return res.status(201).json({ data: document });
  };

  const update = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const document = await Model.findByIdAndUpdate(
      req.params.id,
      normalizePayload(req.body, options),
      {
      new: true,
      runValidators: true,
      }
    );

    if (!document) {
      return res.status(404).json({ message: "Record not found." });
    }

    return res.json({ data: document });
  };

  const remove = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Record not found." });
    }

    return res.json({ message: "Record deleted successfully." });
  };

  return { list, getOne, create, update, remove };
};

module.exports = { createResourceController };
