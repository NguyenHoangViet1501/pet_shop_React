import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCartQuery } from "../../hooks/useCart";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import { useAuth } from "../../context/AuthContext";

const CartPage = () => {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState(new Set());

  const { data, isLoading, isError } = useCartQuery();
  if (!user) {
    return (
      <div className="container page-content">
        <h1 className="mb-4">Giỏ hàng</h1>

        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
            <h5>Bạn chưa đăng nhập</h5>
            <p className="text-muted">
              Vui lòng đăng nhập để xem giỏ hàng của bạn
            </p>
            <Link to="/login" className="btn btn-primary">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError || !data?.result) {
    return (
      <div className="container page-content text-center py-5">
        <div className="alert alert-danger">
          Không thể tải giỏ hàng. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  const items = data.result.items || [];

  const handleToggleSelect = (itemId, isSelected) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  if (items.length === 0) {
    return (
      <div className="container page-content">
        <h1 className="mb-4">Giỏ hàng</h1>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                  <h5>Giỏ hàng trống</h5>
                  <p className="text-muted">
                    Hãy thêm một số sản phẩm vào giỏ hàng của bạn
                  </p>
                  <Link to="/products" className="btn btn-primary">
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <h1 className="mb-4">Giỏ hàng</h1>
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={{
                    id: item.id,
                    productVariantId: item.productVariantId, // Thêm productVariantId
                    name: item.productName,
                    variantName: item.variantName,
                    image: item.imageUrl,
                    price: item.unitPrice,
                    quantity: item.quantity,
                  }}
                  isSelected={selectedItems.has(item.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <CartSummary items={items} selectedItems={selectedItems} />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
