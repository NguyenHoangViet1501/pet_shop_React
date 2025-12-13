import { useQuery } from '@tanstack/react-query';
import { getCart } from '../api/cart';
import { useAuth } from '../context/AuthContext';

// Custom hook lấy cart của user hiện tại
export function useCartQuery(options = {}) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(token),
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
}