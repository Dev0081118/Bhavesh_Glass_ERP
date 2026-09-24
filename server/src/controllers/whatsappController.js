const mongoose =
  require("mongoose");

const {
  Customer,
  Product,
  WhatsAppShare,
} = require("../models");

const {
  normalizePhone,
} = require(
  "../utils/phone"
);

const {
  buildOwnershipFilter,
  mergeFilters,
} = require(
  "../services/dataScopeService"
);

const uniqueIds =
  (values = []) =>
    [
      ...new Set(
        values.map(
          String
        )
      ),
    ];

const validateIds =
  (ids) =>
    ids.every(
      (id) =>
        mongoose.isValidObjectId(
          id
        )
    );

const serializeCustomer =
  (customer) => ({
    id:
      customer._id.toString(),

    name:
      customer.name,

    companyName:
      customer.companyName ||
      "",

    phone:
      customer.phone,

    email:
      customer.email ||
      "",

    assignedTo:
      customer.assignedTo
        ? {
            id:
              customer
                .assignedTo
                ._id?.toString() ||
              customer.assignedTo.toString(),

            name:
              customer
                .assignedTo
                .name ||
              "",
          }
        : null,
  });

const serializeProductForWhatsApp =
  (product) => ({
    id:
      product._id.toString(),

    name:
      product.name,

    sku:
      product.sku,

    category:
      product.category ||
      "",

    subCategory:
      product.subCategory ||
      "",

    type:
      product.type ||
      "",

    material:
      product.material ||
      "",

    description:
      product.description ||
      "",

    sellingPrice:
      Number(
        product.sellingPrice ||
          0
      ),

    wholesalePrice:
      Number(
        product.wholesalePrice ||
          0
      ),

    gst:
      Number(
        product.gst ||
          0
      ),

    hsnCode:
      product.hsnCode ||
      "",

    images: (
      product.media ||
      []
    )
      .filter(
        (item) =>
          item.type ===
          "image"
      )
      .map(
        (item) => ({
          fileName:
            item.fileName,

          mimeType:
            item.mimeType,

          dataUrl:
            item.dataUrl,
        })
      ),
  });

const getCustomerScope =
  (user) =>
    buildOwnershipFilter(
      user,
      {
        ownershipFields: [
          "createdBy",
          "assignedTo",
        ],
      }
    );

const listWhatsAppCustomers =
  async (
    req,
    res
  ) => {
    try {
      const scope =
        await getCustomerScope(
          req.user
        );

      const customers =
        await Customer.find(
          mergeFilters(
            scope,
            {
              status:
                "Active",
            }
          )
        )
          .select(
            "name companyName phone email assignedTo status createdBy"
          )
          .populate(
            "assignedTo",
            "name role department status"
          )
          .sort({
            name:
              1,
          });

      return res.json({
        data:
          customers,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load WhatsApp customers.",
        });
    }
  };

const listWhatsAppProducts =
  async (
    req,
    res
  ) => {
    try {
      const products =
        await Product.find({
          status:
            "Active",
        })
          .select(
            [
              "name",
              "sku",
              "category",
              "subCategory",
              "type",
              "material",
              "sellingPrice",
              "wholesalePrice",
              "gst",
              "hsnCode",
              "description",
              "media",
              "status",
            ].join(
              " "
            )
          )
          .sort({
            name:
              1,
          });

      return res.json({
        data:
          products,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load WhatsApp products.",
        });
    }
  };

const listShares =
  async (
    req,
    res
  ) => {
    try {
      const scope =
        await buildOwnershipFilter(
          req.user,
          {
            ownershipFields: [
              "requestedBy",
            ],
          }
        );

      const shares =
        await WhatsAppShare.find(
          scope
        )
          .populate(
            "customers",
            "name companyName phone"
          )
          .populate(
            "products",
            "name sku"
          )
          .populate(
            "requestedBy",
            "name role"
          )
          .sort({
            createdAt:
              -1,
          })
          .limit(
            50
          );

      return res.json({
        data:
          shares,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load WhatsApp share history.",
        });
    }
  };

