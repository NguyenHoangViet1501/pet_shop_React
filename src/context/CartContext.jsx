import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useAddToCart } from "../hooks/useAddToCart";
import { useBatchUpdateCartQuantity } from "../hooks/useBatchUpdateCartQuantity";
import { useDeleteCartItem } from "../hooks/useDeleteCartItem";

const CartContext = createContext();

/**
 * Hook dùng CartContext
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

/**
 * CartProvider
 * - Expose mutations từ React Query
 * - Tất cả logic được handle bởi custom hooks (optimistic update)
 * - Không giữ state, chỉ forward mutations
 */
export const CartProvider = ({ children }) => {
  const { token } = useAuth();

  // Lấy mutations từ custom hooks
  const addItemMutation = useAddToCart();
  const { batchUpdateQuantity } = useBatchUpdateCartQuantity();
  const deleteItemMutation = useDeleteCartItem();

  /**
   * ➕ Add item vào cart (với optimistic update)
   */
  const addItem = async (product) => {
    if (!token) {
      throw new Error("User not logged in");
    }

    return addItemMutation.mutateAsync(product);
  };

  /**
   * 🔄 Batch update quantity (với debounce 300ms)
   * @param {number} productVariantId
   * @param {number} quantityDelta
   */
  const updateQuantity = (productVariantId, quantityDelta) => {
    if (!token) {
      throw new Error("User not logged in");
    }

    batchUpdateQuantity(productVariantId, quantityDelta);
  };

  /**
   * ➖ Remove item khỏi cart
   * @param {number} cartItemId
   */
  const removeItem = async (cartItemId) => {
    if (!token) {
      throw new Error("User not logged in");
    }

    return deleteItemMutation.mutateAsync(cartItemId);
  };

  const value = {
    addItem,
    updateQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
