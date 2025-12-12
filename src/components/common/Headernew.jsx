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
            <Link className="" to="/" onClick={() => setSearchQuery("")}>
              <div className="d-flex align-items-center gap-2">
                <img className="logo-icon" src="/images/logo.png" alt="" />
              </div>
            </Link>

            {/* Menu */}
            <nav className="d-none d-md-flex gap-5 main-nav">
              <NavLink className="nav-link-item " to="/">
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

                {/* ⭐ DROPDOWN nằm ngay dưới form */}
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
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                      borderRadius: "4px",
                    }}
                  >
                    {searchResults.map((product) => {
                      const primaryImage = product.productImage?.find(
                        (img) => img.isPrimary === 1
                      );

                      const imageUrl =
                        primaryImage?.imageUrl ||
                        product.productImage?.[0]?.imageUrl ||
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
                            <div
                              className="text-truncate fw-bold"
                              style={{ fontSize: "0.9rem" }}
                            >
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

              <Link to="/cart">
                <div>
                  <button className="shopping-cart">
                    <img
                      className="shopping-cart"
                      src="/images/shopping-cart.png"
                      alt=""
                    />
                    <span className="">{getTotalItems()}</span>
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Headernew;
