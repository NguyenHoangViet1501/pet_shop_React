import React from 'react';

const About = () => {
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <h2 className="fw-bold mb-4">Về chúng tôi</h2>
        
        <div className="row mb-5 gx-5">
          <div className="col-md-6 mb-3 mb-md-0">
            <p className="text-secondary" style={{ lineHeight: '1.8', fontSize: '14px' }}>
              PetCare tự hào là Pet Shop đầu tiên tại thành phố Hà Nội từ năm 2017 và đã nhận được sự tin tưởng và ủng hộ của hơn 15.218 khách hàng thường xuyên trong thời gian qua. Chúng tôi luôn cố gắng nỗ lực hơn nữa để mang đến cho khách hàng những sản phẩm và dịch vụ tốt nhất.
            </p>
          </div>
          <div className="col-md-6">
            <p className="text-secondary" style={{ lineHeight: '1.8', fontSize: '14px' }}>
              Giao hàng nội thành Hà Nội trong 2 giờ, phí ship từ 15k và miễn phí cho đơn từ 200k. Bạn có thể chọn hàng ngàn sản phẩm cho thú cưng – từ thức ăn, đồ chơi, cát vệ sinh đến chuồng, lồng và phụ kiện – tất cả đều được chọn lọc kỹ, đảm bảo chất lượng và giá hợp lý.
            </p>
          </div>
        </div>
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <img src="/images/about1.png" alt="Cam kết chính hãng" className="img-fluid w-100" />
          </div>
          <div className="col-md-4">
            <img src="/images/about2.png" alt="Giá cả hợp lý" className="img-fluid w-100" />
          </div>
          <div className="col-md-4">
            <img src="/images/about3.png" alt="Giao nhanh tiện lợi" className="img-fluid w-100" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
