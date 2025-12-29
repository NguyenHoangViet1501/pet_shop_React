import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

const CartItem = ({ item, isSelected, onToggleSelect }) => {
  const { updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inputValue, setInputValue] = useState(String(item.quantity));

  // Sync input khi item.quantity thay đổi từ cache
  useEffect(() => {
    setInputValue(String(item.quantity));
  }, [item.quantity]);

  const performDelete = () => {
    removeItem(item.id);
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
  };

  const handleDecrease = () => {
    const newQty = item.quantity - 1;

    // Nếu quantity về 0, hiển thị modal xác nhận xóa
    if (newQty === 0) {
      setShowDeleteModal(true);
      return;
    }

    // Gọi mutation với quantity = -1 (không chờ - optimistic update)
    updateQuantity(item.productVariantId, -1);
  };

  const handleIncrease = () => {
    // Gọi mutation với quantity = +1 (không chờ - optimistic update)
    updateQuantity(item.productVariantId, 1);
  };

  const handleChange = (e) => {
    const value = e.target.value;

    // Update local input state ngay (user thấy số mình nhập)
    setInputValue(value);

    // Cho phép input rỗng tạm thời (user đang xóa)
    if (value === "") {
      return;
    }

    const numValue = parseInt(value, 10);
    if (Number.isNaN(numValue) || numValue < 1) return;

    // Tính delta giữa giá trị mới và giá trị cũ
    const delta = numValue - item.quantity;
    if (delta === 0) return; // Không có thay đổi

    // Gọi mutation với delta (không chờ - optimistic update)
    updateQuantity(item.productVariantId, delta);
  };

  const handleBlur = (e) => {
    // Nếu input rỗng hoặc < 1, reset về giá trị cũ
    const value = parseInt(inputValue, 10);
    if (inputValue === "" || Number.isNaN(value) || value < 1) {
      setInputValue(String(item.quantity));
    }
  };

  const handleRemove = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await performDelete();
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={item.name}
      />
      <div className="d-flex align-items-center justify-content-between border-bottom py-3">
        {/* Checkbox */}
        <div className="me-3">
          <input
            type="checkbox"
            disabled={false}
            className="form-check-input"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            checked={isSelected || false}
            onChange={(e) =>
              onToggleSelect && onToggleSelect(item.id, e.target.checked)
            }
          />
          {console.log("item_id" + item.id)}
        </div>

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
          <div className="text-muted mt-1">
            <span className="fw-semibold">Kho:</span> {item.stockQuantity ?? 0}
          </div>
        </div>

        {/* Quantity */}
        <div className="d-flex align-items-center me-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDecrease}
            disabled={false}
            style={{ width: 32, height: 32, padding: 0 }}
          >
            −
          </button>

          <input
            type="number"
            min="0"
            className="form-control form-control-sm mx-2 text-center"
            style={{ width: 60, height: 32 }}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={false}
          />

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleIncrease}
            disabled={false}
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
            disabled={false}
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
    </>
  );
};

export default CartItem;
