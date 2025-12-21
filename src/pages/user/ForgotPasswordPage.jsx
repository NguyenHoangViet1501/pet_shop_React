import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";
import { useAuthApi } from "../../hooks/useAuthApi";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Input Identifier, 2: Input OTP
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuthApi();

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Real-time validation for Identifier
  useEffect(() => {
    if (step === 1) {
      const newErrors = {};
      if (!identifier) {
        newErrors.identifier = "Vui lòng nhập email hoặc username";
      } else if (/\s/.test(identifier)) {
        newErrors.identifier = "Email/Username không được chứa khoảng trắng";
      } else if (identifier.length < 3) {
        newErrors.identifier = "Username phải có ít nhất 3 ký tự";
      }
      setErrors(newErrors);
    }
  }, [identifier, step]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    if (errors.identifier) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp(identifier);
      showToast("Mã OTP đã được gửi đến email của bạn", "success");
      setStep(2);
      setCountdown(60);
    } catch (error) {
      showToast(error.message || "Người dùng không tồn tại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsSubmitting(true);
    try {
      await sendOtp(identifier);
      showToast("Mã OTP mới đã được gửi", "success");
      setCountdown(60);
    } catch (error) {
      showToast(error.message || "Gửi lại OTP thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast("Vui lòng nhập mã OTP", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(identifier, otp);
      showToast("Xác thực OTP thành công", "success");
      // Navigate to Reset Password page with identifier and otp
      navigate("/reset-password", { state: { identifier, otp } });
    } catch (error) {
      showToast(error.message || "Mã OTP không chính xác", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page bg-white py-8 pb-5" id="forgot-password">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-md-7 d-none d-md-block">
            <img 
              src="/images/login.png" 
              alt="Pet Care Shop Forgot Password" 
              className="img-fluid w-100"
              style={{ objectFit: 'contain', maxHeight: '600px' }}
            />
          </div>

          {/* Right Side - Form */}
          <div className="col-md-5">
            <div className="text-center mb-4">
                <h1 className="fw-bold" style={{ color: '#ffc107', fontSize: '3rem' }}>Pet Care Shop</h1>
            </div>
            
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="text-center mb-2">
                  {step === 1 ? "Quên mật khẩu?" : "Nhập mã OTP"}
                </h2>
                <p className="text-center text-muted mb-4">
                  {step === 1 
                    ? "Nhập email hoặc username để nhận mã OTP" 
                    : `Mã OTP đã được gửi đến email của bạn. Mã sẽ hết hạn sau 5 phút`}
                </p>

                {step === 1 ? (
                  <form onSubmit={handleIdentifierSubmit} noValidate>
                    <div className="mb-3">
                      <label className="form-label">Email hoặc Username</label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.identifier && (touched || identifier) ? "is-invalid" : ""
                        }`}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Nhập email hoặc username"
                        required
                      />
                      {errors.identifier && (touched || identifier) && (
                        <div className="invalid-feedback">{errors.identifier}</div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-100 mb-3"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      {isSubmitting ? "Đang gửi..." : "Gửi OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Mã OTP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Nhập mã OTP"
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button 
                            type="button" 
                            className={`btn btn-link text-decoration-none p-0 ${countdown > 0 ? 'text-muted' : ''}`}
                            onClick={handleResendOtp}
                            disabled={countdown > 0 || isSubmitting}
                            style={{ fontSize: '0.9rem' }}
                        >
                            {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại OTP"}
                        </button>
                        
                        <button 
                            type="button" 
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => setStep(1)}
                            style={{ fontSize: '0.9rem' }}
                        >
                            Nhập lại thông tin
                        </button>
                    </div>
                    {countdown > 0 && (
                        <div className="text-center mb-3">
                            <small className="text-muted fst-italic">
                                Bạn có thể yêu cầu gửi lại mã OTP sau 1 phút
                            </small>
                        </div>
                    )}

                    <div className="d-flex justify-content-center mb-3">
                        <Button
                          type="submit"
                          className="px-5"
                          disabled={isSubmitting}
                          isLoading={isSubmitting}
                        >
                          {isSubmitting ? "Đang xác thực..." : "Xác nhận"}
                        </Button>
                    </div>
                  </form>
                )}

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
