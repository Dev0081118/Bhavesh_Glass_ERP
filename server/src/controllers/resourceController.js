const mongoose = require(
  "mongoose"
);

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

const normalizePayload = (
  payload,
  options = {}
) => {
  const normalized = {
    ...payload,
  };

  Object.entries(
    referenceMappings
  ).forEach(
    ([
      frontendKey,
      modelKey,
    ]) => {
      if (
        normalized[
          frontendKey
        ] &&
        !normalized[
          modelKey
        ]
      ) {
        normalized[
          modelKey
        ] =
          normalized[
            frontendKey
          ];
      }

      delete normalized[
        frontendKey
      ];
    }
  );

  if (
    Array.isArray(
      normalized.items
    )
  ) {
    normalized.items =
      normalized.items.map(
        (item) => {
          const nextItem = {
            ...item,
          };

          if (
            nextItem.productId &&
            !nextItem.product
          ) {
            nextItem.product =
              nextItem.productId;
          }

          delete nextItem.productId;
          delete nextItem.name;
          delete nextItem.sku;

          return nextItem;
        }
      );
  }

  if (
    Array.isArray(
      normalized.rawMaterials
    )
  ) {
    normalized.rawMaterials =
      normalized.rawMaterials.map(
        (item) => {
          const nextItem = {
            ...item,

            product:
              item.product ||
              item.productId,
          };

          delete nextItem.productId;
          delete nextItem.name;

          return nextItem;
        }
      );
  }

  if (
    options.stringReferenceId
  ) {
    normalized.referenceId =
      normalized.referenceId
        ? String(
            normalized.referenceId
          )
        : normalized.referenceId;
  }

  return normalized;
};

const createResourceController =
  (
    Model,
    options = {}
  ) => {
    const list =
      async (req, res) => {
        try {
          const filter =
            options.listFilter
              ? options.listFilter(
                  req
                )
              : {};

          let query =
            Model.find(
              filter
            ).sort({
              createdAt: -1,
            });

          if (
            options.populate
          ) {
            options.populate.forEach(
              (path) => {
                query =
                  query.populate(
                    path
                  );
              }
            );
          }

          const documents =
            await query;

          return res.json({
            data: documents,
          });
        } catch (error) {
          return res
            .status(500)
            .json({
              message:
                error.message ||
                "Unable to load records.",
            });
        }
      };

    const getOne =
      async (req, res) => {
        try {
          if (
            !mongoose.isValidObjectId(
              req.params.id
            )
          ) {
            return res
              .status(400)
              .json({
                message:
                  "Invalid record ID.",
              });
          }

          const document =
            await Model.findById(
              req.params.id
            );

          if (!document) {
            return res
              .status(404)
              .json({
                message:
                  "Record not found.",
              });
          }

          return res.json({
            data: document,
          });
        } catch (error) {
          return res
            .status(500)
            .json({
              message:
                error.message,
            });
        }
      };

    const create =
      async (req, res) => {
        let document = null;

        try {
          let payload =
            normalizePayload(
              req.body,
              options
            );

          if (
            options.beforeCreate
          ) {
            payload =
              (await options.beforeCreate(
                req,
                payload
              )) || payload;
          }

          document =
            await Model.create({
              ...payload,

              ...(options.createdBy
                ? {
                    createdBy:
                      req.user._id,
                  }
                : {}),
            });

          if (
            options.afterCreate
          ) {
            await options.afterCreate(
              req,
              document,
              null
            );
          }

          return res
            .status(201)
            .json({
              data: document,
            });
        } catch (error) {
          /*
           * If stock synchronisation
           * fails, don't keep a newly
           * created broken resource.
           */
          if (
            document?._id &&
            options.afterCreate
          ) {
            await Model.findByIdAndDelete(
              document._id
            ).catch(
              () => {}
            );
          }

          return res
            .status(400)
            .json({
              message:
                error.message ||
                "Unable to create record.",
            });
        }
      };

    const update =
      async (req, res) => {
        try {
          if (
            !mongoose.isValidObjectId(
              req.params.id
            )
          ) {
            return res
              .status(400)
              .json({
                message:
                  "Invalid record ID.",
              });
          }

          const previous =
            await Model.findById(
              req.params.id
            );

          if (!previous) {
            return res
              .status(404)
              .json({
                message:
                  "Record not found.",
              });
          }

          const document =
            await Model.findByIdAndUpdate(
              req.params.id,

              normalizePayload(
                req.body,
                options
              ),

              {
                new: true,
                runValidators: true,
              }
            );

          try {
            if (
              options.afterUpdate
            ) {
              await options.afterUpdate(
                req,
                document,
                previous
              );
            }
          } catch (hookError) {
            /*
             * Restore original resource
             * if inventory sync fails.
             */
            await Model.replaceOne(
              {
                _id:
                  previous._id,
              },

              previous.toObject()
            );

            throw hookError;
          }

          return res.json({
            data: document,
          });
        } catch (error) {
          return res
            .status(400)
            .json({
              message:
                error.message ||
                "Unable to update record.",
            });
        }
      };

    const remove =
      async (req, res) => {
        try {
          if (
            !mongoose.isValidObjectId(
              req.params.id
            )
          ) {
            return res
              .status(400)
              .json({
                message:
                  "Invalid record ID.",
              });
          }

          const document =
            await Model.findByIdAndDelete(
              req.params.id
            );

          if (!document) {
            return res
              .status(404)
              .json({
                message:
                  "Record not found.",
              });
          }

          return res.json({
            message:
              "Record deleted successfully.",
          });
        } catch (error) {
          return res
            .status(500)
            .json({
              message:
                error.message,
            });
        }
      };

    return {
      list,
      getOne,
      create,
      update,
      remove,
    };
  };

module.exports = {
  createResourceController,
};