import React, { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import { categoriesApi, productsApi } from '../api';

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const pageSize = 6;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        
        if (response.success && response.result) {
          // Kiểm tra nếu result có thuộc tính content (phân trang)
          const categoryList = response.result.content || response.result;
          
          // Đảm bảo categoryList là mảng
          if (Array.isArray(categoryList)) {
            setCategories(categoryList);
          } else {
            setCategories([]);
          }
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products từ API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          pageNumber: currentPage,
          size: pageSize,
          ...(selectedCategory && { categoryId: selectedCategory }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(sortBy && { sort: sortBy }),
        };
        
        const response = await productsApi.getProducts(params);
        
        if (response.success && response.result) {
          const data = response.result;
          setProducts(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setProducts([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, pageSize, selectedCategory, minPrice, maxPrice, sortBy]);

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
                >
                  <option value="">Tất cả danh mục</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
              >
                Lọc
              </button>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">
                {loading ? (
                  'Đang tải...'
                ) : (
                  `Hiển thị ${products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-${Math.min(currentPage * pageSize, totalElements)} trong ${totalElements} sản phẩm`
                )}
              </span>
              <select 
                className="form-select" 
                style={{width: 'auto'}}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Mặc định</option>
                <option value="price,asc">Sắp xếp theo giá: Thấp đến cao</option>
                <option value="price,desc">Sắp xếp theo giá: Cao đến thấp</option>
                <option value="createdDate,desc">Sản phẩm mới nhất</option>
                <option value="soldQuantity,desc">Bán chạy nhất</option>
              </select>
            </div>
            <div className="row">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">Không tìm thấy sản phẩm nào</p>
                </div>
              ) : (
                products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>

            {totalPages > 0 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center align-items-center" style={{ minHeight: 40 }}>
                  <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}
                      style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="page-link d-flex align-items-center justify-content-center" style={{ height: 40 }} onClick={prev} disabled={currentPage === 1}>&laquo;</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                    <li key={p} className={`page-item${currentPage === p ? ' active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center' }}>
                      <button className="page-link d-flex align-items-center justify-content-center" style={{ height: 40 }} onClick={() => goTo(p)}>{p}</button>
                    </li>
                  ))}
                  <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}
                      style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="page-link d-flex align-items-center justify-content-center" style={{ height: 40 }} onClick={next} disabled={currentPage === totalPages}>&raquo;</button>
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


