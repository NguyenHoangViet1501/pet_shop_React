import React from "react";
import { useCart } from "../../context/CartContext";

const CartItem = ({ item }) => {
  // CartContext chỉ để GỌI ACTION
  const { updateQuantity, removeItem } = useCart();

  const handleDecrease = () => {
    const newQty = item.quantity - 1;
    if (newQty <= 0) return;
    updateQuantity(item.id, newQty);
  };

  const handleIncrease = () => {
    const newQty = item.quantity + 1;
    updateQuantity(item.id, newQty);
  };

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (Number.isNaN(value) || value <= 0) return;
    updateQuantity(item.id, value);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="d-flex align-items-center justify-content-between border-bottom py-3">
      {/* Ảnh */}
      <div className="me-3">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: 80, height: 80, objectFit: "cover" }}
            className="rounded"
          />
        )}
      </div>

      {/* Tên + giá */}
      <div className="flex-grow-1 me-3">
        <div className="fw-semibold mb-2">{item.name}</div>
        <div
          className="fw-bold"
          style={{ color: "var(--primary-orange)", fontSize: "1.1rem" }}
        >
          {item.price?.toLocaleString("vi-VN")} ₫
        </div>
      </div>

      {/* Variant */}
      <div className="me-3" style={{ minWidth: 150 }}>
        {item.variantName && (
          <div className="text-muted">
            <span className="fw-semibold">Phân loại:</span> {item.variantName}
          </div>
        )}
      </div>

      {/* Quantity */}
      <div className="d-flex align-items-center me-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleDecrease}
          disabled={item.quantity <= 1}
          style={{ width: 32, height: 32, padding: 0 }}
        >
          −
        </button>

        <input
          type="number"
          min="1"
          className="form-control form-control-sm mx-2 text-center"
          style={{ width: 60, height: 32 }}
          value={item.quantity}
          onChange={handleChange}
        />

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleIncrease}
          style={{ width: 32, height: 32, padding: 0 }}
        >
          +
        </button>
      </div>

      {/* Thành tiền + xoá */}
      <div className="text-end" style={{ minWidth: 120 }}>
        <div
          className="fw-bold mb-2"
          style={{ color: "var(--primary-orange)", fontSize: "1.1rem" }}
        >
          {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
        </div>
        <button
          className="btn btn-sm"
          onClick={handleRemove}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "4px 12px",
          }}
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default CartItem;
