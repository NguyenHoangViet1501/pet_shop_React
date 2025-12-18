import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";

const TERMS_CONTENT = (
  <div>
    <h4>Điều khoản sử dụng Pet Shop</h4>
    <p>
      Chào mừng bạn đến với Pet Shop! Trước khi sử dụng các dịch vụ và sản phẩm
      của chúng tôi, vui lòng đọc kỹ và hiểu rõ các điều khoản dưới đây. Việc
      bạn tiếp tục sử dụng đồng nghĩa rằng bạn đã đồng ý tuân thủ toàn bộ điều
      khoản.
    </p>

    <h5>1. Thông tin tài khoản và cá nhân</h5>
    <ul>
      <li>
        Bạn phải cung cấp thông tin cá nhân chính xác, đầy đủ và được cập nhật
        khi đăng ký tài khoản.
      </li>
      <li>
        Bạn chịu trách nhiệm hoàn toàn đối với tính chính xác của thông tin mà
        bạn cung cấp.
      </li>
      <li>
        Nếu phát hiện thông tin không đúng sự thật, Pet Shop có quyền đình chỉ
        hoặc hủy tài khoản của bạn.
      </li>
    </ul>

    <h5>2. Bảo mật tài khoản</h5>
    <ul>
      <li>Bạn có trách nhiệm bảo mật tên đăng nhập và mật khẩu.</li>
      <li>
        Mọi hoạt động phát sinh từ tài khoản của bạn sẽ được coi là do bạn thực
        hiện.
      </li>
      <li>
        Nếu phát hiện hành vi truy cập trái phép, bạn cần thông báo ngay cho Pet
        Shop.
      </li>
    </ul>

    <h5>3. Quyền riêng tư và bảo mật dữ liệu</h5>
    <ul>
      <li>
        Pet Shop cam kết bảo mật thông tin cá nhân của bạn theo chính sách bảo
        mật.
      </li>
      <li>
        Chúng tôi không bán, chia sẻ hay trao đổi thông tin khách hàng cho bên
        thứ ba trừ khi có yêu cầu pháp luật.
      </li>
      <li>
        Bạn đồng ý rằng Pet Shop có thể sử dụng dữ liệu của bạn để cải thiện
        dịch vụ, chăm sóc khách hàng và gửi thông báo liên quan.
      </li>
    </ul>

    <h5>4. Sử dụng dịch vụ</h5>
    <ul>
      <li>
        Không được sử dụng dịch vụ của Pet Shop cho các hoạt động vi phạm pháp
        luật.
      </li>
      <li>
        Không được gây ảnh hưởng đến hệ thống, làm gián đoạn dịch vụ hoặc tấn
        công bảo mật.
      </li>
      <li>
        Không được sử dụng hình ảnh, nội dung từ Pet Shop cho mục đích thương
        mại mà chưa có sự cho phép.
      </li>
    </ul>

    <h5>5. Đặt hàng và thanh toán</h5>
    <ul>
      <li>
        Khi đặt hàng, bạn cần cung cấp thông tin chính xác về địa chỉ giao hàng,
        phương thức thanh toán.
      </li>
      <li>
        Đơn hàng chỉ được xác nhận khi bạn hoàn tất quá trình thanh toán theo
        hướng dẫn.
      </li>
      <li>
        Trong một số trường hợp, Pet Shop có thể liên hệ với bạn để xác minh
        thông tin đơn hàng.
      </li>
    </ul>

    <h5>6. Giao hàng và đổi trả</h5>
    <ul>
      <li>
        Thời gian giao hàng có thể thay đổi tùy theo khu vực, điều kiện thời
        tiết hoặc yếu tố khách quan.
      </li>
      <li>
        Bạn có quyền đổi/trả sản phẩm theo chính sách đổi trả được công bố trên
        website.
      </li>
      <li>
        Pet Shop không chịu trách nhiệm cho thiệt hại phát sinh nếu bạn cung cấp
        sai địa chỉ giao hàng.
      </li>
    </ul>

    <h5>7. Trách nhiệm và giới hạn trách nhiệm</h5>
    <ul>
      <li>
        Pet Shop nỗ lực cung cấp dịch vụ tốt nhất nhưng không đảm bảo hệ thống
        hoạt động liên tục 100%.
      </li>
      <li>
        Pet Shop không chịu trách nhiệm cho thiệt hại gián tiếp, đặc biệt hoặc
        hệ quả do việc sử dụng dịch vụ.
      </li>
      <li>
        Bạn đồng ý rằng rủi ro khi sử dụng dịch vụ hoàn toàn thuộc về bạn.
      </li>
    </ul>

    <h5>8. Sở hữu trí tuệ</h5>
    <ul>
      <li>
        Tất cả nội dung trên Pet Shop (logo, hình ảnh, mã nguồn, thiết kế) đều
        thuộc quyền sở hữu trí tuệ của chúng tôi.
      </li>
      <li>
        Nghiêm cấm sao chép, sử dụng, phân phối mà không có sự cho phép bằng văn
        bản từ Pet Shop.
      </li>
    </ul>

    <h5>9. Thay đổi và cập nhật điều khoản</h5>
    <ul>
      <li>
        Pet Shop có quyền thay đổi, cập nhật điều khoản này bất cứ lúc nào.
      </li>
      <li>Chúng tôi sẽ thông báo các thay đổi trên website hoặc qua email.</li>
      <li>
        Bạn có trách nhiệm kiểm tra và theo dõi các cập nhật thường xuyên.
      </li>
    </ul>

    <h5>10. Liên hệ hỗ trợ</h5>
    <p>
      Nếu có bất kỳ câu hỏi hoặc thắc mắc nào về điều khoản sử dụng, vui lòng
      liên hệ bộ phận hỗ trợ khách hàng của chúng tôi qua:
    </p>
    <ul>
      <li>
        <b>Email: support@petshop.vn</b>
      </li>
      <li>
        <b>Hotline: 1900-1234</b>
      </li>
      <li>
        <b>Địa chỉ: 123 Đường ABC, Thường Tín, TP. Hà Nội</b>
      </li>
    </ul>

    <p>
      Việc bạn nhấn nút "Đăng ký" đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý
      tuân thủ toàn bộ Điều khoản sử dụng này.
    </p>
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (formData.username.length < 4) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 4 ký tự";
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải chứa cả chữ và số";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Terms validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
        navigate("/login");
      } else {
        showToast(
          data.message || "Đăng ký thất bại. Vui lòng thử lại.",
          "error"
        );
      }
    } catch (error) {
      showToast("Đăng ký thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page bg-white py-5" id="register">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-md-7 d-none d-md-block">
            <img 
              src="/images/login.png" 
              alt="Pet Care Shop Register" 
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
                <h2 className="text-center mb-4">Đăng ký</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="mb-3">
                      <label className="form-label">Tên đăng nhập</label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.username ? "is-invalid" : ""
                        }`}
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.username && (
                        <div className="invalid-feedback">
                          {errors.username}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Họ và tên</label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.fullName ? "is-invalid" : ""
                        }`}
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.fullName && (
                        <div className="invalid-feedback">
                          {errors.fullName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        className={`form-control ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3 position-relative">
                      <label className="form-label">Mật khẩu</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control pe-5 ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: errors.password ? "45px" : "25px",
                          top: "33px",
                          cursor: "pointer",
                          color: "#6c757d",
                          fontSize: "1.25rem",
                          zIndex: 2,
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3 position-relative">
                      <label className="form-label">Xác nhận mật khẩu</label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control pe-5 ${
                          errors.confirmPassword ? "is-invalid" : ""
                        }`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <span
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{
                          position: "absolute",
                          right: errors.confirmPassword ? "45px" : "25px",
                          top: "33px",
                          cursor: "pointer",
                          color: "#6c757d",
                          fontSize: "1.25rem",
                          zIndex: 2,
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className={`form-check-input ${
                        errors.agreeTerms ? "is-invalid" : ""
                      }`}
                      id="agreeTerms"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      required
                    />
                    <label className="form-check-label" htmlFor="agreeTerms">
                      Tôi đồng ý với{" "}
                      <span
                        style={{
                          color: "#007bff",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowTermsModal(true)}
                      >
                        điều khoản sử dụng
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <div className="invalid-feedback">
                        {errors.agreeTerms}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-100 mb-3"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      Đã có tài khoản? Đăng nhập
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal điều khoản sử dụng */}
      {showTermsModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Điều khoản sử dụng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTermsModal(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {TERMS_CONTENT}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTermsModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
