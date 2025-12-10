import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import HeroSection from "../../components/home/HeroSection.jsx";

const HomePageNew = () => {
  const navigate = useNavigate();
  return (
    <section>
      <HeroSection />
    </section>
  );
};

export default HomePageNew;
