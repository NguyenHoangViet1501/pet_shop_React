import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Mock order data; in real app this would come from API/state
const MOCK_ORDERS = {
  ORD001: {
    id: 'ORD001',
    date: '2025-09-10',
    status: 'Đang giao',
    statusClass: 'bg-info',
    shippingAddress: 'Nguyễn Văn A, 123 Đường ABC, Phường 1, Quận 1, TP.HCM',
    paymentMethod: 'COD',
    items: [
      { id: 1, name: 'Premium Dog Food 15kg', price: 45.99, quantity: 1, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=200&q=60' },
      { id: 2, name: 'Dog Grooming Kit', price: 29.99, quantity: 1, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=200&q=60' }
    ],
    shippingFee: 5,
  },
  ORD002: {
    id: 'ORD002',
    date: '2025-09-05',
    status: 'Đã giao',
    statusClass: 'bg-success',
    shippingAddress: 'Nguyễn Văn A, 456 Đường DEF, Phường 5, Quận 3, TP.HCM',
    paymentMethod: 'VNPay',
    items: [
      { id: 3, name: 'Interactive Cat Toy Ball', price: 12.99, quantity: 1, image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=200&q=60' },
      { id: 6, name: 'Puppy Training Treats', price: 18.99, quantity: 1, image: 'https://images.unsplash.com/photo-1605460375648-278bcbd579a6?auto=format&fit=crop&w=200&q=60' }
    ],
    shippingFee: 5,
  },
  ORD003: {
    id: 'ORD003',
    date: '2025-09-01',
    status: 'Đang xử lý',
    statusClass: 'bg-warning',
    shippingAddress: 'Nguyễn Văn A, 123 Đường ABC, Phường 1, Quận 1, TP.HCM',
    paymentMethod: 'COD',
    items: [
      { id: 4, name: 'Cat Scratching Post', price: 35.99, quantity: 1, image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=200&q=60' }
    ],
    shippingFee: 5,
  }
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = MOCK_ORDERS[id];

  if (!order) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>Không tìm thấy đơn hàng.</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/orders')}>Về danh sách</button>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + order.shippingFee;

  return (
    <div className="container page-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Chi tiết đơn hàng #{order.id}</h1>
        <Link to="/orders" className="btn btn-outline-secondary">Quay lại</Link>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="text-muted small">Ngày đặt</div>
                  <div className="fw-semibold">{new Date(order.date).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <span className={`badge ${order.statusClass} me-2`}>{order.status}</span>
                </div>
              </div>

              <div className="text-muted small mb-2">Địa chỉ giao hàng</div>
              <div className="mb-3">{order.shippingAddress}</div>

              <div className="text-muted small mb-2">Phương thức thanh toán</div>
              <div>{order.paymentMethod}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Sản phẩm</h5>
              {order.items.map(item => (
                <div key={item.id} className="d-flex align-items-center py-2 border-bottom">
                  <img src={item.image} alt={item.name} className="me-3" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-muted small">Số lượng: {item.quantity}</div>
                  </div>
                  <div className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Tóm tắt đơn hàng</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển</span>
                <span>${order.shippingFee.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Tổng tiền</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="d-grid mt-3">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/products')}>Mua thêm sản phẩm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

