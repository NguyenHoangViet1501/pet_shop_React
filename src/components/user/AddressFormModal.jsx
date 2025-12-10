import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addressAPI } from "../../api";
import { useToast } from "../../context/ToastContext";

const ModalShell = ({ isOpen, title, onClose, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      ></div>
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1055 }}
      >
        <div
          className="modal-dialog modal-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

const AddressFormModal = ({ isOpen, onClose, onSave }) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    district: "",
    ward: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [isUsingLoginInfo, setIsUsingLoginInfo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        district: "",
        ward: "",
        isDefault: false,
      });
      setErrors({});
      setIsUsingLoginInfo(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUseLoginInfo = () => {
    if (isUsingLoginInfo) {
      // Clear the fields and reset to inactive state
      setForm((prev) => ({
        ...prev,
        fullName: "",
        phone: "",
      }));
      setIsUsingLoginInfo(false);
      // Clear errors for name and phone fields
      setErrors((prev) => ({
        ...prev,
        fullName: "",
        phone: "",
      }));
    } else {
      // Populate with login info and set to active state
      setForm((prev) => ({
        ...prev,
        fullName: user?.fullName || user?.name || "",
        phone: user?.phone || "",
      }));
      setIsUsingLoginInfo(true);
      // Clear errors for name and phone fields
      setErrors((prev) => ({
        ...prev,
        fullName: "",
        phone: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim())
      newErrors.fullName = "Họ và tên không được để trống";
    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (form.phone.length < 10) {
      newErrors.phone = "Số điện thoại phải có ít nhất 10 số";
    }
    if (!form.addressLine.trim())
      newErrors.addressLine = "Địa chỉ không được để trống";
    if (!form.city.trim()) newErrors.city = "Tỉnh/Thành không được để trống";
    if (!form.district.trim())
      newErrors.district = "Quận/Huyện không được để trống";
    // ward is optional
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const addressData = {
        userid: form.id,
        contactName: form.fullName,
        phone: form.phone,
        detailAddress: form.addressLine,
        city: form.city,
        state: form.district,
        ward: form.ward,
        isDefault: form.isDefault ? "1" : "0",
      };

      await addressAPI.createAddress(addressData, token);
      showToast("Đã thêm địa chỉ mới!", "success");
      onSave?.(form);
      onClose();
    } catch (error) {
      showToast("Có lỗi xảy ra khi thêm địa chỉ. Vui lòng thử lại.", "error");
      console.error("Error creating address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      title="Thêm địa chỉ"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            type="submit"
            form="addressForm"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <form id="addressForm" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Họ và tên</label>
            <input
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <div className="invalid-feedback">{errors.fullName}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Số điện thoại</label>
            <input
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <div className="invalid-feedback">{errors.phone}</div>
            )}
          </div>
          <div className="col-12">
            <button
              type="button"
              className={`btn btn-sm ${
                isUsingLoginInfo ? "btn-warning" : "btn-outline-primary"
              }`}
              onClick={handleUseLoginInfo}
            >
              {isUsingLoginInfo
                ? "Hủy sử dụng thông tin đăng nhập"
                : "Sử dụng thông tin đăng nhập"}
            </button>
          </div>
          <div className="col-12">
            <label className="form-label">Địa chỉ</label>
            <input
              className={`form-control ${
                errors.addressLine ? "is-invalid" : ""
              }`}
              name="addressLine"
              value={form.addressLine}
              onChange={handleChange}
            />
            {errors.addressLine && (
              <div className="invalid-feedback">{errors.addressLine}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Tỉnh/Thành</label>
            <input
              className={`form-control ${errors.city ? "is-invalid" : ""}`}
              name="city"
              value={form.city}
              onChange={handleChange}
            />
            {errors.city && (
              <div className="invalid-feedback">{errors.city}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Quận/Huyện</label>
            <input
              className={`form-control ${errors.district ? "is-invalid" : ""}`}
              name="district"
              value={form.district}
              onChange={handleChange}
            />
            {errors.district && (
              <div className="invalid-feedback">{errors.district}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Phường/Xã</label>
            <input
              className="form-control"
              name="ward"
              value={form.ward}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault" className="form-check-label">
              Đặt làm địa chỉ mặc định
            </label>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

export default AddressFormModal;
