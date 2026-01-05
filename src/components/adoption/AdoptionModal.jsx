import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdoptionModal.css';

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
      <div className="adoption-modal-backdrop" onClick={onClose} />
      <div className="adoption-modal-wrapper" onClick={onClose}>
        <div className="adoption-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="adoption-modal-header">
            <div className="adoption-modal-header-content">
              {pet.image && (
                <img src={pet.image} alt={pet.name} className="adoption-modal-pet-avatar" />
              )}
              <div>
                <h2 className="adoption-modal-title">Chi tiết thú cưng</h2>
                <p className="adoption-modal-subtitle">{pet.name}</p>
              </div>
            </div>
            <button className="adoption-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="adoption-modal-body">
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
          <div className="adoption-modal-footer">
            <button className="adoption-modal-btn-cancel" onClick={onClose}>Đóng</button>
            <button className="adoption-modal-btn-submit" onClick={onApply}>
              🐾 Gửi đơn nhận nuôi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

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
    agree: false
  });

  const [form, setForm] = useState(buildInitialForm());

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      setForm(buildInitialForm());
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen, pet, user]);

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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  const petImage = pet?.images?.[0]?.imageUrl || pet?.imageUrl || pet?.image;

  return (
    <>
      <div className="adoption-modal-backdrop" onClick={!submitting ? onClose : undefined} />
      <div className="adoption-modal-wrapper" onClick={!submitting ? onClose : undefined}>
        <div className="adoption-modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="adoption-modal-header">
            <div className="adoption-modal-header-content">
              {petImage && (
                <img src={petImage} alt={pet?.name} className="adoption-modal-pet-avatar" />
              )}
              <div>
                <h2 className="adoption-modal-title">Đơn xin nhận nuôi</h2>
                {pet && <p className="adoption-modal-subtitle">{pet.name} • {pet.animal}</p>}
              </div>
            </div>
            <button 
              className="adoption-modal-close" 
              onClick={onClose}
              disabled={submitting}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <form id="adoptionApplicationForm" onSubmit={handleSubmit}>
            <div className="adoption-modal-body">
              {/* Personal Info Section */}
              <div className="adoption-modal-section">
                <h3 className="adoption-modal-section-title">Thông tin cá nhân</h3>
                
                <div className="adoption-modal-row">
                  <div className="adoption-modal-form-group">
                    <label className="adoption-modal-label">
                      Họ và tên <span className="required">*</span>
                    </label>
                    <input
                      name="fullName"
                      className="adoption-modal-input"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      readOnly
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="adoption-modal-form-group">
                    <label className="adoption-modal-label">
                      Số điện thoại <span className="required">*</span>
                    </label>
                    <input
                      name="phone"
                      className="adoption-modal-input"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      readOnly
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="adoption-modal-form-group">
                  <label className="adoption-modal-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <div className="adoption-modal-address-row">
                    <textarea
                      name="address"
                      className="adoption-modal-textarea"
                      rows={2}
                      value={form.address}
                      onChange={handleChange}
                      required
                      readOnly
                      placeholder="Chọn địa chỉ từ danh sách"
                    />
                    <button 
                      type="button" 
                      className="adoption-modal-btn-choose"
                      onClick={onShowAddressModal}
                    >
                      📍 Chọn
                    </button>
                  </div>
                </div>
              </div>

              {/* Work Info Section */}
              <div className="adoption-modal-section">
                <h3 className="adoption-modal-section-title">Thông tin công việc</h3>
                
                <div className="adoption-modal-row">
                  <div className="adoption-modal-form-group">
                    <label className="adoption-modal-label">Nghề nghiệp</label>
                    <input
                      name="job"
                      className="adoption-modal-input"
                      value={form.job}
                      onChange={handleChange}
                      placeholder="VD: Nhân viên văn phòng"
                    />
                  </div>
                  <div className="adoption-modal-form-group">
                    <label className="adoption-modal-label">Thu nhập hàng tháng</label>
                    <select
                      name="income"
                      className="adoption-modal-select"
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

              {/* Experience Section */}
              <div className="adoption-modal-section">
                <h3 className="adoption-modal-section-title">Kinh nghiệm nuôi thú cưng</h3>
                
                <div className="adoption-modal-form-group">
                  <label className="adoption-modal-label">
                    Bạn đã từng nuôi thú cưng chưa? <span className="required">*</span>
                  </label>
                  <div className="adoption-modal-radio-group">
                    <label className="adoption-modal-radio">
                      <input
                        type="radio"
                        name="experience"
                        value="1"
                        checked={form.experience === '1'}
                        onChange={handleChange}
                        required
                      />
                      <span className="adoption-modal-radio-custom"></span>
                      <span className="adoption-modal-radio-label">✅ Rồi, tôi có kinh nghiệm</span>
                    </label>
                    <label className="adoption-modal-radio">
                      <input
                        type="radio"
                        name="experience"
                        value="0"
                        checked={form.experience === '0'}
                        onChange={handleChange}
                        required
                      />
                      <span className="adoption-modal-radio-custom"></span>
                      <span className="adoption-modal-radio-label">❌ Chưa, đây là lần đầu</span>
                    </label>
                  </div>
                </div>

                <div className="adoption-modal-form-group">
                  <label className="adoption-modal-label">
                    Lý do muốn nhận nuôi <span className="required">*</span>
                  </label>
                  <textarea
                    name="reason"
                    className="adoption-modal-textarea"
                    rows={3}
                    value={form.reason}
                    onChange={handleChange}
                    required
                    placeholder="Chia sẻ lý do bạn muốn nhận nuôi bé..."
                  />
                </div>

                <div className="adoption-modal-form-group">
                  <label className="adoption-modal-label">Điều kiện chăm sóc</label>
                  <textarea
                    name="conditions"
                    className="adoption-modal-textarea"
                    rows={3}
                    value={form.conditions}
                    onChange={handleChange}
                    placeholder="Mô tả không gian sống, thời gian chăm sóc, điều kiện nuôi dưỡng..."
                  />
                </div>
              </div>

              {/* Agreement */}
              <label className="adoption-modal-checkbox">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  required
                />
                <span className="adoption-modal-checkbox-custom"></span>
                <span className="adoption-modal-checkbox-text">
                  🐾 Tôi đồng ý với các điều khoản nhận nuôi và cam kết chăm sóc thú cưng tốt nhất có thể
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="adoption-modal-footer">
              <button 
                type="button" 
                className="adoption-modal-btn-cancel" 
                onClick={onClose}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="adoption-modal-btn-submit"
                disabled={submitting}
              >
                {submitting && <span className="adoption-modal-spinner" />}
                {submitting ? 'Đang gửi...' : '🐾 Gửi đơn đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

