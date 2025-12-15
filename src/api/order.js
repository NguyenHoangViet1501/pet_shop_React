import { apiFetch } from "../utils/api";

export const orderAPI = {
  createOrder: async (payload, token) => {
    return apiFetch("/v1/orders/create", {
      method: "POST",
      body: payload,
      token,
    });
  },
};
