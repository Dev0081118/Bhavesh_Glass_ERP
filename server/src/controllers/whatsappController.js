const mongoose = require("mongoose");

const {
  Customer,
  Product,
  WhatsAppShare,
} = require("../models");

const {
  normalizePhone,
} = require("../utils/phone");

const {
  buildOwnershipFilter,
  mergeFilters,
} = require(
  "../services/dataScopeService"
);

const uniqueIds = (
  values = []
) => [
  ...new Set(
    values.map(String)
  ),
];

const validateIds = (
  ids = []
) =>
  ids.every((id) =>
    mongoose.isValidObjectId(
      id
    )
  );

/*
 * ============================================
 * CUSTOMER SERIALIZER
 * ============================================
 */

const serializeCustomer = (
  customer
) => ({
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

/*
 * ============================================
 * PRODUCT SERIALIZER
 * ============================================
 *
 * IMPORTANT:
 *
 * Previously every base64 product image was
 * sent to n8n.
 *
 * That caused multi-MB webhook requests.
 *
 * We now send ONLY the primary/first image.
 *
 * The "images" array structure is preserved
 * for n8n backward compatibility.
 */

const serializeProductForWhatsApp =
  (product) => {
    const primaryImage =
      (
        product.media ||
        []
      ).find(
        (item) =>
          item &&
          item.type ===
            "image" &&
          item.dataUrl
      );

    return {
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

      images:
        primaryImage
          ? [
              {
                fileName:
                  primaryImage.fileName ||
                  "",

                mimeType:
                  primaryImage.mimeType ||
                  "",

                dataUrl:
                  primaryImage.dataUrl,
              },
            ]
          : [],
    };
  };

/*
 * ============================================
 * ROLE BASED CUSTOMER SCOPE
 * ============================================
 */

const getCustomerScope = (
  user
) =>
  buildOwnershipFilter(
    user,
    {
      ownershipFields: [
        "createdBy",
        "assignedTo",
      ],
    }
  );

/*
 * ============================================
 * CUSTOMERS
 * ============================================
 */

const listWhatsAppCustomers =
  async (req, res) => {
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
            name: 1,
          });

      return res.json({
        data:
          customers,
      });
    } catch (error) {
      console.error(
        "listWhatsAppCustomers error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load WhatsApp customers.",
        });
    }
  };

/*
 * ============================================
 * PRODUCTS
 * ============================================
 *
 * Keep your local inventory/filter enrichment
 * here if you already added it.
 *
 * This endpoint is NOT the n8n payload.
 */

const listWhatsAppProducts =
  async (req, res) => {
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
              "isFrame",
              "frameSize",
              "unit",
              "stockUnit",
              "minimumStockLevel",
              "location",
            ].join(" ")
          )
          .sort({
            name: 1,
          });

      return res.json({
        data:
          products,
      });
    } catch (error) {
      console.error(
        "listWhatsAppProducts error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load WhatsApp products.",
        });
    }
  };

/*
 * ============================================
 * SHARE HISTORY
 * ============================================
 */

const listShares =
  async (req, res) => {
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
          .limit(50);

      return res.json({
        data:
          shares,
      });
    } catch (error) {
      console.error(
        "listShares error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load WhatsApp share history.",
        });
    }
  };

/*
 * ============================================
 * SHARE PRODUCTS
 * ============================================
 */

