import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productsApi } from "../../api";
import { useCart } from "../../context/CartContext";
import { useCartQuery } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: cartData } = useCartQuery();
  const items = cartData?.result?.items || [];
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getProductById(id);
        const productData = response.result;
        setProduct(productData);

        // Set default variant (first one)
        if (
          productData.productVariant &&
          productData.productVariant.length > 0
        ) {
          setSelectedVariant(productData.productVariant[0]);
        }

        // Set default image
        if (productData.productImage && productData.productImage.length > 0) {
          const primary = productData.productImage.find(
            (img) => img.isPrimary === 1
          );
          setActiveImage(
            primary ? primary.imageUrl : productData.productImage[0].imageUrl
          );
        } else {
          setActiveImage("https://via.placeholder.com/500x500?text=No+Image");
        }

        // Fetch similar products
        if (productData.categoryId) {
          try {
            const similarRes = await productsApi.getProducts({
              categoryId: productData.categoryId,
              size: 6,
            });
            if (similarRes?.result?.content) {
              setSimilarProducts(
                similarRes.result.content
                  .filter((p) => p.id !== productData.id)
                  .slice(0, 5)
              );
            }
          } catch (err) {
            console.error("Error fetching similar products:", err);
          }
        }
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    if (descriptionRef.current) {
      // Check if height exceeds ~10 lines (approx 250px)
      if (descriptionRef.current.scrollHeight > 250) {
        setShowExpandButton(true);
      } else {
        setShowExpandButton(false);
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>{error || "Không tìm thấy sản phẩm."}</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/products")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Giá hiển thị
  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Check tồn kho theo Variant đang chọn
  const isOutOfStock = selectedVariant
    ? Number(selectedVariant.stockQuantity) === 0
    : true;

  const handleAddToCart = async () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "warning");
      return;
    }

    if (isOutOfStock) {
      showToast("Phiên bản này đã hết hàng", "error");
      return;
    }

    if (!selectedVariant) {
      showToast("Sản phẩm này chưa có phiên bản giá", "error");
      return;
    }

    // Check số lượng trong giỏ hàng
    const cartItem = items.find(
      (item) => item.productVariantId === selectedVariant.id
    );
    const currentCartQuantity = cartItem ? cartItem.quantity : 0;

    if (currentCartQuantity + quantity > selectedVariant.stockQuantity) {
      const message =
        currentCartQuantity > 0
          ? `Giỏ hàng đã có ${currentCartQuantity} sản phẩm. Tổng số lượng vượt quá tồn kho (${selectedVariant.stockQuantity})`
          : `Số lượng bạn chọn vượt quá tồn kho (Còn: ${selectedVariant.stockQuantity})`;
      showToast(message, "error");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItem({
        ...product,
        variant: selectedVariant, // Lưu cả object variant
        quantity,
        price: currentPrice,
        image: activeImage, // Lưu ảnh để hiển thị trong giỏ
      });
      showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast(error?.message || "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="container page-content py-4">
      <div className="row g-5">
        {/* Left Column: Images + Description */}
        <div className="col-lg-6">
          <div className="card border-0 mb-3">
            <img
              src={activeImage}
              alt={product.name}
              className="card-img-top rounded-4"
              style={{ width: "100%", height: "480px", objectFit: "cover" }}
            />
          </div>

          {product.productImage && product.productImage.length > 0 && (
            <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
              {product.productImage.map((img, index) => (
                <div
                  key={index}
                  className={`rounded-3 overflow-hidden border ${
                    activeImage === img.imageUrl
                      ? "border-primary border-2"
                      : "border-transparent"
                  }`}
                  style={{
                    width: "80px",
                    height: "80px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    setActiveImage(img.imageUrl);
                    if (product.productVariant) {
                      const variant = product.productVariant.find(
                        (v) =>
                          v.imageUrl === img.imageUrl ||
                          (Array.isArray(v.imageUrl) &&
                            v.imageUrl.includes(img.imageUrl))
                      );
                      if (variant) {
                        setSelectedVariant(variant);
                      }
                    }
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Thumbnail ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="mt-4">
            <h5 className="fw-bold text-uppercase mb-3">Mô tả sản phẩm</h5>
            <div
              className={`position-relative ${
                !isExpanded ? "overflow-hidden" : ""
              }`}
              style={{ maxHeight: isExpanded ? "none" : "250px" }}
            >
              <p
                ref={descriptionRef}
                className="text-muted"
                style={{ whiteSpace: "pre-line" }}
              >
                {product.description}
              </p>
              {!isExpanded && showExpandButton && (
                <div
                  className="position-absolute bottom-0 start-0 w-100 h-50"
                  style={{
                    background: "linear-gradient(transparent, white)",
                  }}
                ></div>
              )}
            </div>
            {showExpandButton && (
              <button
                className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Info + Similar Products */}
        <div className="col-lg-6">
          <div className="text-primary fw-bold mb-2">
            <Link to="/products" className="text-decoration-none text-primary">
              Sản phẩm
            </Link>{" "}
            &gt; {product.categoryName}
          </div>
          <h1 className="fw-bold mb-2 h2">{product.name}</h1>

          <div
            className="h3 fw-bold mb-2"
            style={{ color: "#fd7e14" }} // Bootstrap orange
          >
            {formatPrice(selectedVariant?.price || 0)}
          </div>

          {/* Rating Placeholder */}
          <div className="mb-3 d-flex align-items-center gap-2">
            <div className="text-warning small">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            <span className="text-muted small">4.9 | 12 đánh giá</span>
          </div>

          <div className="mb-4">
            {isOutOfStock ? (
              <div className="fw-semibold mb-1 text-danger">
                <i className="fas fa-times-circle me-1"></i>Hết hàng
              </div>
            ) : (
              <div className="fw-semibold mb-1 text-success">
                <i className="fas fa-check-circle me-1"></i>Còn hàng
                <span className="text-muted ms-2 small">
                  (Còn {selectedVariant?.stockQuantity} sản phẩm)
                </span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="fw-bold mb-2">Mô tả ngắn</div>
            <p className="text-muted mb-0 small">
              {product.description
                ? product.description.substring(0, 100) + "..."
                : "Đang cập nhật"}
            </p>
          </div>

          {product.productVariant && product.productVariant.length > 0 && (
            <div className="mb-4">
              <div className="fw-bold mb-2">Loại sản phẩm</div>
              <div className="d-flex flex-wrap gap-2">
                {product.productVariant.map((v) => (
                  <button
                    key={v.id}
                    className={`btn btn-sm px-3 py-2 rounded-3 ${
                      selectedVariant?.id === v.id
                        ? "btn-outline-primary active"
                        : "btn-outline-secondary"
                    }`}
                    style={{ minWidth: "80px" }}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.imageUrl) {
                        const imgUrl = Array.isArray(v.imageUrl)
                          ? v.imageUrl[0]
                          : v.imageUrl;
                        if (imgUrl) setActiveImage(imgUrl);
                      }
                    }}
                  >
                    {v.variantName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isOutOfStock && (
            <div className="d-flex align-items-center mb-4">
              <div className="me-3 fw-bold">Số lượng:</div>
              <div
                className="d-flex align-items-center border rounded-3"
                style={{ width: "fit-content" }}
              >
                <button
                  className="btn btn-link text-dark text-decoration-none px-3"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ boxShadow: "none" }}
                >
                  −
                </button>
                <input
                  className="form-control text-center border-0 fw-bold p-0"
                  style={{
                    width: "40px",
                    boxShadow: "none",
                    background: "transparent",
                  }}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, parseInt(e.target.value || "1", 10))
                    )
                  }
                />
                <button
                  className="btn btn-link text-dark text-decoration-none px-3"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{ boxShadow: "none" }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="d-flex gap-3 mb-5">
            <Button
              className={`btn-lg px-4 text-white fw-bold ${
                isOutOfStock ? "btn-secondary" : ""
              }`}
              style={{
                backgroundColor: isOutOfStock ? undefined : "#fd7e14",
                borderColor: isOutOfStock ? undefined : "#fd7e14",
              }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              isLoading={isAddingToCart}
            >
              <i className="fas fa-cart-plus me-2"></i>
              {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            </Button>
            <Link
              className="btn btn-outline-secondary btn-lg px-4"
              to="/products"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="mt-4 pt-4 border-top">
              <h5 className="fw-bold text-uppercase mb-3 text-secondary">
                Top sản phẩm tương tự
              </h5>
              <div className="d-flex flex-column gap-3">
                {similarProducts.map((p) => (
                  <div
                    key={p.id}
                    className="d-flex gap-3 align-items-center p-2 rounded hover-bg-light"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <img
                      src={
                        p.productImage && p.productImage.length > 0
                          ? p.productImage[0].imageUrl
                          : "https://via.placeholder.com/80"
                      }
                      alt={p.name}
                      className="rounded-3 border"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="fw-bold text-dark mb-1">{p.name}</div>
                      <div
                        className="fw-bold"
                        style={{ color: "#fd7e14" }}
                      >
                        {formatPrice(
                          p.productVariant && p.productVariant.length > 0
                            ? p.productVariant[0].price
                            : 0
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="my-5" />
      <h4 className="mb-3">Đánh giá khách hàng</h4>
      <div className="text-muted">
        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
      </div>
    </div>
  );
};

export default ProductDetailPage;
