import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const CartPage = () => {
  const { items } = useCart();

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
                  <p className="text-muted">Hãy thêm một số sản phẩm vào giỏ hàng của bạn</p>
                  <Link to="/products" className="btn btn-primary">Tiếp tục mua sắm</Link>
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
              {items.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <CartSummary />
        </div>
      </div>
    </div>
  );
};

export default CartPage;

