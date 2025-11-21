import React, { useEffect, useRef, useState } from 'react';
import ServicesGrid from './ServicesGrid';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { servicesAPI } from '../../api';

const ServicesPage = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    petType: '',
    appointmentDate: '',
    appointmentTime: '',
    petName: '',
    notes: ''
  });

  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const servicesRef = useRef(null);
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingServices(true);
      setServicesError('');
      try {
        const list = await servicesAPI.getActiveServices();
        if (!cancelled && Array.isArray(list)) setServices(list);
      } catch (e) {
        if (!cancelled) setServicesError('Không tải được dịch vụ.');
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // 🟢 Auto chọn dịch vụ khi được navigate từ HomePage
  useEffect(() => {
    if (routerLocation.state?.key) {
      setFormData((prev) => ({ ...prev, serviceType: routerLocation.state.key }));

      // Scroll tới form đặt lịch sau 1 chút để form render xong
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [routerLocation.state]);

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
    } catch (error) {
      const msg = error?.message || 'Đặt lịch thất bại. Vui lòng thử lại.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookFromCard = (serviceKey) => {
    if (routerLocation.pathname === '/') {
      navigate('/services', { state: { key: serviceKey } });
    } else {
      setFormData((prev) => ({ ...prev, serviceType: serviceKey }));
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="page" id="services">
      <div className="container page-content">
        <div className="text-center mb-5">
          <h1 className="mb-3">Dịch vụ chăm sóc thú cưng chuyên nghiệp</h1>
          <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 950 }}>
            Đội ngũ bác sĩ thú y và chuyên viên chăm sóc giàu kinh nghiệm của chúng tôi cam kết mang đến dịch vụ toàn diện, an toàn và tận tâm cho thú cưng của bạn.
          </p>
        </div>

        {/* Mô tả chi tiết các dịch vụ */}
        <div className="mb-5">
          <div className="row mb-5 align-items-center">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Tắm cho thú cưng"
              />
            </div>
            <div className="col-md-6">
              <h4 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Tắm và Vệ sinh</h4>
              <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                Trải nghiệm tắm thư giãn với sản phẩm organic, massage chuyên sâu. Bao gồm vệ sinh tai, cắt móng và chăm sóc da lông toàn diện.
                Thú cưng của bạn sẽ luôn sạch sẽ, thơm tho và hạnh phúc!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6 order-md-2">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Cắt tỉa lông"
              />
            </div>
            <div className="col-md-6 order-md-1">
              <h4 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Cắt tỉa lông</h4>
              <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                Thiết kế kiểu dáng thời trang theo giống loài. Chuyên viên chuyên nghiệp sử dụng dụng cụ cao cấp, đảm bảo an toàn tuyệt đối.
                Biến thú cưng của bạn thành ngôi sao phong cách!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Tiêm phòng"
              />
            </div>
            <div className="col-md-6">
              <h4 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Tiêm phòng</h4>
              <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                Vaccine chất lượng cao, tư vấn bởi bác sĩ chuyên khoa. Bảo vệ tối đa khỏi bệnh tật, theo lịch khuyến cáo quốc tế.
                Sức khỏe thú cưng là ưu tiên hàng đầu của chúng tôi!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6 order-md-2">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Khám bệnh"
              />
            </div>
            <div className="col-md-6 order-md-1">
              <h4 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Khám bệnh định kỳ</h4>
              <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                Phát hiện sớm bệnh tật qua kiểm tra toàn diện. Tư vấn dinh dưỡng, chăm sóc chuyên sâu. Siêu âm, xét nghiệm máu,
                đảm bảo thú cưng luôn khỏe mạnh và hạnh phúc!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>

          <div className="row mb-5 align-items-center">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop"
                className="img-fluid rounded shadow"
                alt="Lưu trú"
              />
            </div>
            <div className="col-md-6">
              <h4 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Dịch vụ lưu trú</h4>
              <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                Không gian thoải mái, chăm sóc 24/7 chuyên nghiệp. Ăn uống đầy đủ, vui chơi, theo dõi sức khỏe liên tục.
                Khu riêng cho chó và mèo, vệ sinh tuyệt đối. Thú cưng như ở nhà!
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Đặt lịch ngay
              </button>
            </div>
          </div>
        </div>

        <h3 ref={servicesRef} className="text-center mb-3">Dịch vụ của chúng tôi</h3>
        <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: 760 }}>
          Lựa chọn từ danh sách dịch vụ chuyên nghiệp, được thiết kế toàn diện cho nhu cầu của thú cưng.
        </p>

        <div className="mb-5">
          {loadingServices && (
            <div className="text-muted text-center">Đang tải dịch vụ...</div>
          )}
          {!loadingServices && servicesError && (
            <div className="text-danger text-center mb-3">{servicesError}</div>
          )}
          {!loadingServices && services.length > 0 && (
            <ServicesGrid services={services} onBook={handleBookFromCard} />
          )}
          {!loadingServices && !servicesError && services.length === 0 && (
            <div className="text-center text-muted">Chưa có dịch vụ để hiển thị.</div>
          )}
        </div>

        <div ref={formRef} className="card">
          <div className="card-body">
            <h5 className="mb-3">Đặt lịch dịch vụ</h5>
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

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang đặt lịch...' : 'Đặt lịch'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
