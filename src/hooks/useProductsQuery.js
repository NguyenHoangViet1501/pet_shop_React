import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export function useProductsQuery(params = {}) {
  // Mặc định lấy sản phẩm chưa xóa (isDelete = "0")
  const queryParams = { isDelete: "0", ...params };
  
  return useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productsApi.getProducts(queryParams),
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
