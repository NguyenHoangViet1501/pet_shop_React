import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { productsApi } from "../../api";

const Header = () => {
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
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <Link
          className="navbar-brand"
          to="/"
          onClick={() => setSearchQuery("")}
        >
          <i className="fas fa-paw text-warning"></i>
          <span className="text-warning">PawMart</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/products" style={activeStyle}>
                Sản phẩm
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/services" style={activeStyle}>
                Dịch vụ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/adoption" style={activeStyle}>
                Nhận nuôi
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <div className="position-relative me-3" style={{ width: "300px" }}>
              <form className="input-group" onSubmit={handleSearch}>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                <button className="btn btn-outline-secondary" type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>

              {showDropdown && searchResults.length > 0 && (
                <div
                  className="dropdown-menu show w-100"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 1000,
                    maxHeight: "400px",
                    overflowY: "auto",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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

            <Link
              to="/cart"
              className="btn btn-outline-primary me-2 position-relative"
            >
              <i className="fas fa-shopping-cart"></i>
              <span className="cart-badge">{getTotalItems()}</span>
            </Link>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-user"></i> {user.fullName}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      Đơn hàng
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/appointments">
                      Lịch hẹn
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/adoption-requests">
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
              </div>
            ) : (
              <div>
                <Link to="/login" className="btn btn-outline-primary me-2">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
