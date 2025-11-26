import React, { useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';
import { useProductsQuery } from '../hooks/useProductsQuery';

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const pageSize = 6;

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
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(sortBy && { sort: sortBy }),
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <p className="text-muted mb-4">Tìm sản phẩm hoàn hảo cho thú cưng yêu quý của bạn</p>
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
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Đến"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={() => setCurrentPage(1)}
                disabled={productsLoading}
              >
                Lọc
              </button>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">
                {productsLoading ? (
                  'Đang tải...'
                ) : productsError ? (
                  'Lỗi tải sản phẩm'
                ) : (
                  `Hiển thị ${products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-${Math.min(currentPage * pageSize, totalElements)} trong ${totalElements} sản phẩm`
                )}
              </span>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={productsLoading}
              >
                <option value="">Mặc định</option>
                <option value="price,asc">Sắp xếp theo giá: Thấp đến cao</option>
                <option value="price,desc">Sắp xếp theo giá: Cao đến thấp</option>
                <option value="createdDate,desc">Sản phẩm mới nhất</option>
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
              <nav aria-label="Pagination" className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={prev} disabled={currentPage === 1}>
                      <i className="fa-solid fa-less-than fa-xs"></i>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => goTo(p)}>{p}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={next} disabled={currentPage >= totalPages}>
                      <i className="fa-solid fa-greater-than fa-xs"></i>
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


