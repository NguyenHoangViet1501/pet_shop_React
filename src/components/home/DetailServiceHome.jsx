import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetailServiceHome.css';

const services = [
  {
    img: '/images/home/service2img/cat1.png',
    title: 'Tắm rửa & chải lông cho thú cưng',
    desc: 'Giúp thú cưng sạch sẽ, thơm tho và phòng tránh các bệnh ngoài da.',
  },
  {
    img: '/images/home/service2img/cat2.png',
    title: 'Cắt tỉa tạo kiểu toàn thân',
    desc: 'Tạo kiểu lông đẹp, phù hợp từng giống thú cưng, an toàn và chuyên nghiệp.',
  },
  {
    img: '/images/home/service2img/cat3.png',
    title: 'Tiêm phòng định kỳ',
    desc: 'Bảo vệ sức khỏe thú cưng với các mũi tiêm phòng cần thiết.',
  },
  // Thêm 3 dịch vụ mẫu để có thể chuyển slide
  {
    img: '/images/home/service2img/cat4.jpg',
    title: 'Khám sức khỏe tổng quát',
    desc: 'Kiểm tra sức khỏe định kỳ, phát hiện sớm các vấn đề tiềm ẩn.',
  },
  {
    img: '/images/home/service2img/cat5.jpg',
    title: 'Làm sạch tai & móng',
    desc: 'Chăm sóc tai và móng giúp thú cưng luôn khỏe mạnh, sạch sẽ.',
  },
  {
    img: '/images/home/service2img/cat6.jpg',
    title: 'Huấn luyện cơ bản',
    desc: 'Dạy thú cưng các kỹ năng cơ bản, tăng sự gắn kết với chủ.',
  },
];

const ITEMS_PER_PAGE = 3;

const DetailServiceHome = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const maxPage = Math.max(0, services.length - ITEMS_PER_PAGE);

  const intervalRef = useRef(null);
  const isPausedRef = useRef(isPaused);

  // Keep ref in sync with state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Core slide transition function (no timer logic)
  const goNext = () => {
    setActiveIdx((idx) => (idx === maxPage ? 0 : idx + 1));
  };

  const goPrev = () => {
    setActiveIdx((idx) => (idx === 0 ? maxPage : idx - 1));
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startInterval = () => {
    stopInterval();
    if (isPausedRef.current) return;
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        goNext();
      }
    }, 3000);
  };

  // User click handlers - reset timer to full 3 seconds
  const handlePrev = () => {
    stopInterval();
    goPrev();
    startInterval();
  };

  const handleNext = () => {
    stopInterval();
    goNext();
    startInterval();
  };

  // Handle hover pause/resume
  useEffect(() => {
    if (isPaused) {
      stopInterval();
    } else {
      startInterval();
    }
  }, [isPaused]);

  // Initial start
  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, []);

  // Navigate to services page when clicking arrow
  const handleArrowClick = () => {
    navigate('/services');
    window.scrollTo(0, 0);
  };

  // Hiển thị 3 dịch vụ liên tiếp, bắt đầu từ activeIdx
  const visibleServices = services.slice(activeIdx, activeIdx + ITEMS_PER_PAGE);

  return (
    <section className="detail-service-home-section py-5">
      <div className="container">
        <div className="d-flex align-items-center mb-4" style={{ position: 'relative' }}>
          <div className="flex-grow-1 d-flex justify-content-center">
            <h2 className="fw-bold mb-0 text-center">Dịch vụ nổi bật</h2>
          </div>
          <div className="d-flex gap-2" style={{ position: 'absolute', right: 0 }}>
            <button className="btn-dark rounded-circle nav-btn me-2" onClick={handlePrev} aria-label="Trước">
              <i className="fas fa-chevron-left" style={{ color: '#fff' }}></i>
            </button>
            <button className="btn-dark rounded-circle nav-btn" onClick={handleNext} aria-label="Sau">
              <i className="fas fa-chevron-right" style={{ color: '#fff' }}></i>
            </button>
          </div>
        </div>
        <div
          className="row justify-content-center service-slider-row"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {visibleServices.map((service, idx) => (
            <div className="col-12 col-sm-6 col-lg-4 mb-4 d-flex service-slider-item" key={activeIdx + idx}>
              <div className="card h-100 shadow-sm service-card">
                <img src={service.img} alt={service.title} className="card-img-top service-img service-img-large" />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center w-100">
                    <div className="flex-grow-1">
                      <h5 className="card-title fw-bold mb-2">{service.title}</h5>
                      <p className="card-text text-muted mb-0">{service.desc}</p>
                    </div>
                    <div className="ms-3">
                      <span className="btn-warning rounded-circle arrow-btn" onClick={handleArrowClick} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-arrow-right" style={{ color: '#fff' }}></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailServiceHome;
