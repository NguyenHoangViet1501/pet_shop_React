import React, { createContext, useContext } from "react";
import { addToCart as addToCartAPI, deleteCartItem } from "../api/cart";
import { useAuth } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";

// removeFromCart as removeFromCartAPI,
// updateCartItem as updateCartItemAPI,
// clearCart as clearCartAPI,

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
 * - KHÔNG giữ state cart
 * - CHỈ gọi API + invalidate React Query
 */
export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  /**
   * ➕ Add item vào cart
   */
  const addItem = async (product) => {
    if (!token) {
      throw new Error("User not logged in");
    }

    const productVariantId =
      product.variant?.id || product.variantId || product.id;

    const quantity = product.quantity || 1;

    await addToCartAPI([{ productVariantId, quantity }], token);

    // 🔥 Sync UI ngay lập tức
    queryClient.invalidateQueries({
      queryKey: ["cart"],
    });
  };

  /**
   * 🔄 Update quantity bằng cách gọi addCart với quantity delta (+1 hoặc -1)
   * @param {number} productVariantId - ID của product variant
   * @param {number} quantityDelta - Số lượng thay đổi (+1 hoặc -1)
   * @returns {Promise<boolean>} - true nếu thành công, false nếu cần xác nhận xóa
   */
  const updateQuantity = async (productVariantId, quantityDelta) => {
    if (!token) {
      throw new Error("User not logged in");
    }

    // Gọi API addCart với quantity delta
    await addToCartAPI([{ productVariantId, quantity: quantityDelta }], token);

    // 🔥 Sync UI ngay lập tức
    queryClient.invalidateQueries({
      queryKey: ["cart"],
    });
  };

  /**
   * ➖ Remove item khỏi cart bằng cách gọi deleteCartItem
   * @param {number} cartItemId - ID của cart item
   */
  const removeItem = async (cartItemId) => {
    if (!token) {
      throw new Error("User not logged in");
    }

    // Gọi API deleteCartItem để xóa item khỏi cart
    await deleteCartItem(cartItemId, token);

    // 🔥 Sync UI ngay lập tức
    queryClient.invalidateQueries({
      queryKey: ["cart"],
    });
  };

  const value = {
    addItem,
    updateQuantity,
    removeItem,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
