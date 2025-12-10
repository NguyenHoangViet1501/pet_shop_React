import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { addressAPI } from "../../api/address";

const CheckoutPage = () => {
  const [validated, setValidated] = useState(false);
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    notes: "",
    paymentMethod: "cod",
  });

  // 📌 Fetch danh sách địa chỉ người dùng
  const fetchAddresses = async () => {
    if (!token) {
      console.log("⛔ No token → skip fetch address");
      return;
    }

    setLoadingAddresses(true);
    try {
      console.log("🔄 Fetching user addresses...");
      const response = await addressAPI.getUserAddresses(token, 10, 0);

      console.log("📦 API result:", response);

      if (response?.success && response?.result) {
        const mapped = response.result.map((addr) => ({
          id: addr.id,
          fullName: addr.contactName,
          phone: addr.phone,
          line: addr.detailAddress,
          city: addr.city,
          district: addr.state,
          ward: addr.ward,
          isDefault: addr.isDefault === "1",
        }));

        // Sắp xếp default lên đầu
        mapped.sort((a, b) => b.isDefault - a.isDefault);

        setAddresses(mapped);

        // 📌 Auto-select địa chỉ mặc định
        const defaultAddr = mapped.find((a) => a.isDefault);

        if (defaultAddr) {
          console.log("⭐ Default address:", defaultAddr);

          const formatted =
            `${defaultAddr.fullName} - ${defaultAddr.phone} - ${defaultAddr.line}, ` +
            `${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.city}`;

          setFormData((prev) => ({
            ...prev,
            address: formatted,
          }));
        } else {
          console.log("⚠ No default address found!");
        }
      }
    } catch (err) {
      console.error("❌ Fetch address error:", err);
    }

    setLoadingAddresses(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const subtotal = getTotalPrice();
  const shipping = 5.0;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 📌 Chọn địa chỉ trong modal
  const selectAddress = (addr) => {
    const formatted =
      `${addr.fullName} - ${addr.phone} - ${addr.line}, ` +
      `${addr.ward}, ${addr.district}, ${addr.city}`;

    setFormData((prev) => ({
      ...prev,
      address: formatted,
    }));

    setShowAddressModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget.checkValidity()) {
      const orderId = "ORD" + Math.floor(Math.random() * 1000);
      showToast(`Đặt hàng thành công! Mã đơn hàng: #${orderId}`, "success");
      clearCart();
      navigate("/orders");
    }

    setValidated(true);
  };

  if (!user) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning">
          Vui lòng đăng nhập để tiếp tục thanh toán.
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page-content">
        <div className="alert alert-info">Giỏ hàng của bạn đang trống.</div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <h1 className="mb-4">Thanh toán</h1>

      <form
        noValidate
        className={validated ? "was-validated" : ""}
        onSubmit={handleSubmit}
      >
        <div className="row">
          <div className="col-lg-7">
            <div className="card mb-4">
              <div className="card-body">
                <h5>Thông tin giao hàng</h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Nút chọn địa chỉ */}
                <div className="mb-3">
                  <label className="form-label">Địa chỉ giao hàng</label>

                  <div className="d-flex">
                    <input
                      type="text"
                      className="form-control me-2"
                      name="address"
                      value={formData.address}
                      readOnly
                      required
                      placeholder="Chưa chọn địa chỉ"
                    />

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setShowAddressModal(true)}
                    >
                      Chọn
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú (tùy chọn)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card">
              <div className="card-body">
                <h5>Phương thức thanh toán</h5>

                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>

                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Thanh toán bằng thẻ
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === "bank"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Chuyển khoản ngân hàng
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h5>Đơn hàng của bạn</h5>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between mb-2"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold">
                  <span>Tổng cộng:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-3">
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL CHỌN ĐỊA CHỈ */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chọn địa chỉ giao hàng</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowAddressModal(false)}
                />
              </div>

              <div className="modal-body">
                {loadingAddresses ? (
                  <p>Đang tải...</p>
                ) : (
                  <div>
                    {addresses.map((addr) => (
                      <div className="card mb-3 p-3" key={addr.id}>
                        <p className="fw-bold">
                          {addr.fullName}{" "}
                          {addr.isDefault && (
                            <span className="text-success">(Mặc định)</span>
                          )}
                        </p>
                        <p>📞 {addr.phone}</p>
                        <p>
                          🏠 {addr.line}, {addr.ward}, {addr.district},{" "}
                          {addr.city}
                        </p>

                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => selectAddress(addr)}
                        >
                          Chọn địa chỉ này
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
