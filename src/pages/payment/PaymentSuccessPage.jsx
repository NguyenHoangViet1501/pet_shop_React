import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    const redirectTimer = setTimeout(() => {
      navigate("/orders");
    }, 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);
  return (
    <div className="container page-content d-flex justify-content-center align-items-center">
      {" "}
      <div className="card text-center" style={{ maxWidth: 500 }}>
        {" "}
        <div className="card-body py-5">
          {" "}
          <div className="mb-3">
            {" "}
            <i
              className="fas fa-check-circle text-success"
              style={{ fontSize: 64 }}
            ></i>{" "}
          </div>{" "}
          <h3 className="text-success mb-2">Thanh toán thành công!</h3>{" "}
          <p className="text-muted mb-4">
            {" "}
            Đơn hàng của bạn đã được thanh toán thành công. <br /> Bạn sẽ được
            chuyển về danh sách đơn hàng sau <strong>
              {countdown}
            </strong> giây.{" "}
          </p>{" "}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/orders")}
          >
            {" "}
            Xem đơn hàng ngay{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default PaymentSuccessPage;