const shareProducts =
  async (
    req,
    res
  ) => {
    let shareRecord =
      null;

    try {
      const {
        customerIds,
        productIds,
      } =
        req.body || {};

      if (
        !Array.isArray(
          customerIds
        ) ||
        customerIds.length ===
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "No customers selected.",
          });
      }

      if (
        !Array.isArray(
          productIds
        ) ||
        productIds.length ===
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "No products selected.",
          });
      }

      const cleanCustomerIds =
        uniqueIds(
          customerIds
        );

      const cleanProductIds =
        uniqueIds(
          productIds
        );

      if (
        !validateIds(
          cleanCustomerIds
        ) ||
        !validateIds(
          cleanProductIds
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "One or more selected IDs are invalid.",
          });
      }

      const scope =
        await getCustomerScope(
          req.user
        );

      const customers =
        await Customer.find(
          mergeFilters(
            scope,
            {
              _id: {
                $in:
                  cleanCustomerIds,
              },
            }
          )
        ).populate(
          "assignedTo",
          "name role department status"
        );

      if (
        customers.length !==
        cleanCustomerIds.length
      ) {
        return res
          .status(403)
          .json({
            message:
              "One or more selected customers are outside your permitted customer scope.",
          });
      }

      const inactiveCustomer =
        customers.find(
          (customer) =>
            customer.status !==
            "Active"
        );

      if (
        inactiveCustomer
      ) {
        return res
          .status(400)
          .json({
            message:
              "One or more selected customers are inactive.",
          });
      }

      const invalidPhone =
        customers.find(
          (customer) =>
            !normalizePhone(
              customer.phone
            )
        );

      if (invalidPhone) {
        return res
          .status(400)
          .json({
            message:
              `${invalidPhone.name} does not have a valid WhatsApp number.`,
          });
      }

      const products =
        await Product.find({
          _id: {
            $in:
              cleanProductIds,
          },

          status:
            "Active",
        });

      if (
        products.length !==
        cleanProductIds.length
      ) {
        return res
          .status(404)
          .json({
            message:
              "One or more selected products were not found or are inactive.",
          });
      }

      shareRecord =
        await WhatsAppShare.create({
          customers:
            cleanCustomerIds,

          products:
            cleanProductIds,

          requestedBy:
            req.user._id,

          status:
            "Pending",

          customerCount:
            customers.length,

          productCount:
            products.length,
        });

      const webhookUrl =
        process.env
          .N8N_WHATSAPP_WEBHOOK_URL;

      if (!webhookUrl) {
        shareRecord.status =
          "Failed";

        shareRecord.errorMessage =
          "WhatsApp automation is not configured.";

        await shareRecord.save();

        return res
          .status(503)
          .json({
            message:
              "WhatsApp automation is not configured.",
          });
      }

      const payload = {
        event:
          "PRODUCT_SHARE",

        source:
          "BHAVESH_GLASS_ERP",

        requestedAt:
          new Date().toISOString(),

        requestedBy: {
          id:
            req.user._id.toString(),

          name:
            req.user.name,

          role:
            req.user.role,
        },

        customers:
          customers.map(
            serializeCustomer
          ),

        products:
          products.map(
            serializeProductForWhatsApp
          ),
      };

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          20000
        );

      let webhookResponse;

      try {
        const headers = {
          "Content-Type":
            "application/json",
        };

        if (
          process.env
            .N8N_WHATSAPP_WEBHOOK_SECRET
        ) {
          headers[
            "X-ERP-Webhook-Secret"
          ] =
            process.env
              .N8N_WHATSAPP_WEBHOOK_SECRET;
        }

        webhookResponse =
          await fetch(
            webhookUrl,
            {
              method:
                "POST",

              headers,

              body:
                JSON.stringify(
                  payload
                ),

              signal:
                controller.signal,
            }
          );
      } finally {
        clearTimeout(
          timeout
        );
      }

      const responseText =
        await webhookResponse.text();

      let responseBody =
        null;

      try {
        responseBody =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        responseBody = {
          message:
            responseText.slice(
              0,
              1000
            ),
        };
      }

      if (
        !webhookResponse.ok
      ) {
        shareRecord.status =
          "Failed";

        shareRecord.errorMessage =
          "WhatsApp automation returned an error.";

        shareRecord.n8nResponse =
          responseBody;

        await shareRecord.save();

        return res
          .status(502)
          .json({
            message:
              "Unable to send products to WhatsApp automation.",
          });
      }

      shareRecord.status =
        "Sent";

      shareRecord.n8nResponse =
        responseBody;

      await shareRecord.save();

      return res.json({
        success:
          true,

        message:
          "Products shared successfully.",

        customerCount:
          customers.length,

        productCount:
          products.length,
      });
    } catch (error) {
      console.error(
        "shareProducts error:",
        error
      );

      if (shareRecord) {
        try {
          shareRecord.status =
            "Failed";

          shareRecord.errorMessage =
            error.name ===
            "AbortError"
              ? "WhatsApp automation request timed out."
              : "Unable to complete WhatsApp product sharing.";

          await shareRecord.save();
        } catch (
          historyError
        ) {
          console.error(
            "Unable to update WhatsApp share history:",
            historyError.message
          );
        }
      }

      if (
        error.name ===
        "AbortError"
      ) {
        return res
          .status(504)
          .json({
            message:
              "WhatsApp automation timed out.",
          });
      }

      return res
        .status(502)
        .json({
          message:
            "Unable to send products to WhatsApp automation.",
        });
    }
  };

module.exports = {
  listWhatsAppCustomers,
  listWhatsAppProducts,
  listShares,
  shareProducts,
};