import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { orderAPI } from "../../api/order";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderDetail(id, token);
        setOrder(res.result);
      } catch (err) {
        console.error(err);
        showToast("Không tìm thấy đơn hàng", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, showToast]);

  if (loading) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>Không tìm thấy đơn hàng.</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/orders")}
          >
            Về danh sách
          </button>
        </div>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <div className="container page-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Chi tiết đơn hàng #{order.id}</h1>
        <Link to="/orders" className="btn btn-outline-secondary">
          Quay lại
        </Link>
      </div>

      <div className="row g-3">
        {/* LEFT */}
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <div>
                  <div className="text-muted small">Ngày đặt</div>
                  <div className="fw-semibold">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>

                <span
                  className={`badge ${
                    order.status === "PAID"
                      ? "bg-success"
                      : order.status === "PENDING"
                      ? "bg-warning"
                      : "bg-secondary"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="text-muted small mb-1">Địa chỉ giao hàng</div>
              <div className="mb-3">{order.shippingAddress}</div>

              <div className="text-muted small mb-1">
                Phương thức thanh toán
              </div>
              <div>{order.paymentMethod}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Sản phẩm</h5>

              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center py-2 border-bottom"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="me-3"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{item.productName}</div>
                    <div className="text-muted small">
                      Số lượng: {item.quantity}
                    </div>
                  </div>
                  <div className="fw-semibold">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Tóm tắt đơn hàng</h5>

              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")} ₫</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển</span>
                <span>{order.shippingAmount.toLocaleString("vi-VN")} ₫</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between fw-bold">
                <span>Tổng tiền</span>
                <span>{order.totalAmount.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>

          <div className="d-grid mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/products")}
            >
              Mua thêm sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
