import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ServicesGrid from '../components/services/ServicesGrid';
import { servicesAPI } from '../api';
import { useFeaturedProductsQuery } from '../hooks/useFeaturedProductsQuery';

const HomePage = () => {
  const navigate = useNavigate();
  
  const {
    data: featuredProductsData,
    isLoading: loadingProducts,
    isError: productsError,
  } = useFeaturedProductsQuery(4);

  const featuredProducts = Array.isArray(featuredProductsData?.result?.content)
    ? featuredProductsData.result.content
    : Array.isArray(featuredProductsData?.result)
    ? featuredProductsData.result
    : [];

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');

  // ...existing code...

  // Lấy dịch vụ
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingServices(true);
      setServicesError('');
      try {
        const list = await servicesAPI.getActiveServices();
        if (!cancelled && Array.isArray(list)) setServices(list);
      } catch (e) {
        if (!cancelled) setServicesError('Không tải được dịch vụ.');
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h1 className="display-6 fw-bold mb-3">Everything Your Pet Needs & More</h1>
              <p className="mb-4">Premium quality pet products, expert care services, and loving homes for rescue pets.</p>
              <Link to="/products" className="btn btn-light me-2">Shop Now</Link>
              <Link to="/services" className="btn btn-outline-light">Book Service</Link>
            </div>
            <div className="col-lg-6">
              <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                <div className="carousel-inner rounded-4" style={{ height: '360px', overflow: 'hidden' }}>
                  <div className="carousel-item active" data-bs-interval="2000">
                    <img
                      src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                      alt="Hero 1"
                      className="d-block w-100"
                      style={{ height: '360px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="carousel-item" data-bs-interval="2000">
                    <img
                      src="https://byvn.net/31Ev"
                      alt="Hero 2"
                      className="d-block w-100"
                      style={{ height: '360px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="carousel-item" data-bs-interval="2000">
                    <img
                      src="https://byvn.net/ZK6d"
                      alt="Hero 3"
                      className="d-block w-100"
                      style={{ height: '360px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="mb-1">Sản phẩm nổi bật</h2>
            <div className="text-muted">Sản phẩm được yêu thích bởi thú cưng và chủ nuôi</div>
          </div>
          <Link to="/products" className="text-decoration-none">Xem tất cả sản phẩm <i class="fa-solid fa-arrow-right"></i></Link>
        </div>
        {loadingProducts && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải sản phẩm nổi bật...</p>
          </div>
        )}
        {productsError && !loadingProducts && (
          <div className="alert alert-danger">Không tải được sản phẩm nổi bật.</div>
        )}
        {!productsError && !loadingProducts && featuredProducts.length === 0 && (
          <div className="text-center text-muted py-4">Chưa có sản phẩm nổi bật.</div>
        )}
        {!productsError && !loadingProducts && featuredProducts.length > 0 && (
          <div className="row">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Services teaser */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Dịch vụ</h2>
          <Link to="/services" className="text-decoration-none">Xem tất cả dịch vụ <i class="fa-solid fa-arrow-right"></i></Link>
        </div>
        {loadingServices && (
          <div className="text-muted">Đang tải dịch vụ...</div>
        )}
        {!loadingServices && servicesError && (
          <div className="text-danger mb-3">{servicesError}</div>
        )}
        {!loadingServices && services.length > 0 && (
          <ServicesGrid services={services} onBook={(key) => navigate('/services',{state : { key }})} />
        )}
        {!loadingServices && !servicesError && services.length === 0 && (
          <div className="text-center text-muted">Chưa có dịch vụ để hiển thị.</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;