import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import { useCategoriesWithCountFrontend } from "../../hooks/useCategoriesQuery";
import { useBrandsQuery, useProductsQuery } from "../../hooks/useProductsQuery";
import { useNavigate } from "react-router-dom";
import ProductAnimal from "../../components/product/ProductAnimal";
import ProductFilter2 from "../../components/product/ProductFilter2";
import { use } from "react";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const navigate = useNavigate();
  // UI `currentPage` is 1-based for users; we'll send `currentPage - 1` to the API
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // State cho giá trị đã apply (gửi lên API)
  const [appliedPriceRange, setAppliedPriceRange] = useState({
    min: null,
    max: null,
  });

  const [sortBy, setSortBy] = useState("");
  const pageSize = 12;

  const { data: brandsData } = useBrandsQuery();

  // Reset page when search query changes (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleFilterChange = (filters) => {
    if (filters.categories && filters.categories.length > 0) {
      setSelectedCategory(filters.categories[filters.categories.length - 1]);
    } else {
      setSelectedCategory(null);
    }

    // Brands
    if (filters.brands && filters.brands.length > 0) {
      setSelectedBrand(filters.brands[filters.brands.length - 1]);
    } else {
      setSelectedBrand(null);
    }

    // Price
    if (filters.price) {
      setAppliedPriceRange({
        min: filters.price.min,
        max: filters.price.max
      });
    }

    setCurrentPage(1);
  };
  const {
    data: categoriesWithCount,
    isLoading: categoriesLoading,
  } = useCategoriesWithCountFrontend();

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useProductsQuery({
    // Spring Pageable is 0-based; send currentPage - 1
    pageNumber: Math.max(1, currentPage),
    size: pageSize,
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(selectedAnimal && selectedAnimal !== 'all' && { animal: selectedAnimal }),
    ...(selectedBrand && { brand: selectedBrand }),
    ...(appliedPriceRange.min && { minPrice: appliedPriceRange.min }),
    ...(appliedPriceRange.max && { maxPrice: appliedPriceRange.max }),
    ...(sortBy && { sort: sortBy }),
    ...(searchQuery && { search: searchQuery }),
  });

  const categories = categoriesWithCount || [];

  const rawProducts = productsData?.result?.content || [];
  // Filter out products with no active variants
  const products = rawProducts.filter((p) => {
    if (!p.productVariant || p.productVariant.length === 0) return false;
    return p.productVariant.some(
      (v) => v.isDeleted === 0 || v.isDeleted === '0' || !v.isDeleted
    );
  });

  const totalPages = productsData?.result?.totalPages || 0;
  const totalElements = productsData?.result?.totalElements || 0;
  const loading = productsLoading || categoriesLoading;

  // ...existing code...

  const goTo = (page) => {
    // Clamp between 1 and totalPages when available. If totalPages not loaded,
    // allow requested page (but minimum is 1).
    const minPage = Math.max(1, page);
    const maxPage = totalPages && totalPages > 0 ? totalPages : minPage;
    const p = Math.min(minPage, maxPage);
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    if (currentPage > 1) goTo(currentPage - 1);
  };
  const next = () => {
    if (totalPages && currentPage < totalPages) goTo(currentPage + 1);
  };

  return (
    <div className="page" id="products">
      <ProductAnimal selectedAnimal={selectedAnimal} onSelectAnimal={setSelectedAnimal} />
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
            <ProductFilter2
              categories={categories}
              brands={brandsData || []}
              onFilterChange={handleFilterChange}
            />
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">
                {productsLoading
                  ? "Đang tải..."
                  : productsError
                    ? "Lỗi tải sản phẩm"
                    : `Hiển thị ${products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
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
                  <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>
            {totalPages > 0 && (
              <div className="d-flex justify-content-center mt-4 gap-2">
                <button
                  className="bg-white border rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40, color: '#6c757d' }}
                  onClick={prev}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`rounded-3 d-flex align-items-center justify-content-center fw-bold`}
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: currentPage === p ? "#ffc107" : "white",
                        color: currentPage === p ? "white" : "#6c757d",
                        borderColor: currentPage === p ? "#ffc107" : "#dee2e6",
                      }}
                      onClick={() => goTo(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="bg-white border rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40, color: '#6c757d' }}
                  onClick={next}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
