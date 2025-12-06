import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import CartPage from '../components/cart/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import ProfilePage from '../components/user/ProfilePage';
import OrdersPage from '../components/user/OrdersPage';
import AppointmentsPage from '../components/user/AppointmentsPage';
import ServicesPage from '../components/services/ServicesPage';
import AdoptionPage from '../components/adoption/AdoptionPage';
import AdoptionRequestsPage from '../components/adoption/AdoptionRequestsPage';
import ProductDetail from '../components/product/ProductDetail';
import OrderDetail from '../components/user/OrderDetail';
import AdoptionRequestDetail from '../components/adoption/AdoptionRequestDetail';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/adoption" element={<AdoptionPage />} />
      <Route path="/adoption-requests" element={<AdoptionRequestsPage />} />
      <Route path="/adoption-requests/:id" element={<AdoptionRequestDetail />} />
    </Routes>
  );
}

export default AppRoutes;
