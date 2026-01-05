import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addressAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import SearchableSelect from '../common/SearchableSelect';
import { useLocation } from '../../hooks/useLocation';

const ModalShell = ({ isOpen, title, onClose, children, footer }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
            <div className="modal fade show" style={{ display: 'block', zIndex: 1055 }}>
                <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">{children}</div>
                        {footer && <div className="modal-footer">{footer}</div>}
                    </div>
                </div>
            </div>
        </>
    );
};

const AddressEditModal = ({ isOpen, onClose, onSave, address }) => {
    const { user, token } = useAuth();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        addressLine: '',
        isDefault: false
    });
    const [errors, setErrors] = useState({});
    const [isUsingLoginInfo, setIsUsingLoginInfo] = useState(false);

    // Prepare initial address for hook, memoized
    const initialLocation = React.useMemo(() => address ? {
        city: address.city,
        district: address.district || address.state,
        ward: address.ward
    } : null, [address]);

    const {
        provinces, districts, wards,
        selectedCity, selectedDistrict, selectedWard,
        setCity, setDistrict, setWard
    } = useLocation(initialLocation);

    useEffect(() => {
        if (isOpen && address) {
            setForm({
                fullName: address.fullName || address.contactName || '',
                phone: address.phone || '',
                addressLine: address.addressLine || address.detailAddress || '',
                isDefault: address.isDefault === "1" || address.isDefault === true
            });
            setErrors({});
            setIsUsingLoginInfo(false);
        }
    }, [isOpen, address]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleUseLoginInfo = () => {
        if (isUsingLoginInfo) {
            setForm((prev) => ({
                ...prev,
                fullName: '',
                phone: ''
            }));
            setIsUsingLoginInfo(false);
            setErrors((prev) => ({
                ...prev,
                fullName: '',
                phone: ''
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                fullName: user?.fullName || user?.name || '',
                phone: user?.phone || ''
            }));
            setIsUsingLoginInfo(true);
            setErrors((prev) => ({
                ...prev,
                fullName: '',
                phone: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống';
        if (!form.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (form.phone.length < 10) {
            newErrors.phone = 'Số điện thoại phải có ít nhất 10 số';
        }
        if (!form.addressLine.trim()) newErrors.addressLine = 'Địa chỉ không được để trống';

        if (!selectedCity) newErrors.city = 'Vui lòng chọn Tỉnh/Thành';
        if (!selectedDistrict) newErrors.district = 'Vui lòng chọn Quận/Huyện';
        if (!selectedWard) newErrors.ward = 'Vui lòng chọn Phường/Xã';

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
                id: address.id,
                contactName: form.fullName,
                phone: form.phone,
                detailAddress: form.addressLine,
                city: selectedCity.name,
                state: selectedDistrict.name,
                ward: selectedWard.name,
                isDefault: form.isDefault ? "1" : "0",
                isDeleted: "0"
            };

            await addressAPI.updateAddress(addressData, token);
            showToast('Đã cập nhật địa chỉ!', 'success');
            // Return updated data
            onSave?.(addressData);
            onClose();
        } catch (error) {
            showToast('Có lỗi xảy ra khi cập nhật địa chỉ. Vui lòng thử lại.', 'error');
            console.error('Error updating address:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalShell
            isOpen={isOpen}
            title="Chỉnh sửa địa chỉ"
            onClose={onClose}
            footer={(
                <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                    <button type="submit" form="addressEditForm" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </>
            )}
        >
            <form id="addressEditForm" onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Họ và tên</label>
                        <input className={`form-control ${errors.fullName ? 'is-invalid' : ''}`} name="fullName" value={form.fullName} onChange={handleChange} />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Số điện thoại</label>
                        <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} name="phone" value={form.phone} onChange={handleChange} />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                    <div className="col-12">
                        <button
                            type="button"
                            className={`btn btn-sm ${isUsingLoginInfo ? 'btn-warning' : 'btn-outline-primary'}`}
                            onClick={handleUseLoginInfo}
                        >
                            {isUsingLoginInfo ? 'Hủy sử dụng thông tin đăng nhập' : 'Sử dụng thông tin đăng nhập'}
                        </button>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Tỉnh/Thành</label>
                        <div style={{ zIndex: 1003 }}>
                            <SearchableSelect
                                options={provinces}
                                value={selectedCity?.code}
                                displayValue={initialLocation?.city}
                                onChange={setCity}
                                placeholder="Chọn Tỉnh/Thành"
                                error={errors.city}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <label className="form-label">Quận/Huyện</label>
                        <div style={{ zIndex: 1002 }}>
                            <SearchableSelect
                                options={districts}
                                value={selectedDistrict?.code}
                                displayValue={initialLocation?.district}
                                onChange={setDistrict}
                                placeholder="Chọn Quận/Huyện"
                                error={errors.district}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <label className="form-label">Phường/Xã</label>
                        <div style={{ zIndex: 1001 }}>
                            <SearchableSelect
                                options={wards}
                                value={selectedWard?.code}
                                displayValue={initialLocation?.ward}
                                onChange={setWard}
                                placeholder="Chọn Phường/Xã"
                                error={errors.ward}
                            />
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Địa chỉ cụ thể (Số nhà, đường...)</label>
                        <input className={`form-control ${errors.addressLine ? 'is-invalid' : ''}`} name="addressLine" value={form.addressLine} onChange={handleChange} />
                        {errors.addressLine && <div className="invalid-feedback">{errors.addressLine}</div>}
                    </div>

                    <div className="col-12 form-check mt-2">
                        <input className="form-check-input" type="checkbox" id="isDefault" name="isDefault" checked={form.isDefault} onChange={handleChange} />
                        <label htmlFor="isDefault" className="form-check-label">Đặt làm địa chỉ mặc định</label>
                    </div>
                </div>
            </form>
        </ModalShell>
    );
};

export default AddressEditModal;