const shareProducts =
  async (req, res) => {
    let shareRecord =
      null;

    console.log(
      "\n======================================"
    );

    console.log(
      "WHATSAPP SHARE CONTROLLER HIT"
    );

    console.log(
      "======================================"
    );

    try {
      const {
        customerIds,
        productIds,
      } =
        req.body || {};

      /*
       * Make sure frontend sends IDs only.
       */

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

      const invalidCustomerObject =
        customerIds.some(
          (item) =>
            item !== null &&
            typeof item ===
              "object"
        );

      const invalidProductObject =
        productIds.some(
          (item) =>
            item !== null &&
            typeof item ===
              "object"
        );

      if (
        invalidCustomerObject ||
        invalidProductObject
      ) {
        return res
          .status(400)
          .json({
            message:
              "WhatsApp sharing requires customer IDs and product IDs only.",
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

      console.log(
        "Customers selected:",
        cleanCustomerIds.length
      );

      console.log(
        "Products selected:",
        cleanProductIds.length
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

      /*
       * ======================================
       * ROLE BASED CUSTOMER SECURITY
       * ======================================
       */

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

      if (
        invalidPhone
      ) {
        return res
          .status(400)
          .json({
            message:
              `${invalidPhone.name} does not have a valid WhatsApp number.`,
          });
      }

      /*
       * ======================================
       * PRODUCTS
       * ======================================
       *
       * Load directly from Product.
       *
       * DO NOT reuse frontend enriched objects.
       */

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

      /*
       * ======================================
       * HISTORY RECORD
       * ======================================
       */

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

      /*
       * ======================================
       * WEBHOOK CONFIG
       * ======================================
       */

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

      /*
       * Do not print full webhook URL
       * because configuration may contain
       * sensitive information.
       */

      console.log(
        "n8n webhook configured:",
        true
      );

      /*
       * ======================================
       * BUILD PAYLOAD
       * ======================================
       */

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

      const payloadJson =
        JSON.stringify(
          payload
        );

      const payloadBytes =
        Buffer.byteLength(
          payloadJson,
          "utf8"
        );

      console.log(
        "n8n payload:",
        {
          customers:
            payload.customers.length,

          products:
            payload.products.length,

          sizeMB:
            (
              payloadBytes /
              1024 /
              1024
            ).toFixed(3),

          images:
            payload.products.map(
              (product) => ({
                sku:
                  product.sku,

                count:
                  product.images.length,
              })
            ),
        }
      );

      /*
       * ======================================
       * SEND TO N8N
       * ======================================
       */

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          25000
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
                payloadJson,

              signal:
                controller.signal,
            }
          );
      } catch (
        fetchError
      ) {
        console.error(
          "n8n network error:",
          fetchError.name,
          fetchError.message
        );

        if (
          shareRecord
        ) {
          shareRecord.status =
            "Failed";

          shareRecord.errorMessage =
            fetchError.name ===
            "AbortError"
              ? "WhatsApp automation timed out."
              : fetchError.message;

          await shareRecord.save();
        }

        if (
          fetchError.name ===
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
              "Unable to connect to WhatsApp automation.",

            details:
              fetchError.message,
          });
      } finally {
        clearTimeout(
          timeout
        );
      }

      /*
       * ======================================
       * READ N8N RESPONSE
       * ======================================
       */

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
          raw:
            responseText.slice(
              0,
              2000
            ),
        };
      }

      console.log(
        "N8N STATUS:",
        webhookResponse.status
      );

      console.log(
        "N8N RESPONSE:",
        responseBody
      );

      /*
       * ======================================
       * N8N FAILURE
       * ======================================
       */

      if (
        !webhookResponse.ok
      ) {
        shareRecord.status =
          "Failed";

        shareRecord.errorMessage =
          `WhatsApp automation returned HTTP ${webhookResponse.status}.`;

        shareRecord.n8nResponse =
          responseBody;

        await shareRecord.save();

        return res
          .status(502)
          .json({
            message:
              "Unable to send products to WhatsApp automation.",

            n8nStatus:
              webhookResponse.status,

            n8nResponse:
              responseBody,
          });
      }

      /*
       * ======================================
       * SUCCESS
       * ======================================
       */

      shareRecord.status =
        "Sent";

      shareRecord.n8nResponse =
        responseBody;

      await shareRecord.save();

      console.log(
        "WhatsApp share completed successfully."
      );

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

      if (
        shareRecord
      ) {
        try {
          shareRecord.status =
            "Failed";

          shareRecord.errorMessage =
            error.name ===
            "AbortError"
              ? "WhatsApp automation request timed out."
              : error.message ||
                "Unable to complete WhatsApp product sharing.";

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
        .status(500)
        .json({
          message:
            "Unexpected WhatsApp sharing error.",

          details:
            error.message,
        });
    }
  };

module.exports = {
  listWhatsAppCustomers,
  listWhatsAppProducts,
  listShares,
  shareProducts,
};