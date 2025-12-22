import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { orderAPI } from "../../api/order";
import Button from "../../components/ui/button/Button";

const ORDER_STATUS_MAP = {
  WAITING_PAYMENT: { label: "Chờ thanh toán", className: "bg-warning" },
  PROCESSING: { label: "Đang xử lý", className: "bg-info" },
  SHIPPED: { label: "Đang giao", className: "bg-primary" },
  DELIVERED: { label: "Đã giao", className: "bg-success" },
  CANCELLED: { label: "Đã hủy", className: "bg-danger" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-secondary" },
};

const FILTER_TABS = [
  { value: "", label: "Tất cả" },
  { value: "WAITING_PAYMENT", label: "Chờ thanh toán" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔥 PAGE BẮT ĐẦU TỪ 1 (THEO API)
  const [pageNumber, setPageNumber] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = {
          pageNumber,
          size,
        };
        if (selectedStatus) {
          params.status = selectedStatus;
        }

        const res = await orderAPI.getMyOrders(token, params);

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
  }, [token, pageNumber, size, selectedStatus, refreshKey]);

  const handleCancelOrder = async (orderCode) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    setCancellingOrderId(orderCode);
    try {
      const res = await orderAPI.cancelOrder(orderCode, token);
      if (res?.success) {
        showToast("Hủy đơn hàng thành công", "success");
        setRefreshKey((prev) => prev + 1);
      } else {
        showToast(res?.message || "Hủy đơn hàng thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi hủy đơn hàng", "error");
    } finally {
      setCancellingOrderId(null);
    }
  };

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

      {/* Filter Tabs */}
      <div className="mb-4 overflow-auto">
        <div className="d-flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={
                selectedStatus === tab.value
                  ? "primary"
                  : "outline-secondary"
              }
              className="rounded-pill px-3"
              onClick={() => {
                setSelectedStatus(tab.value);
                setPageNumber(1); // Reset về trang 1 khi đổi filter
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

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
                      <Button
                        variant="outline-primary"
                        className="btn-sm"
                        onClick={() => navigate(`/orders/detail/${order.id}`)}
                      >
                        Xem
                      </Button>

                      {(order.status === "WAITING_PAYMENT" ||
                        order.status === "PROCESSING") && (
                        <Button
                          variant="outline-danger"
                          className="btn-sm ms-2"
                          onClick={() => handleCancelOrder(order.orderCode)}
                          isLoading={cancellingOrderId === order.orderCode}
                        >
                          Hủy
                        </Button>
                      )}

                      {order.status === "WAITING_PAYMENT" && (
                        <Button
                          variant="outline-warning"
                          className="btn-sm ms-2"
                          onClick={() =>
                            navigate("/checkout", {
                              state: {
                                order, // gửi nguyên object order
                                from: "orders",
                              },
                            })
                          }
                        >
                          Thanh toán lại
                        </Button>
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
