import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { productsApi } from "../../api";

import "./header.css";

const Headernew = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const response = await productsApi.getProducts({
            search: searchQuery,
            size: 5,
          });
          const products = response?.result?.content || [];
          setSearchResults(products);
          // Chỉ hiện dropdown nếu input đang được focus
          if (document.activeElement === inputRef.current) {
            setShowDropdown(true);
          }
        } catch (error) {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 900);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };
  const getProductById = async (id) => {
    try {
      const response = await productsApi.getProductById(id);
      if (response && response.result) {
        navigate(`/products/${id}`);
        return response.result;
      }
    } catch (error) {
      console.error("Error fetching product by ID:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast("Đăng xuất thành công", "success");
    navigate("/");
  };

  const activeStyle = ({ isActive }) => ({
    color: isActive ? "#f59f00" : undefined,
    fontWeight: isActive ? 600 : undefined,
  });

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
            <NavLink to="/login">
              <button className="login mt-2">
                <span>Đăng nhập/Đăng ký</span>{" "}
              </button>
            </NavLink>
          </div>
        </div>
      </div>

      {/* THANH DƯỚI – NAV CHÍNH */}
      <div className="header-main-wrapper">
        <div className="container">
          <div className="header-main d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link className="" to="/homenew" onClick={() => setSearchQuery("")}>
              <div className="d-flex align-items-center gap-2">
                <img className="logo-icon" src="/images/logo.png" alt="" />
              </div>
            </Link>

            {/* Menu */}
            <nav className="d-none d-md-flex gap-5 main-nav">
              <NavLink className="nav-link-item " to="/homenew">
                <span href="/" className="">
                  Trang chủ
                </span>
              </NavLink>
              <NavLink className="nav-link-item" to="/products">
                <span className="">Sản phẩm</span>
              </NavLink>

              <NavLink className="nav-link-item" to="/services">
                <span className="">Dịch vụ</span>
              </NavLink>
              <NavLink className="nav-link-item" to="/adoption">
                <span className>Nhận nuôi</span>
              </NavLink>
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
