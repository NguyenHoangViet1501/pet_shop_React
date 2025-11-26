import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories";

export function useCategoriesQuery(params = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoriesApi.getCategories(params),
    keepPreviousData: true,
  });
}
