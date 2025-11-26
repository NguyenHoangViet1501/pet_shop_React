import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export function useProductsQuery(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.getProducts(params),
    keepPreviousData: true,
  });
}
