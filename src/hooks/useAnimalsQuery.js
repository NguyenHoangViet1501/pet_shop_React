import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export function useAnimalsQuery() {
  return useQuery({
    queryKey: ["animals"],
    queryFn: () => productsApi.getAnimal(),
    staleTime: 10 * 60 * 1000, // Cache trong 10 phút
    select: (data) => {
      const list = data.result || data;
      return Array.isArray(list) 
        ? list.filter((item) => item && typeof item === 'string' && item.trim().length > 0) 
        : [];
    },
  });
}

