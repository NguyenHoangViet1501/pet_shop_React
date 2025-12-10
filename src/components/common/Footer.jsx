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
    <footer className="footer  p-0 m-0">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5 className="text-warning">
              <i className="fas fa-paw"></i> PawMartHome
            </h5>
            <p>
              Cửa hàng thú cưng hàng đầu với sản phẩm chất lượng cao và dịch vụ
              chăm sóc tận tâm.
            </p>
            <div>
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6>Sản phẩm</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/products?category=food" className="text-white-50">
                  Thức ăn
                </Link>
              </li>
              <li>
                <Link to="/products?category=toys" className="text-white-50">
                  Đồ chơi
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=grooming"
                  className="text-white-50"
                >
                  Chăm sóc
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=accessories"
                  className="text-white-50"
                >
                  Phụ kiện
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h6>Dịch vụ</h6>
            <ul className="list-unstyled">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    to="/services"
                    className="text-white text-decoration-none service-link"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-3 mb-4">
            <h6>Liên hệ</h6>
            <p>
              <i className="fas fa-map-marker-alt me-2"></i>
              <a
                href="https://www.google.com/maps/place/Thanh+H%C3%B3a,+Vi%E1%BB%87t+Nam/@19.8088549,105.7084813,12z/data=!3m1!4b1!4m6!3m5!1s0x3136f7fe237e2277:0xa13832367bfc213a!8m2!3d19.806692!4d105.7851816!16zL20vMDdtMjBt?entry=ttu&g_ep=EgoyMDI1MTAyMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-decoration-none address-link"
                title="Bấm để biết định vị"
              >
                123 Đường ABC, Quận 1, TP.HCM
              </a>
            </p>
            <p>
              <i className="fas fa-phone me-2"></i>0123 456 789
            </p>
            <p>
              <i className="fas fa-envelope me-2"></i>
              <a
                href="mailto:petshop.service.vn@gmail.com"
                className="text-white text-decoration-none email-link"
                title="Gửi email"
              >
                petshop.service.vn@gmail.com
              </a>
            </p>
          </div>
        </div>
        <hr className="text-white-50" />
        <div className="text-center">
          <p>&copy; 2025 PawMartHome. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
