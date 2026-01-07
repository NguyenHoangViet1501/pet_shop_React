import { apiFetch } from "../utils/api";

export const orderAPI = {
  createOrder: async (payload, token) => {
    return apiFetch("/v1/orders/create", {
      method: "POST",
      body: payload,
      token,
    });
  },
  checkStock: async (payload, token) => {
    return apiFetch("/v1/orders/check-stock", {
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
    if (params.orderCode) {
      queryParams.append("orderCode", params.orderCode);
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

  getOrderDetail: async (id, token) => {
    return apiFetch(`/v1/orders/detail/${id}`, {
      method: "GET",
      token,
    });
  },

  updatePaymentMethod: async (orderId, paymentMethod, token) => {
    const queryParams = new URLSearchParams();
    queryParams.append("method", paymentMethod);

    return apiFetch(
      `/v1/orders/${orderId}/payment-method?${queryParams.toString()}`,
      {
        method: "PUT",
        token,
      }
    );
  },
};
