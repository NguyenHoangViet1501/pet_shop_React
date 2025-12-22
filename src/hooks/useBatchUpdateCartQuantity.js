import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import { useRef, useCallback } from "react";

/**
 * Custom hook để batch update quantity với debounce 300ms
 * - Update UI ngay (optimistic)
 * - Tích lũy clicks trong 300ms
 * - Gọi API một lần với tổng delta sau 300ms
 * - Rollback nếu API fail
 */
export function useBatchUpdateCartQuantity() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Track pending delta và timer
  const pendingDeltaRef = useRef(new Map()); // Map<productVariantId, delta>
  const debounceTimersRef = useRef(new Map()); // Map<productVariantId, timerId>

  const mutation = useMutation({
    // Gọi API với accumulated delta
    mutationFn: ({ productVariantId, accumulatedDelta }) =>
      addToCart([{ productVariantId, quantity: accumulatedDelta }], token),

    onError: (error, { productVariantId, accumulatedDelta }) => {
      // Rollback: lấy previous cart từ cache
      const previousCart = queryClient.getQueryData(["cart", token]);

      // Nếu có rollback data, restore it
      if (previousCart?.result?.items) {
        queryClient.setQueryData(["cart", token], (oldData) => {
          if (!oldData?.result) return oldData;

          return {
            ...oldData,
            result: {
              ...oldData.result,
              items: oldData.result.items.map((item) => {
                if (item.productVariantId === productVariantId) {
                  // Revert delta
                  return {
                    ...item,
                    quantity: Math.max(1, item.quantity - accumulatedDelta),
                  };
                }
                return item;
              }),
            },
          };
        });
      }
    },
  });

  /**
   * Batch update quantity với debounce
   * @param {number} productVariantId
   * @param {number} quantityDelta - +1 hoặc -1
   */
  const batchUpdateQuantity = useCallback(
    (productVariantId, quantityDelta) => {
      // Accumulate delta
      const currentDelta = pendingDeltaRef.current.get(productVariantId) || 0;
      const newDelta = currentDelta + quantityDelta;
      pendingDeltaRef.current.set(productVariantId, newDelta);

      // Clear existing timer nếu có
      const existingTimer = debounceTimersRef.current.get(productVariantId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Update UI ngay (optimistic)
      queryClient.setQueryData(["cart", token], (oldData) => {
        if (!oldData?.result) return oldData;

        return {
          ...oldData,
          result: {
            ...oldData.result,
            items: oldData.result.items
              .map((item) => {
                if (item.productVariantId === productVariantId) {
                  const newQuantity = item.quantity + quantityDelta;
                  return {
                    ...item,
                    quantity: Math.max(1, newQuantity),
                  };
                }
                return item;
              })
              .filter((item) => item.quantity > 0),
          },
        };
      });

      // Set new timer - gọi API sau 300ms nếu ko có click mới
      const timer = setTimeout(() => {
        const accumulatedDelta =
          pendingDeltaRef.current.get(productVariantId) || 0;

        // Reset pending delta
        pendingDeltaRef.current.delete(productVariantId);
        debounceTimersRef.current.delete(productVariantId);

        // Gọi mutation
        if (accumulatedDelta !== 0) {
          mutation.mutate({
            productVariantId,
            accumulatedDelta,
          });
        }
      }, 300);

      debounceTimersRef.current.set(productVariantId, timer);
    },
    [token, queryClient, mutation]
  );

  return { batchUpdateQuantity, ...mutation };
}
