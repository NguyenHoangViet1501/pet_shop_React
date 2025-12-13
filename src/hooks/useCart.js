import { useQuery } from "@tanstack/react-query";
import { getCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";

// Custom hook lấy cart của user hiện tại
export function useCartQuery(options = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["cart", token], // cache theo user
    queryFn: () => getCart(token), // 🔥 BẮT BUỘC
    enabled: !!token, // chỉ gọi khi đã login
    staleTime: 0, // luôn refetch khi invalidate
    ...options,
  });
}
