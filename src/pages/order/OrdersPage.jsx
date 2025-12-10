import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const navigate = useNavigate();
  const sampleOrders = [
    {
      id: 'ORD001',
      date: '2025-09-10',
      status: 'Đang giao',
      total: 75.98,
      statusClass: 'bg-info'
    },
    {
      id: 'ORD002',
      date: '2025-09-05',
      status: 'Đã giao',
      total: 45.99,
      statusClass: 'bg-success'
    },
    {
      id: 'ORD003',
      date: '2025-09-01',
      status: 'Đang xử lý',
      total: 29.99,
      statusClass: 'bg-warning'
    }
  ];

  return (
    <div className="container page-content">
      <h1 className="mb-4">Đơn hàng của tôi</h1>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sampleOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                    <td><span className={`badge ${order.statusClass}`}>{order.status}</span></td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/orders/${order.id}`)}>
                        Xem chi tiết
                      </button>
                      {order.status === 'Đã giao' && (
                        <button className="btn btn-sm btn-outline-success">
                          Đánh giá
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

