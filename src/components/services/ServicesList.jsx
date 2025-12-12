import React from "react";
import "./ServicesList.css";

const ServicesList = ({ services, onBook }) => (
  <section className="services-list-section py-5">
    <div className="container">
      <h2 className="text-center mb-2" style={{ color: '#ff9800', fontWeight: 700 }}>
        Dịch Vụ Chăm Sóc Thú Cưng
      </h2>
      <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: 760 }}>
        Đội ngũ bác sĩ thú y và chuyên viên chăm sóc giàu kinh nghiệm của chúng tôi cam kết mang đến dịch vụ toàn diện, an toàn và tận tâm cho thú cưng của bạn.
      </p>
      <div className="row g-4 justify-content-center align-items-stretch">
        {services.map((service) => (
          <div className="col-12 col-md-6 col-lg-4 d-flex" key={service.id}>
            <div className="card service-list-card flex-fill h-100 d-flex flex-column">
              <div className="card-body d-flex flex-column h-100 text-center">
                <div className="service-list-icon mb-2 mx-auto" style={{fontSize: '2rem'}}>
                  <i className={service.icon}></i>
                </div>
                <div className="fw-bold mb-2" style={{fontSize: '1.1rem'}}>{service.title}</div>
                <div className="text-muted mb-3 flex-grow-1" style={{ minHeight: 48 }}>{service.description}</div>
                <div className="d-flex align-items-center justify-content-between mb-3" style={{justifyContent: 'center', gap: 16}}>
                  <span className="text-secondary small">
                    <i className="fas fa-clock me-1"></i> Thời lượng: {service.duration}
                  </span>
                  <span className="fw-bold" style={{ color: '#ff9800' }}>
                    {service.price?.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <button className="btn btn-warning w-100 mt-auto" onClick={() => onBook(service.key)}>
                  Đặt lịch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesList;
