const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const loginUser = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getAccessUsers = (token) =>
  request("/access/users", { token });

export const updateAccessUser = (token, userId, access) =>
  request(`/access/users/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(access),
  });

export const listStaff = (token) => request("/staff", { token });
export const getOverview = (token) => request("/overview", { token });

export const createStaff = (token, data) =>
  request("/staff", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateStaff = (token, userId, data) =>
  request(`/staff/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const deleteStaff = (token, userId) =>
  request(`/staff/${userId}`, { method: "DELETE", token });

export const listResource = (token, resource) =>
  request(`/${resource}`, { token });

export const createResource = (token, resource, data) =>
  request(`/${resource}`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateResource = (token, resource, id, data) =>
  request(`/${resource}/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const deleteResource = (token, resource, id) =>
  request(`/${resource}/${id}`, {
    method: "DELETE",
    token,
  });
