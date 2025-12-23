import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook để add item vào cart với optimistic update
 * - Add item vào UI ngay lập tức
 * - Rollback nếu API fail
 */
export function useAddToCart() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // Call API để add item
    mutationFn: (product) => {
      const productVariantId =
        product.variant?.id || product.variantId || product.id;
      const quantity = product.quantity || 1;

      return addToCart([{ productVariantId, quantity }], token);
    },

    // 🎯 OPTIMISTIC UPDATE: thêm item vào cache ngay
    onMutate: async (product) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["cart", token],
      });

      // Snapshot lại data cũ
      const previousCart = queryClient.getQueryData(["cart", token]);

      // Add item vào cache ngay lập tức
      queryClient.setQueryData(["cart", token], (oldData) => {
        if (!oldData?.result) return oldData;

        const productVariantId =
          product.variant?.id || product.variantId || product.id;
        const quantity = product.quantity || 1;

        // Kiểm tra item đã tồn tại chưa
        const existingItem = oldData.result.items.find(
          (item) => item.productVariantId === productVariantId
        );

        let newItems;
        if (existingItem) {
          // Update quantity của item đã tồn tại
          newItems = oldData.result.items.map((item) =>
            item.productVariantId === productVariantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add item mới (temp dengan minimal data)
          newItems = [
            ...oldData.result.items,
            {
              id: Math.random(), // temp ID
              productVariantId,
              quantity,
              name: product.name || "...",
              price: product.price || 0,
              image: product.image || null,
              variantName: product.variantName || null,
            },
          ];
        }

        return {
          ...oldData,
          result: {
            ...oldData.result,
            items: newItems,
          },
        };
      });

      return { previousCart };
    },

    // 🔴 ROLLBACK on error
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart", token], context.previousCart);
      }
    },

    // ✅ On success: invalidate để sync lại data từ server
    // Điều này cần thiết để lấy ID chính xác nếu là item mới
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart", token],
      });
    },
  });
}
