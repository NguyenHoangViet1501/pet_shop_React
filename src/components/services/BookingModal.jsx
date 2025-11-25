import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { servicesAPI } from '../../api';

const BookingModal = ({ isOpen, onClose, services, initialServiceKey }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: initialServiceKey || '',
    petType: '',
    appointmentDate: '',
    appointmentTime: '',
    petName: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setHasAnimatedIn(false);
      setTimeout(() => setHasAnimatedIn(true), 10); // Small delay to start animation
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVisible) {
      setFormData(prev => ({ ...prev, serviceType: initialServiceKey || '' }));
    }
  }, [isVisible, initialServiceKey]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.serviceType) newErrors.serviceType = 'Vui lòng chọn loại dịch vụ';
    if (!formData.petType) newErrors.petType = 'Vui lòng chọn loại thú cưng';
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Vui lòng chọn ngày hẹn';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.appointmentDate = 'Ngày hẹn không thể là ngày trong quá khứ';
    }
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Vui lòng chọn giờ hẹn';
    if (!formData.petName.trim()) newErrors.petName = 'Vui lòng nhập tên thú cưng';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Vui lòng đăng nhập để đặt lịch dịch vụ', 'warning');
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedService = services.find(s => s.key === formData.serviceType);
      const serviceId = selectedService?.id;

      if (!serviceId) {
        throw new Error('Không xác định được dịch vụ. Vui lòng chọn lại.');
      }

      const isoDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;

      const payload = {
        serviceId: serviceId,
        userId: user?.id,
        namePet: formData.petName,
        speciePet: formData.petType,
        appoinmentStart: isoDateTime,
        status: 'SCHEDULED',
        notes: formData.notes || ''
      };

      const res = await servicesAPI.createAppointment(payload, token);

      showToast('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm, hãy kiểm tra email của bạn.', 'success');
      setFormData({
        serviceType: '',
        petType: '',
        appointmentDate: '',
        appointmentTime: '',
        petName: '',
        notes: ''
      });
      onClose();
    } catch (error) {
      const msg = error?.message || 'Đặt lịch thất bại. Vui lòng thử lại.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div
        className="modal-dialog modal-lg"
        style={{
          transform: hasAnimatedIn ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Đặt lịch dịch vụ</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Loại dịch vụ</label>
                <select
                  className={`form-select ${errors.serviceType ? 'is-invalid' : ''}`}
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map((s) => (
                    <option key={s.key} value={s.key}>{s.title}</option>
                  ))}
                </select>
                {errors.serviceType && (
                  <div className="invalid-feedback">{errors.serviceType}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Loại thú cưng</label>
                <select
                  className={`form-select ${errors.petType ? 'is-invalid' : ''}`}
                  name="petType"
                  value={formData.petType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn loại thú cưng</option>
                  <option value="Chó">Chó</option>
                  <option value="Mèo">Mèo</option>
                  <option value="Chim">Chim</option>
                  <option value="Khác">Khác</option>
                </select>
                {errors.petType && (
                  <div className="invalid-feedback">{errors.petType}</div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Ngày hẹn</label>
                  <input
                    type="date"
                    className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.appointmentDate && (
                    <div className="invalid-feedback">{errors.appointmentDate}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Giờ hẹn</label>
                  <select
                    className={`form-select ${errors.appointmentTime ? 'is-invalid' : ''}`}
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn giờ</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                  {errors.appointmentTime && (
                    <div className="invalid-feedback">{errors.appointmentTime}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Tên thú cưng</label>
                <input
                  type="text"
                  className={`form-control ${errors.petName ? 'is-invalid' : ''}`}
                  name="petName"
                  value={formData.petName}
                  onChange={handleInputChange}
                  required
                />
                {errors.petName && (
                  <div className="invalid-feedback">{errors.petName}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Ghi chú</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang đặt lịch...' : 'Đặt lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;