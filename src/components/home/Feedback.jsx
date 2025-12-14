import React, { useState, useEffect } from 'react';

const Feedback = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const feedbacks = [
    {
      id: 1,
      text: "Tôi rất hài lòng với trải nghiệm tại Pet Care Shop. Bé chó nhà tôi thường sợ tắm nhưng khi đến đây lại rất thoải mái. Không gian sạch sẽ, quy trình chuyên nghiệp. Sau khi chăm sóc, lông bé mềm mượt và thơm dễ chịu. Rất đáng tin cậy!",
      author: "Nguyễn Hoàng Việt",
      role: "Customer",
    },
    {
      id: 2,
      text: "Dịch vụ tuyệt vời! Nhân viên rất tận tâm và yêu thương động vật. Mèo cưng của tôi đã được cắt tỉa lông rất đẹp và gọn gàng. Giá cả hợp lý cho chất lượng dịch vụ 5 sao. Chắc chắn sẽ quay lại!",
      author: "Trần Thị Mai",
      role: "Regular Member",
    },
    {
      id: 3,
      text: "Bác sĩ thú y ở đây rất giỏi và nhiệt tình. Cún nhà mình bị ốm, được bác sĩ khám và tư vấn rất kỹ. Sau vài ngày điều trị bé đã khỏe lại hoàn toàn. Cảm ơn Pet Care Shop rất nhiều!",
      author: "Lê Văn Nam",
      role: "VIP Customer",
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedbacks.length);
    }, 2000); // Chuyển đổi mỗi 2 giây

    return () => clearInterval(interval);
  }, [feedbacks.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + feedbacks.length) % feedbacks.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % feedbacks.length);
  };

  const currentFeedback = feedbacks[currentIndex];

  return (
    <section 
      className="w-100 py-5 position-relative"
      style={{
        backgroundImage: "url('/images/home/feedback/backgroundfeedback.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px'
      }}
    >
      <div className="container h-100">
        <div className="row h-100 align-items-center">
          {/* Left Content */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="pe-lg-5">
              <span className="text-warning fw-bold text-uppercase mb-2 d-block">Pet Care Shop</span>
              <h2 className="display-5 fw-bold mb-4">Đánh giá dịch vụ</h2>
              
              {/* Dynamic Content */}
              <div className="feedback-content fade-in">
                <div className="mb-3 text-warning">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                
                <p className="lead mb-4 fst-italic text-muted" style={{ minHeight: '100px' }}>
                  "{currentFeedback.text}"
                </p>

                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-0">{currentFeedback.author}</h5>
                    <small className="text-muted">{currentFeedback.role}</small>
                  </div>
                  
                  <div className="d-flex gap-2">
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          
        </div>
      </div>
    </section>
  );
};

export default Feedback;
