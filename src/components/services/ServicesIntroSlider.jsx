import React, { useState } from "react";
import "./ServicesIntroSlider.css";

const slides = [
  {
    img: "/images/home/service2img/cat1.png",
    title: "Tắm rửa & chải lông cho thú cưng",
    desc1: "Mang đến cho thú cưng của bạn trải nghiệm spa nhẹ nhàng và sạch sẽ nhất. Dịch vụ tắm rửa & chải lông của chúng tôi sử dụng các sản phẩm chuyên dụng an toàn cho da, giúp loại bỏ bụi bẩn, mùi hôi và lông rụng hiệu quả. Đội ngũ nhân viên giàu kinh nghiệm sẽ chăm sóc cẩn thận từ bước gỡ rối, sấy khô đến tạo kiểu lông phù hợp với từng giống.",
    desc2: "Thú cưng của bạn không chỉ sạch sẽ, thơm tho mà còn cảm thấy thoải mái và thư giãn sau mỗi buổi chăm sóc.",
    button: "Đặt lịch ngay"
  },
  {
    img: "/images/home/service2img/cat2.png",
    title: "Cắt tỉa tạo kiểu toàn thân",
    desc1: "Giúp thú cưng của bạn trở nên gọn gàng, phong cách và khỏe mạnh hơn với dịch vụ cắt tỉa toàn thân chuyên nghiệp. Chúng tôi áp dụng các kỹ thuật groom hiện đại, tùy chỉnh theo giống, dáng lông và sở thích của chủ nuôi. Mỗi quy trình đều được thực hiện nhẹ nhàng, an toàn với dụng cụ khử trùng và sản phẩm chuyên dụng.",
    desc2: "Từ tạo kiểu sang trọng, dễ thương đến phong cách năng động, chúng tôi đảm bảo thú cưng sẽ có diện mạo mới sạch đẹp, thoải mái và hoàn toàn tự tin.",
    button: "Đặt lịch ngay"
  },
  {
    img: "/images/home/service2img/cat3.png",
    title: "Tiêm phòng định kỳ",
    desc1: "Bảo vệ sức khỏe thú cưng của bạn một cách toàn diện với dịch vụ tiêm phòng định kỳ tại cơ sở của chúng tôi. Các bác sĩ thú y giàu kinh nghiệm sẽ tư vấn phác đồ tiêm phù hợp từng độ tuổi, giống loài và tình trạng sức khỏe của thú cưng. Tất cả vắc xin đều được bảo quản đúng chuẩn, đảm bảo an toàn và hiệu quả phòng bệnh cao.",
    desc2: "Việc tiêm phòng định kỳ không chỉ giúp ngăn ngừa các bệnh truyền nhiễm nguy hiểm mà còn góp phần nâng cao hệ miễn dịch, giúp thú cưng của bạn luôn khỏe mạnh và tràn đầy năng lượng.",
    button: "Đặt lịch ngay"
  },
  {
    img: "/images/home/service2img/cat4.jpg",
    title: "Khám sức khỏe tổng quát",
    desc1: "Đảm bảo thú cưng của bạn luôn khỏe mạnh với dịch vụ khám sức khỏe tổng quát toàn diện. Đội ngũ bác sĩ thú y chuyên môn cao sẽ kiểm tra từ thể trạng, răng miệng, da lông, hệ tiêu hóa cho đến các chỉ số quan trọng như tim mạch và hô hấp. Chúng tôi sử dụng thiết bị hiện đại để phát hiện sớm các dấu hiệu bất thường và đưa ra phác đồ chăm sóc kịp thời.",
    desc2: "Khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề tiềm ẩn, từ đó có biện pháp can thiệp kịp thời, đảm bảo thú cưng của bạn luôn vui khỏe bên gia đình.",
    button: "Đặt lịch ngay"
  },
  {
    img: "/images/home/service2img/cat5.jpg",
    title: "Làm sạch tai & móng",
    desc1: "Giữ cho thú cưng luôn khỏe mạnh và dễ chịu với dịch vụ làm sạch tai & chăm sóc móng chuyên nghiệp. Chúng tôi nhẹ nhàng vệ sinh tai bằng dung dịch chuyên dụng, giúp loại bỏ bụi bẩn, ráy tai và ngăn ngừa các bệnh viêm nhiễm thường gặp. Đồng thời, móng sẽ được cắt tỉa đúng kỹ thuật, đảm bảo an toàn, không gây đau hay tổn thương cho thú cưng.",
    desc2: "Chăm sóc tai và móng định kỳ không chỉ giúp thú cưng của bạn cảm thấy thoải mái mà còn góp phần duy trì sức khỏe tổng thể, ngăn ngừa các vấn đề về tai và móng trong tương lai.",
    button: "Đặt lịch ngay"
  },
  {
    img: "/images/home/service2img/cat6.jpg",
    title: "Huấn luyện cơ bản",
    desc1: "Giúp thú cưng hình thành thói quen tốt ngay từ đầu với chương trình huấn luyện cơ bản được thiết kế khoa học và thân thiện. Các huấn luyện viên giàu kinh nghiệm sẽ hướng dẫn thú cưng những kỹ năng quan trọng như ngồi, nằm, gọi đến, đi đúng vị trí và biết nghe hiệu lệnh. Phương pháp huấn luyện luôn dựa trên sự kiên nhẫn, tích cực và tạo cảm giác thoải mái cho thú cưng.",
    desc2: "Tăng cường sự gắn kết giữa bạn và thú cưng thông qua các buổi huấn luyện vui nhộn và hiệu quả, giúp cả hai cùng tận hưởng những khoảnh khắc hạnh phúc bên nhau.",
    button: "Đặt lịch ngay"
  }
];

const ServicesIntroSlider = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // -1: left, 1: right

  const handlePrev = () => {
    setDirection(-1);
    setActive((a) => (a === 0 ? slides.length - 1 : a - 1));
  };
  const handleNext = () => {
    setDirection(1);
    setActive((a) => (a === slides.length - 1 ? 0 : a + 1));
  };

  return (
    <section className="services-intro-slider py-3">
      <div className="container">
        <div className="intro-slider-viewport">
          <div
            className={`intro-slider-track${direction === 1 ? ' slide-right' : direction === -1 ? ' slide-left' : ''}`}
            key={active}
          >
            <div className="row align-items-center justify-content-center intro-slider-slide">
              <div className="col-12 col-md-6 mb-4 mb-md-0 d-flex justify-content-center">
                <img
                  src={slides[active].img}
                  alt={slides[active].title}
                  className="services-intro-img"
                />
              </div>
              <div className="col-12 col-md-6">
                <h2 className="fw-bold mb-3">{slides[active].title}</h2>
                <div className="text-muted mb-4" style={{ minHeight: 80 }}>{slides[active].desc1}</div>
                <div className="text-muted mb-4" style={{ minHeight: 80 }}>{slides[active].desc2}</div>
                <button className="btn btn-warning btn-lg px-4 mb-4">
                  {slides[active].button}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center mt-5" style={{gap: '32px'}}>
          <button className="btn-dark rounded-circle intro-nav-btn" onClick={handlePrev} aria-label="Trước">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="btn-dark rounded-circle intro-nav-btn" onClick={handleNext} aria-label="Sau">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesIntroSlider;
