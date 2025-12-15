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
    const queryParams = new URLSearchParams({
      pageNumber: params.pageNumber || 1,
      size: params.size || 5,
      ...params,
    }).toString();
    return apiFetch(`/v1/orders?${queryParams}`, {
      method: "GET",
      token,
    });
  },
};
