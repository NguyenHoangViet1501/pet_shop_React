import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { servicesAPI } from "../../api/services";

const Footer = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const activeServices = await servicesAPI.getActiveServices();
        setServices(activeServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, []);

  return (
    <footer className="position-relative py-5" style={{ 
      backgroundImage: 'url(/images/footer/footer1.png)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#212529', 
      overflow: 'hidden' 
    }}>
      {/* Background Images */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0, pointerEvents: 'none' }}>
         <img 
            src="/images/footer/footer2.png" 
            alt="background shape" 
            className="position-absolute bottom-0 end-0" 
            style={{ maxHeight: '200px', width: 'auto' }} 
         />
      </div>

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row">
          {/* Brand Column */}
          <div className="col-lg-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: '1.5rem' }}>
              <i className="fas fa-paw me-2"></i> Pet Care Shop
            </h5>
            <p className="mb-4 text-muted" style={{ maxWidth: '300px' }}>
              Cửa hàng thú cưng hàng đầu với sản phẩm chất lượng cao và dịch vụ chăm sóc tận tâm.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-decoration-none">
                <img src="/images/footer/facebook.png" alt="Facebook" width="30" height="30" />
              </a>
              <a href="#" className="text-decoration-none">
                <img src="/images/footer/instagram.png" alt="Instagram" width="30" height="30" />
              </a>
              <a href="#" className="text-decoration-none">
                <img src="/images/footer/x.png" alt="X" width="30" height="30" />
              </a>
              <a href="#" className="text-decoration-none">
                <img src="/images/footer/youtube.png" alt="Youtube" width="30" height="30" />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Sản phẩm</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/products?category=food" className="text-dark text-decoration-none">Thức ăn</Link></li>
              <li className="mb-2"><Link to="/products?category=toys" className="text-dark text-decoration-none">Đồ chơi</Link></li>
              <li className="mb-2"><Link to="/products?category=care" className="text-dark text-decoration-none">Chăm sóc</Link></li>
              <li className="mb-2"><Link to="/products?category=accessories" className="text-dark text-decoration-none">Phụ kiện</Link></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Dịch vụ</h6>
            <ul className="list-unstyled">
               {services.length > 0 ? (
                  services.map((service) => (
                    <li key={service.id} className="mb-2">
                      <Link to="/services" className="text-dark text-decoration-none">{service.title}</Link>
                    </li>
                  ))
               ) : (
                 <>
                    <li className="mb-2"><Link to="/services" className="text-dark text-decoration-none">Tắm rửa</Link></li>
                    <li className="mb-2"><Link to="/services" className="text-dark text-decoration-none">Cắt tỉa</Link></li>
                    <li className="mb-2"><Link to="/services" className="text-dark text-decoration-none">Khám sức khỏe</Link></li>
                    <li className="mb-2"><Link to="/services" className="text-dark text-decoration-none">Tiêm phòng</Link></li>
                    <li className="mb-2"><Link to="/services" className="text-dark text-decoration-none">Lưu trú</Link></li>
                    <li className="mb-2"><Link to="/services" className="text-dark text-decoration-none">Massage</Link></li>
                 </>
               )}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="col-lg-3 mb-4">
            <h6 className="fw-bold mb-3">Liên hệ</h6>
            <ul className="list-unstyled">
              <li className="mb-2">123 Đường ABC, Quận 1, TP.HCM</li>
              <li className="mb-2">+0123 456 789</li>
              <li className="mb-2">petshop.service.vn@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
