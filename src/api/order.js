import { apiFetch } from "../utils/api";

export const orderAPI = {
  createOrder: async (payload, token) => {
    return apiFetch("/v1/orders/create", {
      method: "POST",
      body: payload,
      token,
    });
  },

  getMyOrders: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("pageNumber", params.pageNumber || 1);
    queryParams.append("size", params.size || 5);

    if (params.status) {
      queryParams.append("status", params.status);
    }

    return apiFetch(`/v1/orders?${queryParams.toString()}`, {
      method: "GET",
      token,
    });
  },

  cancelOrder: async (orderCode, token) => {
    return apiFetch(`/v1/orders/cancel/${orderCode}`, {
      method: "PUT",
      token,
    });
  },
};
