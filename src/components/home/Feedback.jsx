import React, { useEffect } from 'react';

const Feedback = () => {
  useEffect(() => {
    const carouselElement = document.getElementById('feedbackCarousel');
    if (carouselElement && window.bootstrap) {
      new window.bootstrap.Carousel(carouselElement, {
        interval: 5000,
        wrap: true
      });
    }
  }, []);

  const images = [
    '/images/Gemini_Generated_Image_2c63vq2c63vq2c63.png',
    '/images/Gemini_Generated_Image_ksrwrksrwrksrwrk.png',
    '/images/danhgia1.png'
  ];

  return (
    <section className="w-100 p-0 bg-white position-relative">
      <div id="feedbackCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          {images.map((img, index) => (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <img 
                src={img} 
                className="d-block w-100" 
                alt={`Slide ${index + 1}`}
                style={{ height: '600px', objectFit: 'cover' }} 
              />
            </div>
          ))}
        </div>

        {/* Custom Navigation Buttons */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2" style={{zIndex: 10}}>
           <button className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center" 
                   style={{width: '40px', height: '40px'}}
                   data-bs-target="#feedbackCarousel" 
                   data-bs-slide="prev">
              <i className="fas fa-chevron-left text-white"></i>
           </button>
           <button className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center" 
                   style={{width: '40px', height: '40px'}}
                   data-bs-target="#feedbackCarousel" 
                   data-bs-slide="next">
              <i className="fas fa-chevron-right text-white"></i>
           </button>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
