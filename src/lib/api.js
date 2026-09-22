const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api";

const request = async (
  path,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        "Content-Type":
          "application/json",

        ...(options.token
          ? {
              Authorization: `Bearer ${options.token}`,
            }
          : {}),

        ...options.headers,
      },

      ...options,
    }
  );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "Request failed."
    );

    error.status =
      response.status;

    error.code = data.code;

    throw error;
  }

  return data;
};

export const loginUser = (
  email,
  password
) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

export const getCurrentUser = (
  token
) =>
  request("/auth/me", {
    token,
  });

export const getAccessUsers = (
  token
) =>
  request("/access/users", {
    token,
  });

export const updateAccessUser = (
  token,
  userId,
  access
) =>
  request(
    `/access/users/${userId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(access),
    }
  );

export const listStaff = (
  token
) =>
  request("/staff", {
    token,
  });

export const getOverview = (
  token
) =>
  request("/overview", {
    token,
  });

export const getAnalytics = (
  token
) =>
  request("/analytics", {
    token,
  });

export const getDashboardSummary = (
  token,
  range = "30d"
) =>
  request(
    `/dashboard/summary?range=${encodeURIComponent(
      range
    )}`,
    {
      token,
    }
  );

export const getSystemStatus = () =>
  request("/system/status");

export const updateKillSwitch = (
  token,
  isSystemActive,
  reason
) =>
  request("/system/kill-switch", {
    method: "PATCH",
    token,
    body: JSON.stringify({
      isSystemActive,
      reason,
    }),
  });

/*
 * GLOBAL SYSTEM SETTINGS
 * (theme / company stamp / terms & conditions)
 */
export const getSystemSettings = (token) =>
  request("/system/settings", {
    ...(token ? { token } : {}),
  });

export const updateSystemSettings = (
  token,
  settings
) =>
  request("/system/settings", {
    method: "PATCH",
    token,
    body: JSON.stringify(settings),
  });

/*
 * STAFF
 */

export const createStaff = (
  token,
  data
) =>
  request("/staff", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateStaff = (
  token,
  userId,
  data
) =>
  request(`/staff/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const updateStaffStatus = (
  token,
  userId,
  status
) =>
  request(`/staff/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      status,
    }),
  });

export const deleteStaff = (
  token,
  userId
) =>
  request(`/staff/${userId}`, {
    method: "DELETE",
    token,
  });

/*
 * GENERIC RESOURCES
 */

export const listResource = (
  token,
  resource
) =>
  request(`/${resource}`, {
    token,
  });

export const createResource = (
  token,
  resource,
  data
) =>
  request(`/${resource}`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateResource = (
  token,
  resource,
  id,
  data
) =>
  request(
    `/${resource}/${id}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }
  );

export const deleteResource = (
  token,
  resource,
  id
) =>
  request(
    `/${resource}/${id}`,
    {
      method: "DELETE",
      token,
    }
  );
  export const moveInventoryStock = (
  token,
  inventoryId,
  data
) =>
  request(
    `/inventory/${inventoryId}/movement`,
    {
      method: "POST",
      token,
      body: JSON.stringify(
        data
      ),
    }
  );

export const adjustInventoryStock = (
  token,
  inventoryId,
  data
) =>
  request(
    `/inventory/${inventoryId}/adjust`,
    {
      method: "POST",
      token,
      body: JSON.stringify(
        data
      ),
    }
  );

export const getInventoryMovements = (
  token,
  inventoryId
) =>
  request(
    `/inventory/${inventoryId}/movements`,
    {
      token,
    }
  );

export const getNotifications = (
  token
) =>
  request(
    "/notifications",
    {
      token,
    }
  );

export const markNotificationRead = (
  token,
  notificationId
) =>
  request(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    }
  );