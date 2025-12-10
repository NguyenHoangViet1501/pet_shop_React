import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import HeroSection from "../../components/home/HeroSection.jsx";
import DisplayService from "../../components/home/DisplayService.jsx";
import DetailServiceHome from "../../components/home/DetailServiceHome.jsx";

const HomePageNew = () => {
  const navigate = useNavigate();
  return (
    <section>
      <HeroSection />
      <DisplayService />
      <DetailServiceHome />
    </section>
  );
};

export default HomePageNew;
