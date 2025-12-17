import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container page-content d-flex justify-content-center align-items-center">
      <div className="card text-center" style={{ maxWidth: 500 }}>
        <div className="card-body py-5">
          {/* Icon lỗi */}
          <div className="mb-3">
            <i
              className="fas fa-times-circle text-danger"
              style={{ fontSize: 64 }}
            ></i>
          </div>

          <h3 className="text-danger mb-2">Thanh toán thất bại!</h3>

          <p className="text-muted mb-4">
            Giao dịch không thể hoàn tất hoặc đã bị hủy.
            <br />
            Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>

          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Thanh toán lại
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/orders")}
            >
              Về đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
