import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Toast from "./components/common/Toast";
import HomePage from "./pages/home/HomePage";
import ProductsPage from "./pages/product/ProductsPage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import ProfilePage from "./pages/user/ProfilePage";
import OrdersPage from "./pages/order/OrdersPage";
import AppointmentsPage from "./pages/appointment/AppointmentsPage";
import ServicesPage from "./pages/service/ServicesPage";
import AdoptionPage from "./pages/adoption/AdoptionPage";
import AdoptionRequestsPage from "./pages/adoption/AdoptionRequestsPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";
import OrderDetailPage from "./pages/order/OrderDetailPage";
import AdoptionRequestDetailPage from "./pages/adoption/AdoptionRequestDetailPage";
import HomePageNew from "./pages/home/HomePageNew";
import Headernew from "./components/common/Headernew";

function App() {
  return (
    <div className="App">
      <Headernew />
      <main style={{ marginTop: "50px", marginBottom: "50px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/homenew" element={<HomePageNew />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/adoption" element={<AdoptionPage />} />
          <Route path="/adoption-requests" element={<AdoptionRequestsPage />} />
          <Route
            path="/adoption-requests/:id"
            element={<AdoptionRequestDetailPage />}
          />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

export default App;
