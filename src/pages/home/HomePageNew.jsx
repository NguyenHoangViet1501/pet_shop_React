import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import HeroSection from "../../components/home/HeroSection.jsx";

const products = {
  name: "Welcome to Pet Shop",
  age: "20",
};

const HomePageNew = () => {
  const navigate = useNavigate();
  return (
    <section>
      <HeroSection products={products} />
    </section>
  );
};

export default HomePageNew;
