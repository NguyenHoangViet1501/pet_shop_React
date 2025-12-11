import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { productsApi } from "../../api";

import "./header.css";

const Headernew = () => {
  return (
    <header className="site-header">
      {/* THANH TRÊN – THÔNG TIN LIÊN HỆ */}
      <div className="header-top">
        <div className="container d-flex justify-content-between align-items-center small">
          <div className="d-flex gap-4 contact mt-2">
            <span>
              <img className="phone-icon me-2" src="images/phone.png" alt="" />{" "}
              +84 904440436
            </span>
            <span className="">
              {" "}
              <img className="phone-icon me-2" src="images/mail.png" alt="" />
              abllv@gmail.com
            </span>
          </div>
          <div>
            <button className="login mt-2">
              <span>Đăng nhập/Đăng ký</span>{" "}
            </button>
          </div>
        </div>
      </div>

      {/* THANH DƯỚI – NAV CHÍNH */}
      <div className="header-main-wrapper">
        <div className="container">
          <div className="header-main d-flex align-items-center justify-content-between">
            {/* Logo */}
            <div className="d-flex align-items-center gap-2">
              <img className="logo-icon" src="/images/logo.png" alt="" />
            </div>

            {/* Menu */}
            <nav className="d-none d-md-flex gap-5 main-nav">
              <a href="/" className="nav-link-item active">
                Trang chủ
              </a>
              <a href="/" className="nav-link-item">
                Sản phẩm
              </a>
              <a href="/" className="nav-link-item">
                Dịch vụ
              </a>
              <a href="/" className="nav-link-item">
                Nhận nuôi
              </a>
            </nav>

            {/* Search + icons */}
            <div className="d-flex align-items-center gap-3">
              <div className="search-box d-none d-md-flex align-items-center">
                <input
                  type="text"
                  className="form-control border-0 shadow-0"
                  placeholder="Tìm kiếm sản phẩm..."
                />
                <button className="icon-btn">
                  <img
                    className="search-icon"
                    src="/images/search-icon.png"
                    alt=""
                  />
                </button>
              </div>

              <button className="shopping-cart">
                <img
                  className="shopping-cart"
                  src="/images/shopping-cart.png"
                  alt=""
                  h
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Headernew;
