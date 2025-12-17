import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { orderAPI } from "../../api/order";

const ORDER_STATUS_MAP = {
  WAITING_PAYMENT: { label: "Chờ thanh toán", className: "bg-warning" },
  PROCESSING: { label: "Đang xử lý", className: "bg-info" },
  SHIPPED: { label: "Đang giao", className: "bg-primary" },
  DELIVERED: { label: "Đã giao", className: "bg-success" },
  CANCELLED: { label: "Đã hủy", className: "bg-danger" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-secondary" },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderDetail(id, token);
        if (res?.success) {
          setOrderDetails(res.result || []);
        } else {
          showToast(res?.message || "Không tìm thấy đơn hàng", "error");
          setOrderDetails([]);
        }
      } catch (err) {
        console.error(err);
        showToast("Lỗi khi tải chi tiết đơn hàng", "error");
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

  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>Không tìm thấy thông tin đơn hàng hoặc đơn hàng trống.</div>
          <Link to="/orders" className="btn btn-primary btn-sm">
            Về danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Lấy thông tin chung từ phần tử đầu tiên
  const orderInfo = orderDetails[0];
  const statusInfo = ORDER_STATUS_MAP[orderInfo.status] || {
    label: orderInfo.status,
    className: "bg-secondary",
  };

  const formatMoney = (value) => Number(value).toLocaleString("vi-VN") + " đ";
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  return (
    <div className="container page-content">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Chi tiết đơn hàng #{orderInfo.orderCode}</h1>
          <div className="text-muted">
            Ngày đặt: {formatDate(orderInfo.orderDate)}
          </div>
        </div>
        <Link to="/orders" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Column: Order Items */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Sản phẩm ({orderDetails.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="ps-4">Sản phẩm</th>
                      <th scope="col" className="text-center">Đơn giá</th>
                      <th scope="col" className="text-center">SL</th>
                      <th scope="col" className="text-end pe-4">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.map((item, index) => (
                      <tr key={index}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <img
                              src={item.imageUrl || "https://placehold.co/60"}
                              alt={item.productName}
                              className="rounded border"
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="ms-3">
                              <h6 className="mb-0 text-truncate" style={{ maxWidth: "250px" }}>
                                <Link to={`/product/${item.productId}`} className="text-decoration-none text-dark">
                                  {item.productName}
                                </Link>
                              </h6>
                              {/* Hiển thị biến thể nếu có (ví dụ màu, size) - Dựa vào JSON thì chưa thấy field color/size riêng biệt, 
                                  nhưng nếu có thể thêm vào sau. Tạm thời hiển thị variantId nếu cần debug hoặc ẩn đi */}
                              {/* <small className="text-muted">Phân loại: {item.variantId}</small> */}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{formatMoney(item.unitPrice)}</td>
                        <td className="text-center">x{item.quantity}</td>
                        <td className="text-end pe-4 fw-bold text-primary">
                          {formatMoney(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Info */}
        <div className="col-lg-4">
          {/* Status Card */}
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Trạng thái đơn hàng</h5>
              <div className={`alert ${statusInfo.className.replace('bg-', 'alert-')} mb-0 fw-bold text-center`}>
                {statusInfo.label.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Thanh toán</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span>{formatMoney(orderInfo.totalAmount)}</span> 
                {/* Lưu ý: JSON trả về totalAmount là tổng cuối cùng, nếu có phí ship hay giảm giá thì cần tính toán lại để hiển thị chi tiết hơn. 
                    Ở đây tạm dùng totalAmount cho tổng cộng. */}
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phí vận chuyển:</span>
                <span>0 đ</span> {/* JSON chưa có field shippingFee riêng, tạm để 0 hoặc ẩn */}
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Tổng cộng:</span>
                <span className="fs-4 fw-bold text-danger">
                  {formatMoney(orderInfo.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info Card */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title mb-3">Thông tin giao hàng</h5>
              <div className="mb-3">
                <div className="text-muted small mb-1">Người nhận & Địa chỉ</div>
                <p className="mb-0 fw-medium">{orderInfo.shippingAddress}</p>
              </div>
              {/* Nếu có số điện thoại riêng thì hiển thị, hiện tại nó nằm trong chuỗi address */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
