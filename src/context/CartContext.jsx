import React, { createContext, useContext } from "react";
import { addToCart as addToCartAPI } from "../api/cart";
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

  // /**
  //  * ➖ Remove item khỏi cart
  //  */
  // const removeItem = async (cartItemId) => {
  //   if (!token) return;

  //   await removeFromCartAPI(cartItemId, token);

  //   queryClient.invalidateQueries({
  //     queryKey: ["cart"],
  //   });
  // };

  // /**
  //  * 🔄 Update quantity
  //  */
  // // const updateQuantity = async (cartItemId, quantity) => {
  // //   if (!token) return;

  // //   if (quantity <= 0) {
  // //     await removeItem(cartItemId);
  // //     return;
  // //   }

  // //   await updateCartItemAPI(cartItemId, quantity, token);

  // //   queryClient.invalidateQueries({
  // //     queryKey: ["cart"],
  // //   });
  // // };

  // /**
  //  * 🧹 Clear toàn bộ cart
  //  */
  // const clearCart = async () => {
  //   if (!token) return;

  //   await clearCartAPI(token);

  //   queryClient.invalidateQueries({
  //     queryKey: ["cart"],
  //   });
  // };

  const value = {
    addItem,
  };

  // removeItem,
  //   updateQuantity,
  //   clearCart,
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
