import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Lấy ảnh primary (isPrimary = 1) hoặc ảnh đầu tiên
  const primaryImage = product.productImage?.find(img => img.isPrimary === 1);
  const imageUrl = primaryImage?.imageUrl || product.productImage?.[0]?.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

  // Lấy giá từ variant đầu tiên hoặc giá mặc định
  const price = product.productVariant?.[0]?.price || 0;

  // Format giá VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning');
      return;
    }
    if (Number(product.stockQuantity) === 0) {
      showToast('Sản phẩm này đã hết hàng', 'error');
      return;
    }
    addItem(product);
    showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
  };

  const isOutOfStock = Number(product.stockQuantity) === 0;

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card product-card position-relative h-100">
        {product.isFeatured === "1" && <div className="featured-badge">Featured</div>}
        {isOutOfStock && (
          <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded small fw-bold" style={{zIndex: 10}}>
            Hết hàng
          </div>
        )}
        <Link to={`/products/${product.id}`}>
          <img 
            src={imageUrl} 
            className="card-img-top" 
            alt={product.name} 
            style={{ 
              height: '200px', 
              objectFit: 'cover',
              opacity: isOutOfStock ? 0.6 : 1 
            }} 
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <div className="text-muted small mb-2">
            {product.categoryName}
          </div>
          <h5 className="card-title">
            <Link to={`/products/${product.id}`} className="text-decoration-none">{product.name}</Link>
          </h5>
          <p className="card-text text-muted flex-grow-1 small">{product.shortDescription}</p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div className="price fw-bold text-primary">{formatPrice(price)}</div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <i className="fas fa-cart-plus"></i> {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;