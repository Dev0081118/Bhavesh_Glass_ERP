/**
 * n8n WhatsApp webhook integration.
 *
 * The webhook URL / secret live only in server env
 * variables — they are never exposed to the frontend.
 *
 * Required env:
 *   N8N_WHATSAPP_WEBHOOK_URL
 * Optional env:
 *   N8N_WHATSAPP_WEBHOOK_SECRET  -> sent as
 *                                   "X-ERP-Webhook-Secret"
 *                                   header so n8n can
 *                                   reject non-ERP calls.
 */
const WEBHOOK_TIMEOUT_MS = 25000;

const isWhatsAppConfigured = () =>
  Boolean(process.env.N8N_WHATSAPP_WEBHOOK_URL);

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (
  url,
  options = {},
  timeoutMs = WEBHOOK_TIMEOUT_MS
) => {
  if (typeof AbortController === "undefined") {
    // Node < 18 fallback: global fetch is unavailable
    // anyway in that case, so throw a clear error.
    throw new Error(
      "Global fetch/AbortController is not available in this Node runtime."
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Explicit outbound serializer — only customer-facing
 * fields leave the ERP. purchasePrice / cost / supplier
 * data must never leak into this payload.
 */
const serializeProductForWhatsApp = (product) => ({
  id: product._id,
  name: product.name,
  sku: product.sku,
  category: product.category,
  subCategory: product.subCategory,
  type: product.type,
  material: product.material,
  description: product.description,
  sellingPrice: product.sellingPrice,
  gst: product.gst,
  hsnCode: product.hsnCode,
  images: (product.media || [])
    .filter(
      (item) =>
        item &&
        item.type === "image" &&
        item.dataUrl
    )
    .map((item) => ({
      fileName: item.fileName || "",
      mimeType: item.mimeType || "",
      dataUrl: item.dataUrl,
    })),
});

const serializeCustomerForWhatsApp = (customer) => ({
  id: customer._id,
  name: customer.name,
  companyName: customer.companyName || "",
  phone: customer.phone,
  email: customer.email || "",
  assignedTo: customer.assignedTo
    ? {
        id: customer.assignedTo._id,
        name: customer.assignedTo.name,
      }
    : null,
});

/**
 * POST the structured payload to n8n.
 * Resolves { ok, status, data } — never throws for
 * HTTP-level failures so callers control the response.
 */
const sendToN8N = async (payload) => {
  const webhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      ok: false,
      unconfigured: true,
      status: 0,
      data: null,
    };
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.N8N_WHATSAPP_WEBHOOK_SECRET) {
    headers["X-ERP-Webhook-Secret"] =
      process.env.N8N_WHATSAPP_WEBHOOK_SECRET;
  }

  try {
    const response = await fetchWithTimeout(
      webhookUrl,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    // Timeout / network failure. Log reason only —
    // never the URL, which may contain secrets.
    console.error(
      "n8n webhook request failed:",
      error?.name === "AbortError"
        ? `timed out after ${WEBHOOK_TIMEOUT_MS}ms`
        : error?.message || "network error"
    );

    return {
      ok: false,
      unconfigured: false,
      status: 0,
      data: null,
    };
  }
};

module.exports = {
  isWhatsAppConfigured,
  serializeProductForWhatsApp,
  serializeCustomerForWhatsApp,
  sendToN8N,
  sleep,
  WEBHOOK_TIMEOUT_MS,
};
