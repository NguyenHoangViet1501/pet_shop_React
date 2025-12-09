import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { useCategoriesQuery } from "../hooks/useCategoriesQuery";
import { useProductsQuery } from "../hooks/useProductsQuery";
import { productsApi } from "../api";
import { useNavigate } from "react-router-dom";
const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  // State cho input giá (chưa filter ngay)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // State cho giá trị đã apply (gửi lên API)
  const [appliedPriceRange, setAppliedPriceRange] = useState({
    min: null,
    max: null,
  });

  const [sortBy, setSortBy] = useState("");
  const pageSize = 6;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Hàm xử lý khi bấm nút Lọc
  const handleApplyFilter = () => {
    setAppliedPriceRange({
      min: priceRange.min,
      max: priceRange.max,
    });
    setCurrentPage(1);
  };

  // Categories query
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategoriesQuery();
  // Products query

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useProductsQuery({
    pageNumber: currentPage,
    size: pageSize,
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(appliedPriceRange.min && { minPrice: appliedPriceRange.min }),
    ...(appliedPriceRange.max && { maxPrice: appliedPriceRange.max }),
    ...(sortBy && { sort: sortBy }),
    ...(searchQuery && { search: searchQuery }),
  });

  const categories = Array.isArray(categoriesData?.result?.content)
    ? categoriesData.result.content
    : Array.isArray(categoriesData?.result)
    ? categoriesData.result
    : [];

  const products = productsData?.result?.content || [];
  const totalPages = productsData?.result?.totalPages || 0;
  const totalElements = productsData?.result?.totalElements || 0;
  const loading = productsLoading || categoriesLoading;

  // ...existing code...

  const goTo = (page) => {
    const p = Math.min(Math.max(totalPages, 1), Math.max(1, page));
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    if (currentPage > 1) goTo(currentPage - 1);
  };
  const next = () => {
    if (currentPage < totalPages) goTo(currentPage + 1);
  };

  return (
    <div className="page" id="products">
      <div className="container page-content">
        <h1 className="mb-4">Sản phẩm</h1>
        {searchQuery && (
          <p className="text-muted mb-4">
            Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong>
          </p>
        )}
        {!searchQuery && (
          <p className="text-muted mb-4">
            Tìm sản phẩm hoàn hảo cho thú cưng yêu quý của bạn
          </p>
        )}
        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="sidebar">
              <h5>Lọc sản phẩm</h5>
              <div className="mb-3">
                <label className="form-label">Danh mục</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={categoriesLoading}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoriesError && (
                  <div className="text-danger small mt-1">Lỗi tải danh mục</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Khoảng giá</label>
                <div className="row">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Từ"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Đến"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={handleApplyFilter}
                disabled={productsLoading}
              >
                Lọc
              </button>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">
                {productsLoading
                  ? "Đang tải..."
                  : productsError
                  ? "Lỗi tải sản phẩm"
                  : `Hiển thị ${
                      products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
                    }-${Math.min(
                      currentPage * pageSize,
                      totalElements
                    )} trong ${totalElements} sản phẩm`}
              </span>
              <select
                className="form-select"
                style={{ width: "auto" }}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={productsLoading}
              >
                <option value="">Mặc định</option>
                <option value="price,asc">Giá: Thấp đến cao</option>
                <option value="price,desc">Giá: Cao đến thấp</option>
                <option value="createdDate,desc">Mới nhất</option>
                <option value="soldQuantity,desc">Bán chạy nhất</option>
              </select>
            </div>
            <div className="row">
              {productsLoading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
                </div>
              ) : productsError ? (
                <div className="col-12 text-center py-5">
                  <p className="text-danger">Lỗi tải sản phẩm</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">Không tìm thấy sản phẩm nào</p>
                </div>
              ) : (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
            {totalPages > 0 && (
              <nav className="mt-3">
                <ul
                  className="pagination justify-content-center align-items-center"
                  style={{ minHeight: 40 }}
                >
                  <li
                    className={`page-item${
                      currentPage === 1 ? " disabled" : ""
                    }`}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <button
                      className="page-link d-flex align-items-center justify-content-center"
                      style={{ height: 40 }}
                      onClick={prev}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (p) => (
                      <li
                        key={p}
                        className={`page-item${
                          currentPage === p ? " active" : ""
                        }`}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <button
                          className="page-link d-flex align-items-center justify-content-center"
                          style={{ height: 40 }}
                          onClick={() => goTo(p)}
                        >
                          {p}
                        </button>
                      </li>
                    )
                  )}
                  <li
                    className={`page-item${
                      currentPage === totalPages ? " disabled" : ""
                    }`}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <button
                      className="page-link d-flex align-items-center justify-content-center"
                      style={{ height: 40 }}
                      onClick={next}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
