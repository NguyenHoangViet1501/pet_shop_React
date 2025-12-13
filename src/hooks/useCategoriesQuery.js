import { useQuery, useQueries } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories";
import { productsApi } from "../api/products";

export function useCategoriesQuery(params = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoriesApi.getCategories(params),
    keepPreviousData: true,
  });
}

// Cách 1: Dùng API backend (Tối ưu nhất, nhưng đang lỗi backend)
export function useCategoriesWithCountQuery() {
  return useQuery({
    queryKey: ["categories-count"],
    queryFn: () => categoriesApi.getCategoriesWithCount(),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.result,
  });
}

// Cách 2: Xử lý ở Frontend (Chữa cháy khi backend lỗi)
// Logic: Lấy list categories -> Loop qua từng cái gọi API products để lấy totalElements
export function useCategoriesWithCountFrontend() {
  // 1. Lấy danh sách categories
  const { data: categoriesData, isLoading: isLoadingCats } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getCategories(),
  });

  const categories = categoriesData?.result?.content || categoriesData?.result || [];

  // 2. Gọi API song song để lấy số lượng cho từng category
  const countQueries = useQueries({
    queries: categories.map((cat) => ({
      queryKey: ["products-count", cat.id],
      queryFn: () => productsApi.getProducts({ categoryId: cat.id, size: 1 }),
      staleTime: 5 * 60 * 1000, // Cache 5 phút
    })),
  });

  // 3. Gộp kết quả
  const categoriesWithCount = categories.map((cat, index) => {
    const queryResult = countQueries[index];
    // Lấy totalElements từ response của API getProducts
    const count = queryResult?.data?.result?.totalElements || 0;
    return {
      ...cat,
      count: count,
    };
  });

  return {
    data: categoriesWithCount,
    isLoading: isLoadingCats || countQueries.some(q => q.isLoading),
  };
}
