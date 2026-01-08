import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFeaturedProductsQuery } from "../../hooks/useFeaturedProductsQuery";
import ProductHome from "../../components/home/ProductHome.jsx";
import HeroSection from "../../components/home/HeroSection.jsx";
import DisplayService from "../../components/home/DisplayService.jsx";
import DetailServiceHome from "../../components/home/DetailServiceHome.jsx";
import BrandFeature from "../../components/home/BrandFeature.jsx";
import Feedback from "../../components/home/Feedback.jsx";
import About from "../../components/home/About.jsx";
import Adoption from "../../components/home/Adoption.jsx";

const HomePageNew = () => {
  const { data: featuredProductsData } = useFeaturedProductsQuery(16);

  const featuredProducts = (
    Array.isArray(featuredProductsData?.result?.content)
      ? featuredProductsData.result.content
      : Array.isArray(featuredProductsData?.result)
        ? featuredProductsData.result
        : []
  ).filter((p) => p.isDeleted !== "1");

  const navigate = useNavigate();
  return (
    <section>
      <HeroSection />
      <ProductHome title="Sản phẩm nổi bật" products={featuredProducts} />
      <DisplayService />
      <DetailServiceHome />
      {/* <Adoption /> */}
      <BrandFeature />
      <Feedback />
      <About />
    </section>
  );
};

export default HomePageNew;
