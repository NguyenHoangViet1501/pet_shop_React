import React, { useEffect } from 'react';

const BrandFeature = () => {
  useEffect(() => {
    const carouselElement = document.getElementById('brandCarousel');
    if (carouselElement && window.bootstrap) {
      const carousel = new window.bootstrap.Carousel(carouselElement, {
        interval: 2000,
        ride: 'carousel'
      });
      carousel.cycle();
    }
  }, []);

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="fw-bold mb-4">Thương hiệu nổi bật</h2>
        <div id="brandCarousel" className="carousel slide rounded-4 overflow-hidden shadow-sm" data-bs-ride="carousel" data-bs-interval="2000">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#brandCarousel" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#brandCarousel" data-bs-slide-to="1"></button>
            <button type="button" data-bs-target="#brandCarousel" data-bs-slide-to="2"></button>
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active" data-bs-interval="2000">
              <img src="/images/home/brand/Gemini_Generated_Image_2c63vq2c63vq2c63.png" className="d-block w-100" alt="Brand 1" style={{ height: '400px', objectFit: 'cover' }} />
            </div>
            <div className="carousel-item" data-bs-interval="2000">
              <img src="/images/home/brand/Gemini_Generated_Image_ksrwrksrwrksrwrk.png" className="d-block w-100" alt="Brand 2" style={{ height: '400px', objectFit: 'cover' }} />
            </div>
            <div className="carousel-item" data-bs-interval="2000">
              <img src="/images/home/brand/unnamed.jpg" className="d-block w-100" alt="Brand 3" style={{ height: '400px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandFeature;
