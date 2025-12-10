import React from "react";
import Button from "../ui/button/Button";

const HeroSection = ({}) => {
  return (
    <div className="hero-section ">
      <Button onClick={() => alert("Button clicked")}>Khám phá ngay</Button>
    </div>
  );
};
export default HeroSection;
