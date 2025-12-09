import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getProductById(id);
        const productData = response.result;
        setProduct(productData);
        
        // Set default variant (first one)
        if (productData.productVariant && productData.productVariant.length > 0) {
          setSelectedVariant(productData.productVariant[0]);
        }

        // Set default image
        if (productData.productImage && productData.productImage.length > 0) {
          const primary = productData.productImage.find(img => img.isPrimary === 1);
          setActiveImage(primary ? primary.imageUrl : productData.productImage[0].imageUrl);
        } else {
          setActiveImage('https://via.placeholder.com/500x500?text=No+Image');
        }
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

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
          <div>{error || 'Không tìm thấy sản phẩm.'}</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>Quay lại danh sách</button>
        </div>
      </div>
    );
  }
  
  // Giá hiển thị
  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  
  // Check tồn kho theo Variant đang chọn
  const isOutOfStock = selectedVariant ? Number(selectedVariant.stockQuantity) === 0 : true;

  const handleAddToCart = () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning');
      return;
    }
    
    if (isOutOfStock) {
      showToast('Phiên bản này đã hết hàng', 'error');
      return;
    }

    if (!selectedVariant) {
      showToast('Sản phẩm này chưa có phiên bản giá', 'error');
      return;
    }

    // Check số lượng trong giỏ hàng
    const cartItem = items.find(item => item.id === product.id);
    const currentCartQuantity = cartItem ? cartItem.quantity : 0;

    if (currentCartQuantity + quantity > selectedVariant.stockQuantity) {
      const message = currentCartQuantity > 0 
        ? `Giỏ hàng đã có ${currentCartQuantity} sản phẩm. Tổng số lượng vượt quá tồn kho (${selectedVariant.stockQuantity})`
        : `Số lượng bạn chọn vượt quá tồn kho (Còn: ${selectedVariant.stockQuantity})`;
      showToast(message, 'error');
      return;
    }

    addItem({ 
      ...product, 
      variant: selectedVariant, // Lưu cả object variant
      quantity, 
      price: currentPrice,
      image: activeImage // Lưu ảnh để hiển thị trong giỏ
    });
    showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
  };

  return (
    <div className="container page-content">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-3">
            <img
              src={activeImage}
              alt={product.name}
              className="card-img-top rounded-4"
              style={{ width: '100%', height: '480px', objectFit: 'cover' }}
            />
          </div>

          {product.productImage && product.productImage.length > 0 && (
            <div className="d-flex gap-2 overflow-auto pb-2">
              {product.productImage.map((img, index) => (
                <div 
                  key={index} 
                  className={`rounded-3 overflow-hidden border ${activeImage === img.imageUrl ? 'border-primary border-2' : 'border-transparent'}`}
                  style={{ width: '80px', height: '80px', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => setActiveImage(img.imageUrl)}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={`Thumbnail ${index}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-lg-6">
          <div className="fw-semibold mb-2 text-primary">Danh mục: {product.categoryName}</div>
          <h2 className="mb-2 fw-bold">{product.name}</h2>
          
          <div className="h3 text-danger mb-3 fw-bold">{formatPrice(selectedVariant?.price || 0)}</div>
          
          <div className="mb-4">
            {isOutOfStock ? (
              <div className="fw-semibold mb-1 text-danger">
                <i className="fas fa-times-circle me-1"></i>Hết hàng
              </div>
            ) : (
              <div className="fw-semibold mb-1 text-success">
                <i className="fas fa-check-circle me-1"></i>Còn hàng
                <span className="text-muted ms-2 small" style={{ fontSize: '0.9rem' }}>
                  (Còn {selectedVariant?.stockQuantity} sản phẩm)
                </span>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="fw-bold mb-2">Mô tả sản phẩm</div>
            <p className="text-muted mb-0" style={{lineHeight: '1.6'}}>{product.description}</p>
          </div>

          {product.productVariant && product.productVariant.length > 0 && (
            <div className="mb-4">
              <div className="fw-bold mb-2">Chọn phiên bản</div>
              <select 
                className="form-select" 
                value={selectedVariant?.id || ''} 
                onChange={(e) => {
                  const v = product.productVariant.find(pv => String(pv.id) === e.target.value);
                  setSelectedVariant(v);
                }}
              >
                {product.productVariant.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.variantName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isOutOfStock && (
            <div className="d-flex align-items-center mb-4">
              <div className="me-3 fw-bold">Số lượng:</div>
              <div className="input-group" style={{ width: 140 }}>
                <button className="btn btn-outline-secondary" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <input className="form-control text-center fw-bold" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))} />
                <button className="btn btn-outline-secondary" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>
          )}

          <div className="d-flex gap-3 mb-4">
            <button 
              className={`btn btn-lg px-4 ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <i className="fas fa-cart-plus me-2"></i>
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
            <Link className="btn btn-outline-secondary btn-lg px-4" to="/products">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      <hr className="my-5" />
      <h4 className="mb-3">Đánh giá khách hàng</h4>
      <div className="text-muted">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</div>
    </div>
  );
};

export default ProductDetail;
