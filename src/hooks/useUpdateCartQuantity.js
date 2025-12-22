import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook để update quantity với optimistic update
 * - Update UI ngay lập tức (optimistic)
 * - Rollback nếu API fail
 * - Không refetch toàn bộ cart
 */
export function useUpdateCartQuantity() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // Call API với delta quantity
    mutationFn: ({ productVariantId, quantityDelta }) =>
      addToCart([{ productVariantId, quantity: quantityDelta }], token),

    // 🎯 OPTIMISTIC UPDATE: update cache trước khi API trả về
    onMutate: async ({ productVariantId, quantityDelta }) => {
      // Cancel any outgoing refetches sao cho ko bị overwrite optimistic data
      await queryClient.cancelQueries({
        queryKey: ["cart", token],
      });

      // Snapshot lại giá trị cũ để rollback nếu fail
      const previousCart = queryClient.getQueryData(["cart", token]);

      // Update cache ngay lập tức (optimistic)
      queryClient.setQueryData(["cart", token], (oldData) => {
        if (!oldData?.result) return oldData;

        return {
          ...oldData,
          result: {
            ...oldData.result,
            items: oldData.result.items
              .map((item) => {
                // Tìm item cần update
                if (item.productVariantId === productVariantId) {
                  const newQuantity = item.quantity + quantityDelta;
                  // Không cho quantity < 1
                  return {
                    ...item,
                    quantity: Math.max(1, newQuantity),
                  };
                }
                return item;
              })
              // Filter out items với quantity = 0 (đã xóa)
              .filter((item) => item.quantity > 0),
          },
        };
      });

      // Return snapshot để dùng trong onError
      return { previousCart };
    },

    // 🔴 ROLLBACK on error
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart", token], context.previousCart);
      }
    },

    // ✅ On success: không cần gì thêm, UI đã update via optimistic
    // Optionally: invalidate nếu cần sync lại (nhưng thường ko cần)
  });
}
