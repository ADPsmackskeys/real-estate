const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ------------------------------------
// Shared fetch helper
// ------------------------------------
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Request failed: ${res.status}`);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return null;

  return res.json();
}

// ------------------------------------
// PROPERTIES
// ------------------------------------
export const propertiesApi = {
  // getAll accepts an optional filters object:
  // { city, locality, type, status, minPrice, maxPrice, minBedrooms, minArea, maxArea, sortBy }
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    });
    const query = params.toString();
    return request(`/api/properties${query ? `?${query}` : ""}`);
  },

  getById: (id) => request(`/api/properties/${id}`),

  create: (data) =>
    request("/api/properties", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/api/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id) => request(`/api/properties/${id}`, { method: "DELETE" }),
};

// ------------------------------------
// FAVORITES
// ------------------------------------
export const favoritesApi = {
  getByUser: (userId) => request(`/api/favorites/${userId}`),

  add: (data) =>
    // data: { userId, propertyId, tag?, note? }
    request("/api/favorites", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    // data: { tag?, note? }
    request(`/api/favorites/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  remove: (userId, propertyId) =>
    request(`/api/favorites/${userId}/${propertyId}`, { method: "DELETE" }),
};

// ------------------------------------
// INQUIRIES
// ------------------------------------
export const inquiriesApi = {
  getByUser:  (userId)  => request(`/api/inquiries/user/${userId}`),
  getByAgent: (agentId) => request(`/api/inquiries/agent/${agentId}`),

  create: (data) =>
    // data: { userId, propertyId, agentId, message, preferredDate? }
    request("/api/inquiries", { method: "POST", body: JSON.stringify(data) }),

  updateStatus: (id, status) =>
    request(`/api/inquiries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id) => request(`/api/inquiries/${id}`, { method: "DELETE" }),
};

// ------------------------------------
// AGENTS
// ------------------------------------
export const agentsApi = {
  getAll:  ()   => request("/api/agents"),
  getById: (id) => request(`/api/agents/${id}`),
};

// ------------------------------------
// USERS
// ------------------------------------
export const usersApi = {
  getById:  (id)   => request(`/api/users/${id}`),
  register: (data) =>
    request("/api/users/register", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};