import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export function useProductsQuery(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.getProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useBrandsQuery() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => productsApi.getBrands(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.result,
  });
}
