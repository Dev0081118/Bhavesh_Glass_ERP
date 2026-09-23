const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api";

const request = async (
  path,
  token,
  options = {}
) => {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),

          ...(options.headers ||
            {}),
        },
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Request failed."
    );
  }

  return data;
};

export const getPurchaseLookups =
  (
    token
  ) =>
    request(
      "/purchases/lookups",
      token
    );

export const createQuickSupplier =
  (
    token,
    payload
  ) =>
    request(
      "/purchases/suppliers",
      token,
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );

export const getProductionLookups =
  (
    token
  ) =>
    request(
      "/production/lookups",
      token
    );

export const createQuickFinishedProduct =
  (
    token,
    payload
  ) =>
    request(
      "/production/finished-products",
      token,
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );