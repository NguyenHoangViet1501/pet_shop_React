import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";
import { useAuthApi } from "../../hooks/useAuthApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { changePassword } = useAuthApi();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get identifier and otp from location state
  const { identifier, otp } = location.state || {};

  useEffect(() => {
    if (!identifier || !otp) {
      showToast("Truy cập không hợp lệ. Vui lòng thực hiện lại quy trình quên mật khẩu.", "error");
      navigate("/forgot-password");
    }
  }, [identifier, otp, navigate, showToast]);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    
    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (/\s/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu không được chứa khoảng trắng";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else {
      const hasLowerCase = /[a-z]/.test(formData.newPassword);
      const hasUpperCase = /[A-Z]/.test(formData.newPassword);
      const hasDigit = /\d/.test(formData.newPassword);
      const hasSpecialChar = /[@$!%*?&#]/.test(formData.newPassword);
      if (!hasLowerCase || !hasUpperCase || !hasDigit || !hasSpecialChar) {
        newErrors.newPassword =
          "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt (@$!%*?&#)";
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
  }, [formData]);

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      showToast("Vui lòng kiểm tra lại thông tin", "error");
      setTouched({
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(identifier, formData.newPassword);
      showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      showToast(error.message || "Đổi mật khẩu thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identifier || !otp) return null;

  return (
    <div className="page bg-white py-8 pb-5" id="reset-password">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-md-7 d-none d-md-block">
            <img 
              src="/images/login.png" 
              alt="Pet Care Shop Reset Password" 
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
                <h2 className="text-center mb-4">Đặt lại mật khẩu</h2>
                <p className="text-center text-muted mb-4 small">
                  Đang đặt lại mật khẩu cho tài khoản: <strong>{identifier}</strong>
                </p>
                <form onSubmit={handleSubmit} noValidate>
                  
                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu mới</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control pe-5 ${
                          errors.newPassword && (touched.newPassword || formData.newPassword) ? "is-invalid" : ""
                        }`}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: errors.newPassword && (touched.newPassword || formData.newPassword) ? "40px" : "10px",
                          top: errors.newPassword && (touched.newPassword || formData.newPassword) ? "21%" : "45%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#6c757d",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      {errors.newPassword && (touched.newPassword || formData.newPassword) && (
                        <div className="invalid-feedback d-block">
                          {errors.newPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control pe-5 ${
                          errors.confirmPassword && (touched.confirmPassword || formData.confirmPassword) ? "is-invalid" : ""
                        }`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: errors.confirmPassword && (touched.confirmPassword || formData.confirmPassword) ? "40px" : "10px",
                          top: errors.confirmPassword && (touched.confirmPassword || formData.confirmPassword) ? "21%" : "45%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#6c757d",
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      {errors.confirmPassword && (touched.confirmPassword || formData.confirmPassword) && (
                        <div className="invalid-feedback d-block">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-100 mb-3"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      Hủy bỏ
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
