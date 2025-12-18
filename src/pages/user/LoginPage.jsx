import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../../components/ui/button/Button";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email hoặc username";
    } else if (/\s/.test(formData.email)) {
      newErrors.email = "Email/Username không được chứa khoảng trắng";
    } else if (/[^a-zA-Z0-9@._-]/.test(formData.email)) {
      newErrors.email = "Email/Username không được chứa ký tự đặc biệt hoặc tiếng Việt có dấu";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (/\s/.test(formData.password)) {
      newErrors.password = "Mật khẩu không được chứa khoảng trắng";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else {
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasDigit = /\d/.test(formData.password);
      const hasSpecialChar = /[@$!%*?&#]/.test(formData.password);
      if (!hasLowerCase || !hasUpperCase || !hasDigit || !hasSpecialChar) {
        newErrors.password =
          "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt (@$!%*?&#)";
      }
    }
    setErrors(newErrors);
  }, [formData]);

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      if (!formData.email || !formData.password) {
        showToast("Vui lòng nhập đầy đủ thông tin", "error");
      }
      setTouched({
        email: true,
        password: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      showToast("Đăng nhập thành công!", "success");

      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect to home page or previous page
      navigate("/");
    } catch (error) {
      showToast(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page bg-white py-8 pb-5 " id="login">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-md-7 d-none d-md-block">
            <img 
              src="/images/login.png" 
              alt="Pet Care Shop Login" 
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
                <h2 className="text-center mb-4">Đăng nhập</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label">Email hoặc Username</label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email && (touched.email || formData.email) ? "is-invalid" : ""
                      }`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Email or username"
                      required
                    />
                    {errors.email && (touched.email || formData.email) && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control pe-5 ${
                          errors.password && (touched.password || formData.password) ? "is-invalid" : ""
                        }`}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Password"
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: errors.password && (touched.password || formData.password) ? "40px" : "10px",
                          top: errors.password && (touched.password || formData.password) ? "21%" : "45%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#6c757d",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      {errors.password && (touched.password || formData.password) && (
                        <div className="invalid-feedback d-block">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-100 mb-3"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  <div className="text-center">
                    <Link to="/register" className="text-decoration-none">
                      Chưa có tài khoản? Đăng ký ngay
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

export default LoginPage;
