import React from "react";
import { Link } from "react-router-dom";

const CartSummary = () => {
  const { data: cart } = useCartQuery();

  // ✅ Tính subtotal từ cart (React Query)
  const subtotal =
    cart?.items?.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ) || 0;

  const shipping = 30000;
  const total = subtotal + shipping;

  return (
    <div className="card">
      <div className="card-body">
        <h5>Tóm tắt đơn hàng</h5>

        <div className="d-flex justify-content-between mb-2">
          <span>Tạm tính:</span>
          <span>
            {subtotal.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Phí vận chuyển:</span>
          <span>
            {shipping.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        <hr />

        <div className="d-flex justify-content-between fw-bold">
          <span>Tổng cộng:</span>
          <span>
            {total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        <Link
          to="/checkout"
          className={`btn btn-primary w-100 mt-3 ${
            !hasSelectedItems ? "disabled" : ""
          }`}
          style={{
            pointerEvents: !hasSelectedItems ? "none" : "auto",
            opacity: !hasSelectedItems ? 0.6 : 1,
          }}
          onClick={(e) => {
            if (!hasSelectedItems) {
              e.preventDefault();
            }
          }}
        >
          Thanh toán
        </Link>

        <Link to="/products" className="btn btn-outline-primary w-100 mt-2">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
