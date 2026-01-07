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
  COMPLETED: { label: "Đã nhận được hàng", className: "bg-success" },
  CANCELLED: { label: "Đã hủy", className: "bg-danger" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-secondary" },
};

const FILTER_TABS = [
  { value: "", label: "Tất cả" },
  { value: "WAITING_PAYMENT", label: "Chờ thanh toán" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Đã nhận được hàng" },
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPaymentChange, setSelectedOrderForPaymentChange] = useState(null);
  const [updatingPaymentOrderId, setUpdatingPaymentOrderId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [completingOrderId, setCompletingOrderId] = useState(null);

  // 🔥 PAGE BẮT ĐẦU TỪ 1 (THEO API)
  const [pageNumber, setPageNumber] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPageNumber(1);
  }, [selectedStatus, debouncedSearch]);

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
        if (debouncedSearch) {
          params.orderCode = debouncedSearch;
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
  }, [token, pageNumber, size, selectedStatus, debouncedSearch, refreshKey]);

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

  const handleCompleteOrder = async (orderId, orderCode) => {
    if (!orderId || !orderCode) return;

    setCompletingOrderId(orderId);
    try {
      const res = await orderAPI.completeOrder(orderId, orderCode, token);
      if (res?.success) {
        showToast("Xác nhận đã nhận được hàng thành công", "success");
        setRefreshKey((prev) => prev + 1);
      } else {
        showToast(res?.message || "Không thể hoàn thành đơn hàng", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi hoàn thành đơn hàng", "error");
    } finally {
      setCompletingOrderId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr.replace(" ", "T")).toLocaleDateString("vi-VN");
  };

  const formatMoney = (value) => Number(value).toLocaleString("vi-VN") + " đ";

  return (
    <div className="container page-content">
      <h1 className="mb-4">Đơn hàng của tôi</h1>

      {/* FILTER & SEARCH */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        {/* Status Tabs */}
        <div className="d-flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={
                selectedStatus === tab.value ? "primary" : "outline-secondary"
              }
              className="rounded-pill px-3 btn-sm"
              onClick={() => setSelectedStatus(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex-grow-1 flex-md-grow-0"
          style={{ minWidth: "250px" }}
        >
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="fas fa-search"></i>
            </span>
            <input
              className="form-control border-start-0 ps-0"
              placeholder="Tìm theo mã đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted small">Đang tìm kiếm...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                      alt="No orders"
                      style={{
                        width: "64px",
                        opacity: 0.5,
                        marginBottom: "1rem",
                      }}
                    />
                    <p className="text-muted">Không tìm thấy đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo =
                    ORDER_STATUS_MAP[order.status] ||
                    { label: order.status, className: "bg-secondary" };

                  return (
                    <tr key={order.orderCode}>
                      <td>#{order.orderCode}</td>
                      <td>{formatDate(order.createdDate)}</td>
                      <td>
                        <span
                          className={`badge ${statusInfo.className} rounded-pill px-3`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>{formatMoney(order.totalAmount)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            onClick={() =>
                              navigate(`/orders/${order.id}`)
                            }
                          >
                            Chi tiết
                          </button>
                          {order.status === "WAITING_PAYMENT" && (
                            <button
                              className="btn btn-sm btn-outline-success rounded-pill"
                              onClick={() => handleChangePaymentMethod(order)}
                            >
                              Đổi thanh toán
                            </button>
                          )}
                          {order.status === "WAITING_PAYMENT" && (
                            <Button
                              variant="outline-danger"
                              className="btn-sm"
                              onClick={() => handleCancelOrder(order.orderCode)}
                              isLoading={cancellingOrderId === order.orderCode}
                            >
                              Hủy
                            </Button>
                          )}
                          {order.status === "DELIVERED" && (
                            <Button
                              variant="outline-success"
                              className="btn-sm rounded-pill"
                              onClick={() => handleCompleteOrder(order.id, order.orderCode)}
                              isLoading={completingOrderId === order.id}
                            >
                              Đã nhận được hàng
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
                      className={`page-item ${pageNumber === p ? "active" : ""
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
                  className={`page-item ${pageNumber === totalPages ? "disabled" : ""
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
