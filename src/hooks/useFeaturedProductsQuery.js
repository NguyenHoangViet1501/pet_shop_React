import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export function useFeaturedProductsQuery(size = 10) {
  return useQuery({
    queryKey: ["featured-products", size],
    queryFn: () => productsApi.getFeaturedProducts(size),
    staleTime: 5 * 60 * 1000,
  });
}
