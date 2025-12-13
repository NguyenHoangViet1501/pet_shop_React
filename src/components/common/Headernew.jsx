import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useCartQuery } from "../../hooks/useCart.js";
import { productsApi } from "../../api";

import "./header.css";

const Headernew = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { data: cart } = useCartQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const [openInfo, setOpenInfo] = useState(false);

  // ✅ Tổng số item trong cart (React Query là nguồn duy nhất)
  const totalItems = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  // ✅ Tự đóng dropdown user khi đổi route
  useEffect(() => {
    setOpenInfo(false);
  }, [location.pathname]);

  // 🔍 Search debounce
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
    }, 600);

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

  const handleLogout = async () => {
    await logout();
    showToast("Đăng xuất thành công", "success");
    navigate("/");
  };

  return (
    <header className="site-header">
      {/* ================= HEADER TOP ================= */}
      <div className="header-top">
        <div className="container d-flex justify-content-between align-items-center small">
          <div className="d-flex gap-4 contact mt-2">
            <span>
              <img className="phone-icon me-2" src="/images/phone.png" alt="" />
              +84 904440436
            </span>
            <span>
              <img className="phone-icon me-2" src="/images/mail.png" alt="" />
              abllv@gmail.com
            </span>
          </div>

          <div>
            {user ? (
              <div className="dropdown">
                <button
                  className="button-info dropdown-toggle"
                  type="button"
                  onClick={() => setOpenInfo((prev) => !prev)}
                >
                  Xin chào, {user.fullName}
                </button>

                {openInfo && (
                  <ul className="dropdown-menu show dropdown-menu-end">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setOpenInfo(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/orders"
                        onClick={() => setOpenInfo(false)}
                      >
                        Đơn hàng
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/appointments"
                        onClick={() => setOpenInfo(false)}
                      >
                        Lịch hẹn
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/adoption-requests"
                        onClick={() => setOpenInfo(false)}
                      >
                        Đơn nhận nuôi
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <NavLink to="/login">
                <button className="login mt-2">
                  <span>Đăng nhập / Đăng ký</span>
                </button>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* ================= HEADER MAIN ================= */}
      <div className="header-main-wrapper">
        <div className="container">
          <div className="header-main d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link to="/" onClick={() => setSearchQuery("")}>
              <img className="logo-icon" src="/images/logo.png" alt="Logo" />
            </Link>

            {/* Menu */}
            <nav className="d-none d-md-flex gap-5 main-nav">
              <NavLink className="nav-link-item" to="/">
                Trang chủ
              </NavLink>
              <NavLink className="nav-link-item" to="/products">
                Sản phẩm
              </NavLink>
              <NavLink className="nav-link-item" to="/services">
                Dịch vụ
              </NavLink>
              <NavLink className="nav-link-item" to="/adoption">
                Nhận nuôi
              </NavLink>
            </nav>

            {/* Search + Cart */}
            <div className="d-flex align-items-center gap-3">
              {/* Search */}
              <div
                className="search-box d-none d-md-flex align-items-center"
                style={{ position: "relative" }}
              >
                <form
                  onSubmit={handleSearch}
                  className="d-flex"
                  style={{ width: "250px" }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control border-0 shadow-0"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  />
                  <button className="icon-btn">
                    <img
                      className="search-icon"
                      src="/images/search-icon.png"
                      alt=""
                    />
                  </button>
                </form>

                {showDropdown && searchResults.length > 0 && (
                  <div
                    className="dropdown-menu show w-100"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 2000,
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.map((product) => {
                      const primaryImage =
                        product.productImage?.find(
                          (img) => img.isPrimary === 1
                        ) || product.productImage?.[0];

                      const imageUrl =
                        primaryImage?.imageUrl ||
                        "https://via.placeholder.com/50";

                      const price = product.productVariant?.[0]?.price || 0;

                      return (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="dropdown-item d-flex align-items-center p-2 border-bottom"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="rounded me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="text-truncate fw-bold">
                              {product.name}
                            </div>
                            <div className="text-danger small">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(price)}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="shopping-cart-wrapper">
                <img
                  className="shopping-cart"
                  src="/images/shopping-cart.png"
                  alt="Cart"
                />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Headernew;
