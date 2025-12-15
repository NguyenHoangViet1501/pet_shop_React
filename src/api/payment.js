import { apiFetch } from "../utils/api";

export const paymentAPI = {
  createVnpayPayment: (orderId, token) => {
    return apiFetch(`/v1/payment/create-payment?orderId=${orderId}`, {
      method: "POST",
      body: {
        orderId: orderId,
      },
      token,
    });
  },
};
