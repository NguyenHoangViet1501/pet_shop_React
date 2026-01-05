import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { servicesAPI } from '../../api';

const BookingModal = ({ isOpen, onClose, services, initialServiceId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: initialServiceId || '',
    petType: '',
    appointmentDate: '',
    appointmentTime: '',
    petName: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
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
      setFormData(prev => ({ ...prev, serviceId: initialServiceId || '' }));
    }
  }, [isVisible, initialServiceId]);

  useEffect(() => {
    if (formData.appointmentDate && formData.serviceId) {
      const selectedService = services.find(s => s.id === formData.serviceId);
      if (selectedService) {
        fetchSlots(selectedService.id, formData.appointmentDate);
      }
    } else {
      setAvailableSlots([]);
      setSelectedSlotId(null);
    }
  }, [formData.appointmentDate, formData.serviceId, services]);

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
    if (name === 'serviceId') {
      setFormData(prev => ({ ...prev, serviceId: value ? Number(value) : '', appointmentDate: '', appointmentTime: '' }));
      setAvailableSlots([]);
      setSelectedSlotId(null);
    } else if (name === 'appointmentDate') {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 14);
        if (selectedDate < today || selectedDate > maxDate) {
          setErrors(prev => ({ ...prev, appointmentDate: 'Ngày đặt lịch không hợp lệ, phải trong khoảng từ hôm nay đến 14 ngày tới' }));
          showToast('Ngày đặt lịch không hợp lệ, phải trong khoảng từ hôm nay đến 14 ngày tới', 'error');
        } else {
          setErrors(prev => ({ ...prev, appointmentDate: '' }));
        }
      } else {
        setErrors(prev => ({ ...prev, appointmentDate: '' }));
      }
      setSelectedSlotId(null);
      setFormData(prev => ({ ...prev, appointmentTime: '' }));
    }
  };

  const fetchSlots = async (serviceId, date) => {
    setLoadingSlots(true);
    try {
      const response = await servicesAPI.getAvailableBookingTimes(serviceId, date);
      setAvailableSlots(response.result || []);
    } catch (error) {
      console.error(error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.serviceId) newErrors.serviceId = 'Vui lòng chọn loại dịch vụ';
    if (!formData.petType) newErrors.petType = 'Vui lòng chọn loại thú cưng';
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Vui lòng chọn ngày hẹn';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 14);
      if (selectedDate < today || selectedDate > maxDate) {
        newErrors.appointmentDate = 'Ngày đặt lịch không hợp lệ, phải trong khoảng từ hôm nay đến 14 ngày tới';
      }
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
      if (!selectedSlotId) {
        throw new Error('Vui lòng chọn khung giờ hẹn.');
      }

      const payload = {
        bookingTimeId: selectedSlotId,
        userId: user?.id,
        namePet: formData.petName,
        speciePet: formData.petType,
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
                <label className="form-label">Loại dịch vụ<span style={{ color: 'red' }}>*</span></label>
                <select
                  className={`form-select ${errors.serviceId ? 'is-invalid' : ''}`}
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                {errors.serviceId && (
                  <div className="invalid-feedback">{errors.serviceId}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Loại thú cưng <span style={{ color: 'red' }}>*</span></label>
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
                <div className="col-12 mb-3">
                  <label className="form-label">Ngày hẹn<span style={{ color: 'red' }}>*</span></label>
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
                <div className="col-12 mb-3">
                  <label className="form-label">Khung giờ hẹn</label>
                  {!formData.appointmentDate ? (
                    <p className="text-muted">Vui lòng chọn ngày hẹn trước</p>
                  ) : loadingSlots ? (
                    <p className="text-muted">Đang tải khung giờ...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-muted">Không có khung giờ khả dụng cho ngày này</p>
                  ) : (
                    <div>
                      {(() => {
                        const morningSlots = availableSlots.filter(slot => slot.startTime < '12:00').sort((a, b) => a.startTime.localeCompare(b.startTime));
                        const afternoonSlots = availableSlots.filter(slot => slot.startTime >= '12:00').sort((a, b) => a.startTime.localeCompare(b.startTime));
                        return (
                          <>
                            {morningSlots.length > 0 && (
                              <div className="mb-3">
                                <label className="form-label fw-bold">Buổi sáng</label>
                                <div className="d-flex flex-wrap gap-2">
                                  {morningSlots.map(slot => {
                                    const slotDateTime = new Date(`${slot.slotDate}T${slot.startTime}`);
                                    const now = new Date();
                                    const isPast = slot.slotDate === formData.appointmentDate && slotDateTime <= now;
                                    return (
                                      <button
                                        key={slot.id}
                                        type="button"
                                        className={`btn ${selectedSlotId === slot.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm ${isPast ? 'disabled' : ''}`}
                                        onClick={() => {
                                          if (!isPast) {
                                            setSelectedSlotId(slot.id);
                                            setFormData(prev => ({ ...prev, appointmentTime: slot.startTime }));
                                            if (errors.appointmentTime) {
                                              setErrors(prev => ({ ...prev, appointmentTime: '' }));
                                            }
                                          }
                                        }}
                                        disabled={slot.availableCount === 0 || isPast}
                                      >
                                        {slot.startTime} - {slot.endTime}<br />trống {slot.availableCount} chỗ
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {afternoonSlots.length > 0 && (
                              <div className="mb-3">
                                <label className="form-label fw-bold">Buổi chiều</label>
                                <div className="d-flex flex-wrap gap-2">
                                  {afternoonSlots.map(slot => {
                                    const slotDateTime = new Date(`${slot.slotDate}T${slot.startTime}`);
                                    const now = new Date();
                                    const isPast = slot.slotDate === formData.appointmentDate && slotDateTime <= now;
                                    return (
                                      <button
                                        key={slot.id}
                                        type="button"
                                        className={`btn ${selectedSlotId === slot.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm ${isPast ? 'disabled' : ''}`}
                                        onClick={() => {
                                          if (!isPast) {
                                            setSelectedSlotId(slot.id);
                                            setFormData(prev => ({ ...prev, appointmentTime: slot.startTime }));
                                            if (errors.appointmentTime) {
                                              setErrors(prev => ({ ...prev, appointmentTime: '' }));
                                            }
                                          }
                                        }}
                                        disabled={slot.availableCount === 0 || isPast}
                                      >
                                        {slot.startTime} - {slot.endTime}<br />trống {slot.availableCount} chỗ
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  {errors.appointmentTime && (
                    <div className="invalid-feedback d-block">{errors.appointmentTime}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Tên thú cưng <span style={{ color: 'red' }}>*</span></label>
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