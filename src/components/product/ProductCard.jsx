import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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

  // Navigate to product detail when card is clicked
  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const isOutOfStock = Number(product.stockQuantity) === 0;

  return (
    <div
      className="card product-card border-0 shadow-sm h-100"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
      style={{ cursor: 'pointer' }}
    >
      {product.isFeatured === "1" && <div className="featured-badge">Featured</div>}
      {isOutOfStock && (
        <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded small fw-bold" style={{zIndex: 10}}>
          Hết hàng
        </div>
      )}
      <div className="text-center p-3">
        <img 
          src={imageUrl} 
          className="card-img-top" 
          alt={product.name} 
          style={{ 
            height: '180px', 
            objectFit: 'contain',
            opacity: isOutOfStock ? 0.6 : 1 
          }} 
        />
      </div>
      <div className="card-body d-flex flex-column px-3 pb-3 pt-0">
        <div className="text-muted small mb-1">
          {product.categoryName}
        </div>
        <h6 className="card-title fw-bold mb-2">{product.name}</h6>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="fw-bold" style={{ color: 'var(--primary-orange)', fontSize: '1.1rem' }}>
            {formatPrice(price)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;