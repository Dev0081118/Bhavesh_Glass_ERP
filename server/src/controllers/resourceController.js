const mongoose =
  require("mongoose");

const {
  buildOwnershipFilter,
  mergeFilters,
  enforceAssignmentScope,
} = require(
  "../services/dataScopeService"
);

const referenceMappings = {
  supplierId:
    "supplier",

  productId:
    "product",

  customerId:
    "customer",

  managerId:
    "manager",

  assignedToId:
    "assignedTo",

  saleBillId:
    "saleBill",

  dispatchId:
    "dispatch",

  paymentId:
    "payment",

  lrId:
    "lr",

  partyId:
    "party",

  receivedById:
    "receivedBy",
};

const normalizePayload =
  (
    payload,
    options = {}
  ) => {
    const normalized = {
      ...payload,
    };

    /*
     * Never trust a client-supplied creator.
     */
    delete normalized.createdBy;

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
          ] !==
            undefined &&
          normalized[
            modelKey
          ] ===
            undefined
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
            delete nextItem.available;
            delete nextItem.stock;

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
            delete nextItem.sku;
            delete nextItem.available;
            delete nextItem.shortage;

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

const applyPopulate =
  (
    query,
    populate = []
  ) => {
    let result =
      query;

    (
      populate ||
      []
    ).forEach(
      (config) => {
        result =
          result.populate(
            config
          );
      }
    );

    return result;
  };

const assertWriteRole =
  (
    req,
    options
  ) => {
    if (
      !Array.isArray(
        options.writeRoles
      ) ||
      options.writeRoles.length ===
        0
    ) {
      return;
    }

    if (
      !options.writeRoles.includes(
        req.user.role
      )
    ) {
      const error =
        new Error(
          "You do not have permission to modify this resource."
        );

      error.status =
        403;

      throw error;
    }
  };

const createResourceController =
  (
    Model,
    options = {}
  ) => {
    const getScopeFilter =
      async (
        req
      ) =>
        options.scopePolicy
          ? buildOwnershipFilter(
              req.user,
              options.scopePolicy
            )
          : {};

    const populateDocument =
      async (
        filter
      ) => {
        let query =
          Model.findOne(
            filter
          );

        query =
          applyPopulate(
            query,
            options.populate
          );

        return query;
      };

    const list =
      async (
        req,
        res
      ) => {
        try {
          const customFilter =
            options.listFilter
              ? await options.listFilter(
                  req
                )
              : {};

          const scopeFilter =
            await getScopeFilter(
              req
            );

          const filter =
            mergeFilters(
              customFilter,
              scopeFilter
            );

          let query =
            Model.find(
              filter
            ).sort({
              createdAt:
                -1,
            });

          query =
            applyPopulate(
              query,
              options.populate
            );

          const documents =
            await query;

          return res.json({
            data:
              documents,
          });
        } catch (error) {
          console.error(
            "resource list error:",
            error
          );

          return res
            .status(
              error.status ||
                500
            )
            .json({
              message:
                error.message ||
                "Unable to load records.",
            });
        }
      };

    const getOne =
      async (
        req,
        res
      ) => {
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

          const scopeFilter =
            await getScopeFilter(
              req
            );

          const document =
            await populateDocument(
              mergeFilters(
                {
                  _id:
                    req.params.id,
                },
                scopeFilter
              )
            );

          if (!document) {
            return res
              .status(404)
              .json({
                message:
                  "Record not found or you do not have access to it.",
              });
          }

          return res.json({
            data:
              document,
          });
        } catch (error) {
          return res
            .status(
              error.status ||
                500
            )
            .json({
              message:
                error.message ||
                "Unable to load record.",
            });
        }
      };

    const create =
      async (
        req,
        res
      ) => {
        let document =
          null;

        try {
          assertWriteRole(
            req,
            options
          );

          let payload =
            normalizePayload(
              req.body,
              options
            );

          payload =
            await enforceAssignmentScope(
              req.user,
              payload,
              options.scopePolicy,
              {
                isCreate:
                  true,
              }
            );

          if (
            options.beforeCreate
          ) {
            payload =
              (
                await options.beforeCreate(
                  req,
                  payload
                )
              ) ||
              payload;
          }

          document =
            await Model.create({
              ...payload,

              ...(
                options.createdBy
                  ? {
                      createdBy:
                        req.user._id,
                    }
                  : {}
              ),
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

          const populated =
            await populateDocument({
              _id:
                document._id,
            });

          return res
            .status(201)
            .json({
              data:
                populated ||
                document,
            });
        } catch (error) {
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
            .status(
              error.status ||
                400
            )
            .json({
              message:
                error.message ||
                "Unable to create record.",
            });
        }
      };

    const update =
      async (
        req,
        res
      ) => {
        try {
          assertWriteRole(
            req,
            options
          );

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

          const scopeFilter =
            await getScopeFilter(
              req
            );

          const previous =
            await Model.findOne(
              mergeFilters(
                {
                  _id:
                    req.params.id,
                },
                scopeFilter
              )
            );

          if (!previous) {
            return res
              .status(404)
              .json({
                message:
                  "Record not found or you do not have access to it.",
              });
          }

          let payload =
            normalizePayload(
              req.body,
              options
            );

          payload =
            await enforceAssignmentScope(
              req.user,
              payload,
              options.scopePolicy,
              {
                isCreate:
                  false,
              }
            );

          if (
            options.beforeUpdate
          ) {
            payload =
              (
                await options.beforeUpdate(
                  req,
                  payload,
                  previous
                )
              ) ||
              payload;
          }

          const document =
            await Model.findByIdAndUpdate(
              previous._id,

              payload,

              {
                new:
                  true,

                runValidators:
                  true,
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
          } catch (
            hookError
          ) {
            await Model.replaceOne(
              {
                _id:
                  previous._id,
              },

              previous.toObject()
            );

            throw hookError;
          }

          const populated =
            await populateDocument({
              _id:
                document._id,
            });

          return res.json({
            data:
              populated ||
              document,
          });
        } catch (error) {
          return res
            .status(
              error.status ||
                400
            )
            .json({
              message:
                error.message ||
                "Unable to update record.",
            });
        }
      };

    const remove =
      async (
        req,
        res
      ) => {
        try {
          assertWriteRole(
            req,
            options
          );

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

          const scopeFilter =
            await getScopeFilter(
              req
            );

          const document =
            await Model.findOne(
              mergeFilters(
                {
                  _id:
                    req.params.id,
                },
                scopeFilter
              )
            );

          if (!document) {
            return res
              .status(404)
              .json({
                message:
                  "Record not found or you do not have access to it.",
              });
          }

          if (
            options.beforeDelete
          ) {
            await options.beforeDelete(
              req,
              document
            );
          }

          await document.deleteOne();

          if (
            options.afterDelete
          ) {
            await options.afterDelete(
              req,
              document
            );
          }

          return res.json({
            message:
              "Record deleted successfully.",
          });
        } catch (error) {
          return res
            .status(
              error.status ||
                400
            )
            .json({
              message:
                error.message ||
                "Unable to delete record.",
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