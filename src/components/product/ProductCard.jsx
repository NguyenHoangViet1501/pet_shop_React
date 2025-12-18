import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/button/Button';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning');
      return;
    }
    if (Number(product.stockQuantity) === 0) {
      showToast('Sản phẩm này đã hết hàng', 'error');
      return;
    }
    try {
      setIsAddingToCart(true);
      // Lấy variant đầu tiên nếu có
      const variant = product.productVariant?.[0];
      await addItem({
        ...product,
        variant: variant,
        quantity: 1,
        price: variant?.price || 0,
        image: product.productImage?.find(img => img.isPrimary === 1)?.imageUrl || product.productImage?.[0]?.imageUrl
      });
      showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(error?.message || 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isOutOfStock = Number(product.stockQuantity) === 0;

  return (
    <div className="card product-card border-0 shadow-sm h-100">
      {product.isFeatured === "1" && <div className="featured-badge">Featured</div>}
      {isOutOfStock && (
        <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded small fw-bold" style={{zIndex: 10}}>
          Hết hàng
        </div>
      )}
      <Link to={`/products/${product.id}`} className="text-center p-3">
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
      </Link>
      <div className="card-body d-flex flex-column px-3 pb-3 pt-0">
        <div className="text-muted small mb-1">
          {product.categoryName}
        </div>
        <h6 className="card-title fw-bold mb-2">
          <Link to={`/products/${product.id}`} className="text-dark text-decoration-none">{product.name}</Link>
        </h6>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="fw-bold" style={{ color: 'var(--primary-orange)', fontSize: '1.1rem' }}>
            {formatPrice(price)}
          </div>
          <Button 
            variant="primary"
            className="rounded-circle p-0" 
            style={{ width: '36px', height: '36px' }}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            isLoading={isAddingToCart}
          >
            {!isAddingToCart && <i className="fas fa-shopping-cart text-white" style={{ fontSize: '0.9rem' }}></i>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;