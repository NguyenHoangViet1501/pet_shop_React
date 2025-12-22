import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCartItem } from "../api/cart";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook để delete cart item với optimistic update
 * - Remove item từ UI ngay lập tức
 * - Rollback nếu API fail
 */
export function useDeleteCartItem() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // Call API để xóa item
    mutationFn: (cartItemId) => deleteCartItem(cartItemId, token),

    // 🎯 OPTIMISTIC UPDATE: xóa item khỏi cache ngay
    onMutate: async (cartItemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["cart", token],
      });

      // Snapshot lại data cũ
      const previousCart = queryClient.getQueryData(["cart", token]);

      // Remove item từ cache ngay lập tức
      queryClient.setQueryData(["cart", token], (oldData) => {
        if (!oldData?.result) return oldData;

        return {
          ...oldData,
          result: {
            ...oldData.result,
            items: oldData.result.items.filter(
              (item) => item.id !== cartItemId
            ),
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
  });
}
