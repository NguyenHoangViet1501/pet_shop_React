import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import ProductHome from '../../components/home/ProductHome';
import ServicesGrid from '../../components/services/ServicesGrid';
import { servicesAPI } from '../../api';
import { useFeaturedProductsQuery } from '../../hooks/useFeaturedProductsQuery';

const HomePage = () => {
  const navigate = useNavigate();

  const {
    data: featuredProductsData,
    isLoading: loadingProducts,
    isError: productsError,
  } = useFeaturedProductsQuery(8);

  const featuredProducts = Array.isArray(featuredProductsData?.result?.content)
    ? featuredProductsData.result.content
    : Array.isArray(featuredProductsData?.result)
    ? featuredProductsData.result
    : [];

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState("");

  // ...existing code...

  // Lấy dịch vụ
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingServices(true);
      setServicesError("");
      try {
        const list = await servicesAPI.getActiveServices();
        if (!cancelled && Array.isArray(list)) setServices(list);
      } catch (e) {
        if (!cancelled) setServicesError("Không tải được dịch vụ.");
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h1 className="display-6 fw-bold mb-3">
                Everything Your Pet Needs & More
              </h1>
              <p className="mb-4">
                Premium quality pet products, expert care services, and loving
                homes for rescue pets.
              </p>
              <Link to="/products" className="btn btn-light me-2">
                Shop Now
              </Link>
              <Link to="/services" className="btn btn-outline-light">
                Book Service
              </Link>
            </div>
            <div className="col-lg-6">
              <div
                id="heroCarousel"
                className="carousel slide"
                data-bs-ride="carousel"
                data-bs-interval="2000"
              >
                <div
                  className="carousel-inner rounded-4"
                  style={{ height: "360px", overflow: "hidden" }}
                >
                  <div className="carousel-item active" data-bs-interval="2000">
                    <img
                      src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                      alt="Hero 1"
                      className="d-block w-100"
                      style={{ height: "360px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item" data-bs-interval="2000">
                    <img
                      src="https://byvn.net/31Ev"
                      alt="Hero 2"
                      className="d-block w-100"
                      style={{ height: "360px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item" data-bs-interval="2000">
                    <img
                      src="https://byvn.net/ZK6d"
                      alt="Hero 3"
                      className="d-block w-100"
                      style={{ height: "360px", objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {loadingProducts ? (
        <div className="container my-5 text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải sản phẩm nổi bật...</p>
        </div>
      ) : productsError ? (
        <div className="container my-5 alert alert-danger">Không tải được sản phẩm nổi bật.</div>
      ) : (
        <ProductHome title="Sản phẩm nổi bật" products={featuredProducts} />
      )}

      {/* Mô tả chi tiết các dịch vụ */}
      <div className="container my-5">
        <div className="text-center mb-5">
          <h2 className="mb-3">Dịch vụ chăm sóc thú cưng chuyên nghiệp</h2>
          <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 950 }}>
            Đội ngũ bác sĩ thú y và chuyên viên chăm sóc giàu kinh nghiệm của
            chúng tôi cam kết mang đến dịch vụ toàn diện, an toàn và tận tâm cho
            thú cưng của bạn.
          </p>
        </div>
        <div className="mb-5">
          <div className="row mb-5 align-items-center">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Tắm cho thú cưng"
              />
            </div>
            <div className="col-md-6">
              <h4
                className="mb-3"
                style={{ color: "#2c3e50", fontWeight: "600" }}
              >
                Tắm và Vệ sinh
              </h4>
              <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>
                Trải nghiệm tắm thư giãn với sản phẩm organic, massage chuyên
                sâu. Bao gồm vệ sinh tai, cắt móng và chăm sóc da lông toàn
                diện. Thú cưng của bạn sẽ luôn sạch sẽ, thơm tho và hạnh phúc!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/services", { state: { key: "bath" } })
                }
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6 order-md-2">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Cắt tỉa lông"
              />
            </div>
            <div className="col-md-6 order-md-1">
              <h4
                className="mb-3"
                style={{ color: "#2c3e50", fontWeight: "600" }}
              >
                Cắt tỉa lông
              </h4>
              <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>
                Thiết kế kiểu dáng thời trang theo giống loài. Chuyên viên
                chuyên nghiệp sử dụng dụng cụ cao cấp, đảm bảo an toàn tuyệt
                đối. Biến thú cưng của bạn thành ngôi sao phong cách!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/services", { state: { key: "grooming" } })
                }
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Tiêm phòng"
              />
            </div>
            <div className="col-md-6">
              <h4
                className="mb-3"
                style={{ color: "#2c3e50", fontWeight: "600" }}
              >
                Tiêm phòng
              </h4>
              <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>
                Vaccine chất lượng cao, tư vấn bởi bác sĩ chuyên khoa. Bảo vệ
                tối đa khỏi bệnh tật, theo lịch khuyến cáo quốc tế. Sức khỏe thú
                cưng là ưu tiên hàng đầu của chúng tôi!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/services", { state: { key: "vaccination" } })
                }
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6 order-md-2">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Khám bệnh"
              />
            </div>
            <div className="col-md-6 order-md-1">
              <h4
                className="mb-3"
                style={{ color: "#2c3e50", fontWeight: "600" }}
              >
                Khám bệnh định kỳ
              </h4>
              <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>
                Phát hiện sớm bệnh tật qua kiểm tra toàn diện. Tư vấn dinh
                dưỡng, chăm sóc chuyên sâu. Siêu âm, xét nghiệm máu, đảm bảo thú
                cưng luôn khỏe mạnh và hạnh phúc!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/services", { state: { key: "checkup" } })
                }
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Lưu trú"
              />
            </div>
            <div className="col-md-6">
              <h4
                className="mb-3"
                style={{ color: "#2c3e50", fontWeight: "600" }}
              >
                Dịch vụ lưu trú
              </h4>
              <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>
                Không gian thoải mái, chăm sóc 24/7 chuyên nghiệp. Ăn uống đầy
                đủ, vui chơi, theo dõi sức khỏe liên tục. Khu riêng cho chó và
                mèo, vệ sinh tuyệt đối. Thú cưng như ở nhà!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/services", { state: { key: "boarding" } })
                }
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
