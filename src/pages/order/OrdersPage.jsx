import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { orderAPI } from "../../api/order";
import Button from "../../components/ui/button/Button";
import ConfirmModal from "../../components/common/ConfirmModal";

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
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToCancelCode, setOrderToCancelCode] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPaymentChange, setSelectedOrderForPaymentChange] = useState(null);
  const [updatingPaymentOrderId, setUpdatingPaymentOrderId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");

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

  // Opens confirm modal (user clicks Hủy)
  const handleCancelOrder = (orderCode) => {
    setOrderToCancelCode(orderCode);
    setConfirmOpen(true);
  };

  // Performs cancellation (after user confirms)
  const performCancelOrder = async () => {
    const orderCode = orderToCancelCode;
    if (!orderCode) return;
    setCancellingOrderId(orderCode);
    try {
      const res = await orderAPI.cancelOrder(orderCode, token);
      if (res?.success) {
        showToast("Hủy đơn hàng thành công", "success");
        setRefreshKey((prev) => prev + 1);
        setConfirmOpen(false);
        setOrderToCancelCode(null);
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

  const handleChangePaymentMethod = (order) => {
    setSelectedOrderForPaymentChange(order);
    setSelectedPaymentMethod("COD");
    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = async (method) => {
    if (!selectedOrderForPaymentChange?.id) return;

    setUpdatingPaymentOrderId(selectedOrderForPaymentChange.id);
    try {
      const res = await orderAPI.updatePaymentMethod(
        selectedOrderForPaymentChange.id,
        method.toLowerCase(),
        token
      );
      if (res?.success) {
        showToast(`Đổi phương thức thanh toán thành công (${method})`, "success");
        setRefreshKey((prev) => prev + 1);
        setShowPaymentModal(false);
        setSelectedOrderForPaymentChange(null);
      } else {
        showToast(res?.message || "Đổi phương thức thanh toán thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi đổi phương thức thanh toán", "error");
    } finally {
      setUpdatingPaymentOrderId(null);
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
                      {order.status !== 'REFUNDED' ? (
                        <span className={`badge ${statusInfo.className}`}>
                          {statusInfo.label || order.status}
                        </span>
                      ) : null}
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
                        <>
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
                          <Button
                            variant="outline-info"
                            className="btn-sm ms-2"
                            onClick={() => handleChangePaymentMethod(order)}
                            isLoading={updatingPaymentOrderId === order.id}
                          >
                            Thay đổi phương thức
                          </Button>
                        </>
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

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thay đổi phương thức thanh toán</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedOrderForPaymentChange(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="paymentCOD"
                    name="paymentMethod"
                    value="COD"
                    checked={selectedPaymentMethod === "COD"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    disabled={updatingPaymentOrderId === selectedOrderForPaymentChange?.id}
                  />
                  <label className="form-check-label" htmlFor="paymentCOD">
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedOrderForPaymentChange(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSelectPaymentMethod(selectedPaymentMethod)}
                  isLoading={updatingPaymentOrderId === selectedOrderForPaymentChange?.id}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm cancel modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc chắn muốn hủy đơn hàng này?"
        onClose={() => {
          if (cancellingOrderId) return; // prevent closing while loading
          setConfirmOpen(false);
          setOrderToCancelCode(null);
        }}
        onConfirm={performCancelOrder}
        confirmLabel="Hủy đơn"
        loading={Boolean(cancellingOrderId === orderToCancelCode)}
      />
    </div>
  );
};

export default OrdersPage;
