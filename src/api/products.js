import { apiFetch } from "../utils/api";

export const productsApi = {
  // Lấy danh sách products với phân trang và filter
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    // Allow pageNumber = 0 (Spring Pageable is 0-based).
    // Use explicit checks for undefined instead of falsy checks.
    // Support both `page` and `pageNumber` query keys because some backends
    // expect `page` (Spring Data default) while older code used `pageNumber`.
    const resolvedPage =
      params.pageNumber !== undefined && params.pageNumber !== null
        ? params.pageNumber
        : 1;
    queryParams.append("pageNumber", resolvedPage);
    queryParams.append("page", resolvedPage);
    queryParams.append(
      "size",
      params.size !== undefined && params.size !== null ? params.size : 10
    );

    if (params.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params.minPrice) queryParams.append("minPrice", params.minPrice);
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice);
    if (params.search) queryParams.append("search", params.search);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.animal) queryParams.append("animal", params.animal);
    if (params.brand) queryParams.append("brand", params.brand);
    if (params.isFeatured !== undefined)
      queryParams.append("isFeature", params.isFeatured);
        if (params.isDelete !== undefined)
      queryParams.append("isDelete", params.isDelete);
    const url = `/v1/products?${queryParams.toString()}`;
    // Debug: log the exact URL being requested so we can verify query params
    // appear as expected in the browser console.
    try {
      // eslint-disable-next-line no-console
      console.debug("productsApi.getProducts -> requesting:", url);
    } catch (e) {}
    return await apiFetch(url);
  },

  // Lấy sản phẩm nổi bật (isFeatured = 1)
  getFeaturedProducts: async (size = 10) => {
    return await productsApi.getProducts({
      pageNumber: 1,
      size: size,
      isFeatured: "1",
    });
  },

  // Lấy chi tiết 1 product
  getProductById: async (id) => {
    return await apiFetch(`/v1/products/${id}`);
  },
  getBrands: async () => {
    return await apiFetch(`/v1/products/brands`);
  }
};
