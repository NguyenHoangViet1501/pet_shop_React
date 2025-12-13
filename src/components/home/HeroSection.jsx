import React from "react";
import Button from "../ui/button/Button";
import "./herosection.css";

import orangeShapeSmall from "../../assets/svg/orage-shape-small.svg";
import orangeShapeMedium from "../../assets/svg/orange-shape-medium.svg";
import orangeShapeBig from "../../assets/svg/orage-shape-big.svg";
import bird from "../../assets/svg/bird.svg";
import dog from "../../assets/svg/dog.svg";
import cat from "../../assets/svg/cat.svg";
import vetchan from "../../assets/svg/vetchan.svg";
import { hover } from "@testing-library/user-event/dist/hover";
const HeroSection = () => {
  return (
    <section className="hero-section-new container py-5">
      <div className="row align-items-center position-relative">
        {/* ✅ BÊN TRÁI - NỘI DUNG */}
        <div className="col-md-6 position-relative hero-left">
          {/* Shape trang trí */}
          <img src={orangeShapeSmall} className="shape small-1" alt="" />
          <img src={orangeShapeSmall} className="shape small-2" alt="" />
          <img src={bird} className="shape bird" alt="" />

          <p className="text-warning fw-bold fs-4">Pet Care Shop</p>

          <h1 className="fw-bold hero-title">
            Cửa hàng thú cưng <br /> với mọi thứ bạn cần.
          </h1>

          <p className="text-muted pt-3 hero-desc">
            Chúng tôi cung cấp sản phẩm chính hãng và dịch vụ chăm sóc chất
            lượng dành cho thú cưng. Mỗi trải nghiệm đều được thực hiện với sự
            tận tâm và chuyên nghiệp. Pet Care của chúng tôi luôn là lựa chọn
            đáng tin cậy cho bạn và thú cưng.
          </p>

          <Button className="mt-4">Khám phá ngay</Button>
        </div>

        {/* ✅ BÊN PHẢI - HÌNH ẢNH */}
        <div className="col-md-6 position-relative hero-right text-center">
          <img src={vetchan} className="vetchan" alt="" />
          {/* Nền cam to + vừa */}
          <img src={orangeShapeBig} className="shape big-bg" alt="" />
          <img src={orangeShapeMedium} className="shape medium-bg" alt="" />

          {/* Chó + Mèo */}

          <img src={cat} className="pet-img cat" alt="cat" />
          <img src={dog} className="pet-img dog" alt="dog" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
