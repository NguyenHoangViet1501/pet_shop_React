import React from "react";

const HeroSection = ({ product }) => {
  return (
    <div className="hero-section blue-600 height-100 py-5">
      <div className="container text-center"> {product.name} </div>
      <div className="container text-center"> {product.age} </div>
    </div>
  );
};
export default HeroSection;
