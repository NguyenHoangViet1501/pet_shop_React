import { apiFetch } from "../utils/api";

export const productsApi = {
  // Lấy danh sách products với phân trang và filter
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("pageNumber", params.pageNumber || 1);
    queryParams.append("size", params.size || 10);

    if (params.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params.minPrice) queryParams.append("minPrice", params.minPrice);
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice);
    if (params.search) queryParams.append("search", params.search);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.isFeatured !== undefined)
      queryParams.append("isFeatured", params.isFeatured);

    return await apiFetch(`/v1/products?${queryParams.toString()}`);
  },

  // Lấy sản phẩm nổi bật (isFeatured = 1)
  getFeaturedProducts: async (size = 4) => {
    const queryParams = new URLSearchParams();
    queryParams.append("pageNumber", 1);
    queryParams.append("size", size);
    queryParams.append("isFeatured", 1);

    return await apiFetch(`/v1/products?${queryParams.toString()}`);
  },

  // Lấy chi tiết 1 product
  getProductById: async (id) => {
    return await apiFetch(`/v1/products/${id}`);
  },
};
