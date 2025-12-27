import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/home/HomePageNew';
import ProductsPage from '../pages/ProductsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/user/ForgotPasswordPage';
import ResetPasswordPage from '../pages/user/ResetPasswordPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import ProfilePage from '../pages/ProfilePage';
import OrdersPage from '../pages/OrdersPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import ServicesPage from '../pages/ServicesPage';
import AdoptionPage from '../pages/AdoptionPage';
import AdoptionRequestsPage from '../pages/AdoptionRequestsPage';
import PetDetail from '../pages/adoption/PetDetail';
import ProductDetailPage from '../pages/ProductDetailPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import AdoptionRequestDetailPage from '../pages/AdoptionRequestDetailPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/adoption" element={<AdoptionPage />} />
      <Route path="/pets/:id" element={<PetDetail />} />
      <Route path="/adoption-requests" element={<AdoptionRequestsPage />} />
      <Route path="/adoption-requests/:id" element={<AdoptionRequestDetailPage />} />
    </Routes>
  );
}

export default AppRoutes;
