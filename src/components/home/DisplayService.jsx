import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DisplayService.css';

const DisplayService = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate('/services');
    window.scrollTo(0, 0);
  };

  return (
    <section className="display-service-section" style={{ background: '#f8f9fa', padding: '48px 0', position: 'relative', minHeight: '600px', overflow: 'hidden' }}>
      <div className="container d-flex align-items-center justify-content-between flex-wrap" style={{ minHeight: '600px', position: 'relative' }}>
        <div className="service-visual d-flex align-items-center justify-content-center" style={{ position: 'relative', minWidth: 500, height: 500, flex: '0 0 600px', maxWidth: '700px' }}>
          {/* Nền cam lớn */}
          <img
            src="/images/home/service1img/Shape.png"
            alt="Background Shape"
            className="bg-shape"
            style={{ position: 'absolute', left: 0, top: 0, width: 520, height: 420, zIndex: 1 }}
          />
          {/* Ảnh mèo */}
          <img
            src="/images/home/service1img/cat.png"
            alt="Cat"
            style={{ position: 'absolute', left: -20, top: 80, width: 300, zIndex: 2 }}
          />
          {/* Ảnh chó */}
          <img
            src="/images/home/service1img/dog.png"
            alt="Dog"
            style={{ position: 'absolute', left: 160, top: -5, width: 370, zIndex: 2 }}
          />
          {/* Vector trang trí, nằm phía sau, không tràn xuống dưới */}
          <img
            src="/images/home/service1img/Vector.png"
            alt="Vector Decor"
            className="vector-decor"
            style={{ position: 'absolute', left: 0, top: -55, width: 1150, height: 540, zIndex: 0, pointerEvents: 'none', objectFit: 'cover' }}
          />
        </div>
        <div className="service-content" style={{ maxWidth: 540, marginLeft: 40 }}>
          <div style={{ color: '#ff9800', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Pet Care Shop</div>
          <h1 style={{ fontWeight: 700, fontSize: 40, marginBottom: 16, lineHeight: 1.2 }}>
            Dịch vụ chăm sóc thú cưng chuyên nghiệp
          </h1>
          <p style={{ color: '#555', fontSize: 18, marginBottom: 32 }}>
            Đội ngũ bác sĩ thú y và chuyên viên chăm sóc giàu kinh nghiệm của chúng tôi cam kết mang đến dịch vụ toàn diện, an toàn và tận tâm cho thú cưng của bạn.
          </p>
          <button className="btn btn-dark btn-lg px-4 py-2" style={{ fontSize: 18 }} onClick={handleBookingClick}>
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </section>
  );
};

export default DisplayService;

