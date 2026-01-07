import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdoptionApplicationModal = ({ isOpen, onClose, onSubmit, onShowAddressModal, pet, submitting }) => {
  const { user } = useAuth();

  const buildInitialForm = () => ({
    fullName: user?.name || '',
    phone: '',
    address: '',
    addressId: null,
    job: '',
    income: '',
    experience: '',
    reason: '',
    conditions: '',
  });

  const [form, setForm] = useState(buildInitialForm());

  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm());
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen, pet, user]);

  // Listen for address selection
  useEffect(() => {
    const handler = (e) => {
      const addr = e.detail;
      if (!addr) return;
      setForm(form => ({
        ...form,
        fullName: addr.contactName,
        phone: addr.phone,
        address: [addr.detailAddress, addr.ward, addr.state, addr.city].filter(Boolean).join(', '),
        addressId: addr.id || addr.addressId || null
      }));
    };
    window.addEventListener("address-selected-adoption", handler);
    return () => window.removeEventListener("address-selected-adoption", handler);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      is_own_pet: form.experience === '1' ? '1' : '0'
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`modal-backdrop fade ${isOpen ? 'show' : ''}`}
        onClick={!submitting ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div
        className={`modal fade ${isOpen ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ zIndex: 1050 }}
        onClick={!submitting ? onClose : undefined}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title">
                  <i className="fas fa-paw text-primary me-2"></i>
                  Đơn xin nhận nuôi
                </h5>
                {pet && (
                  <div className="text-muted small mt-1">
                    {pet.name} • {pet.animal}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={submitting}
              ></button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Thông tin cá nhân */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-user me-2"></i>Thông tin cá nhân
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Họ và tên <span className="text-danger">*</span>
                      </label>
                      <input
                        name="fullName"
                        className="form-control"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        readOnly
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        name="phone"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        readOnly
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label">
                      Địa chỉ <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <textarea
                        name="address"
                        className="form-control"
                        rows={2}
                        value={form.address}
                        onChange={handleChange}
                        required
                        readOnly
                        placeholder="Chọn địa chỉ từ danh sách"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={onShowAddressModal}
                      >
                        <i className="fas fa-map-marker-alt me-1"></i>Chọn
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thông tin công việc */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-briefcase me-2"></i>Thông tin công việc
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nghề nghiệp</label>
                      <input
                        name="job"
                        className="form-control"
                        value={form.job}
                        onChange={handleChange}
                        placeholder="VD: Nhân viên văn phòng"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Thu nhập hàng tháng</label>
                      <select
                        name="income"
                        className="form-select"
                        value={form.income}
                        onChange={handleChange}
                      >
                        <option value="">Chọn mức thu nhập</option>
                        <option value="under-10m">Dưới 10 triệu</option>
                        <option value="10-20m">10 - 20 triệu</option>
                        <option value="20-30m">20 - 30 triệu</option>
                        <option value="above-30m">Trên 30 triệu</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Kinh nghiệm */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-heart me-2"></i>Kinh nghiệm nuôi thú cưng
                  </h6>

                  <div className="mb-3">
                    <label className="form-label">
                      Bạn đã từng nuôi thú cưng chưa? <span className="text-danger">*</span>
                    </label>
                    <div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="experience"
                          id="exp-yes"
                          value="1"
                          checked={form.experience === '1'}
                          onChange={handleChange}
                          required
                        />
                        <label className="form-check-label" htmlFor="exp-yes">
                          Rồi, tôi có kinh nghiệm
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="experience"
                          id="exp-no"
                          value="0"
                          checked={form.experience === '0'}
                          onChange={handleChange}
                          required
                        />
                        <label className="form-check-label" htmlFor="exp-no">
                          Chưa, đây là lần đầu
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Lý do muốn nhận nuôi <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="reason"
                      className="form-control"
                      rows={3}
                      value={form.reason}
                      onChange={handleChange}
                      required
                      placeholder="Chia sẻ lý do bạn muốn nhận nuôi bé..."
                    />
                  </div>

                  <div>
                    <label className="form-label">Điều kiện chăm sóc</label>
                    <textarea
                      name="conditions"
                      className="form-control"
                      rows={3}
                      value={form.conditions}
                      onChange={handleChange}
                      placeholder="Mô tả không gian sống, thời gian chăm sóc, điều kiện nuôi dưỡng..."
                    />
                  </div>
                </div>

                {/* Thông báo */}
                <div className="alert alert-info d-flex align-items-start mb-0">
                  <i className="fas fa-info-circle me-2 mt-1"></i>
                  <small>
                    Đơn của bạn sẽ được xem xét trong vòng 24-48 giờ.
                    Chúng tôi sẽ liên hệ qua số điện thoại bạn đã cung cấp.
                  </small>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting && (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  )}
                  {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// Keep old PetDetailModal for backward compatibility
export const PetDetailModal = ({ isOpen, pet, onClose, onApply }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen || !pet) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chi tiết thú cưng</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-5">
                  <img src={pet.image} alt={pet.name} className="img-fluid rounded" />
                </div>
                <div className="col-md-7">
                  <h5 className="mb-1">{pet.name}</h5>
                  <div className="text-muted mb-2">
                    {pet.type === 'dog' ? 'Chó' : pet.type === 'cat' ? 'Mèo' : 'Chim'} {pet.breed}
                  </div>
                  <ul className="list-unstyled mb-3">
                    <li><strong>Tuổi:</strong> {pet.age} tuổi</li>
                    <li><strong>Kích thước:</strong> {pet.size}</li>
                    <li><strong>Giới tính:</strong> {pet.gender === 'male' ? 'Đực' : 'Cái'}</li>
                  </ul>
                  <p>{pet.description}</p>
                  <div>
                    {pet.vaccinated && <span className="badge bg-info me-2">Đã tiêm phòng</span>}
                    {pet.spayed && <span className="badge bg-secondary">Đã triệt sản</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>Đóng</button>
              <button className="btn btn-primary" onClick={onApply}>
                <i className="fas fa-paw me-2"></i>Gửi đơn nhận nuôi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
