import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { orderAPI } from "../../api/order";

const ORDER_STATUS_MAP = {
  PENDING: { label: "Đang tạo đơn", className: "bg-secondary" },
  CREATED: { label: "Đã đặt (COD)", className: "bg-secondary" },
  WAITING_PAYMENT: { label: "Chờ thanh toán", className: "bg-warning" },
  PAID: { label: "Đã thanh toán", className: "bg-success" },
  PROCESSING: { label: "Đang xử lý", className: "bg-info" },
  SHIPPING: { label: "Đang giao", className: "bg-primary" },
  COMPLETED: { label: "Hoàn thành", className: "bg-success" },
  CANCELLED: { label: "Đã hủy", className: "bg-danger" },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 PAGE BẮT ĐẦU TỪ 1 (THEO API)
  const [pageNumber, setPageNumber] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getMyOrders(token, {
          pageNumber,
          size,
        });

        if (res?.success) {
          setOrders(res.result?.content || []);
          setTotalPages(res.result?.totalPages || 1);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, pageNumber, size]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr.replace(" ", "T")).toLocaleDateString("vi-VN");
  };

  const formatMoney = (value) => Number(value).toLocaleString("vi-VN") + " đ";

  if (loading) {
    return <div className="container page-content">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="container page-content">
      <h1 className="mb-4">Đơn hàng của tôi</h1>

      <div className="card">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    Không có đơn hàng
                  </td>
                </tr>
              )}

              {orders.map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status] || {};

                return (
                  <tr key={order.orderCode}>
                    <td>#{order.orderCode}</td>
                    <td>{formatDate(order.createdDate)}</td>
                    <td>
                      <span className={`badge ${statusInfo.className}`}>
                        {statusInfo.label || order.status}
                      </span>
                    </td>
                    <td>{formatMoney(order.totalAmount)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/orders/${order.orderCode}`)}
                      >
                        Xem
                      </button>

                      {order.status === "WAITING_PAYMENT" && (
                        <button
                          className="btn btn-sm btn-outline-warning ms-2"
                          onClick={() =>
                            navigate("/checkout", {
                              state: {
                                order, // gửi nguyên object order
                                from: "orders",
                              },
                            })
                          }
                        >
                          Thanh toán
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 🔽 PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <ul className="pagination">
                <li
                  className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPageNumber((p) => p - 1)}
                  >
                    «
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  return (
                    <li
                      key={p}
                      className={`page-item ${
                        pageNumber === p ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPageNumber(p)}
                      >
                        {p}
                      </button>
                    </li>
                  );
                })}

                <li
                  className={`page-item ${
                    pageNumber === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    »
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
