import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

const CartItem = ({ item, isSelected, onToggleSelect }) => {
  const { updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const performDelete = async () => {
    try {
      setIsUpdating(true);
      await removeItem(item.id);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    } catch (error) {
      console.error("Error removing item:", error);
      showToast("Không thể xóa sản phẩm. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = async () => {
    if (isUpdating) return;
    
    const newQty = item.quantity - 1;
    
    // Nếu quantity về 0, hiển thị modal xác nhận xóa
    if (newQty === 0) {
      setShowDeleteModal(true);
      return;
    }

    // Nếu quantity > 0, gọi API với quantity = -1
    try {
      setIsUpdating(true);
      await updateQuantity(item.productVariantId, -1);
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("Không thể cập nhật số lượng. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      // Gọi API với quantity = +1
      await updateQuantity(item.productVariantId, 1);
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("Không thể cập nhật số lượng. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = async (e) => {
    if (isUpdating) return;
    
    const value = parseInt(e.target.value, 10);
    if (Number.isNaN(value) || value < 0) return;

    // Nếu quantity về 0, hiển thị modal xác nhận xóa
    if (value === 0) {
      setShowDeleteModal(true);
      // Reset về giá trị cũ tạm thời, sẽ xóa sau khi xác nhận
      e.target.value = item.quantity;
      return;
    }

    // Tính delta giữa giá trị mới và giá trị cũ
    const delta = value - item.quantity;
    if (delta === 0) return; // Không có thay đổi

    try {
      setIsUpdating(true);
      await updateQuantity(item.productVariantId, delta);
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("Không thể cập nhật số lượng. Vui lòng thử lại!", "error");
      e.target.value = item.quantity; // Reset về giá trị cũ
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    if (isUpdating) return;
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
          className="form-check-input"
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          checked={isSelected || false}
          onChange={(e) => onToggleSelect && onToggleSelect(item.id, e.target.checked)}
        />
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
      </div>

      {/* Quantity */}
      <div className="d-flex align-items-center me-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleDecrease}
          disabled={isUpdating}
          style={{ width: 32, height: 32, padding: 0 }}
        >
          −
        </button>

        <input
          type="number"
          min="0"
          className="form-control form-control-sm mx-2 text-center"
          style={{ width: 60, height: 32 }}
          value={item.quantity}
          onChange={handleChange}
          disabled={isUpdating}
        />

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleIncrease}
          disabled={isUpdating}
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
          disabled={isUpdating}
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
