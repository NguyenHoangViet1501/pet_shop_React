import { apiFetch } from "../utils/api";

export const categoriesApi = {
  // Lấy danh sách categories với phân trang
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams({
      pageNumber: params.pageNumber || 1,
      size: params.size || 100, // Lấy nhiều để hiển thị tất cả trong dropdown
      ...params,
    }).toString();
    return await apiFetch(`/v1/categories?${queryParams}`);
  },
  getCategoriesWithCount: async () => {
    return await apiFetch(`/v1/categories/count`);
  },
};
