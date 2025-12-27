import React, { useEffect, useState } from 'react';
import { servicesAPI } from '../../api/services';
import { useToast } from '../../context/ToastContext';

const ModalShell = ({ isOpen, title, onClose, children, footer }) => {
	useEffect(() => {
		if (isOpen) document.body.classList.add('modal-open'); else document.body.classList.remove('modal-open');
		return () => document.body.classList.remove('modal-open');
	}, [isOpen]);
	if (!isOpen) return null;
	return (
		<>
			<div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
			<div className="modal fade show" style={{ display: 'block', zIndex: 1055 }}>
				<div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
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

const AppointmentEditModal = ({ isOpen, onClose, initial, onSave }) => {
	const { showToast } = useToast();
	const [form, setForm] = useState({
		serviceId: '',
		petType: '',
		petName: '',
		appointmentDate: '',
		appointmentTime: '',
		notes: ''
	});
	const [services, setServices] = useState([]);
	const [availableSlots, setAvailableSlots] = useState([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [selectedSlotId, setSelectedSlotId] = useState(null);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (isOpen) {
			servicesAPI.getActiveServices().then(setServices);
		}
	}, [isOpen]);

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

	useEffect(() => {
		if (isOpen && initial && services.length > 0) {
			let mappedServiceId = initial.serviceId || '';
			if (!mappedServiceId && initial.serviceName) {
				// Tìm service có title trùng với serviceName
				const found = services.find(s => s.title === initial.serviceName);
				if (found) mappedServiceId = found.id;
			}
			let mappedPetType = '';
			if (initial.petType) mappedPetType = initial.petType;
			else if (initial.speciePet) {
				const specie = initial.speciePet.trim().toLowerCase();
				if (specie === 'chó') mappedPetType = 'dog';
				else if (specie === 'mèo') mappedPetType = 'cat';
				else if (specie === 'chim') mappedPetType = 'bird';
				else mappedPetType = 'other';
			}
			const date = initial.appointmentDate || (initial.appointmentStart ? initial.appointmentStart.slice(0,10) : '');
			const time = initial.appointmentTime || (initial.appointmentStart ? initial.appointmentStart.slice(11,16) : '');
			setForm({
				serviceId: mappedServiceId,
				petType: mappedPetType,
				petName: initial.petName || initial.namePet || '',
				appointmentDate: date,
				appointmentTime: time,
				notes: initial.notes || ''
			});
			if (mappedServiceId && date) {
				fetchSlots(mappedServiceId, date);
			}
		}
	}, [isOpen, initial, services]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === 'serviceId') {
			setForm((prev) => ({ ...prev, serviceId: value ? Number(value) : '', appointmentDate: '', appointmentTime: '' }));
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
			setForm((prev) => ({ ...prev, appointmentDate: value, appointmentTime: '' }));
			setSelectedSlotId(null);
			if (value && form.serviceId) {
				fetchSlots(form.serviceId, value);
			} else {
				setAvailableSlots([]);
			}
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('auth_token');
			const payload = {
				id: initial.id,
				bookingTimeId: selectedSlotId,
				namePet: form.petName,
				speciePet:
					form.petType === 'dog' ? 'Chó' :
					form.petType === 'cat' ? 'Mèo' :
					form.petType === 'bird' ? 'Chim' :
					'Khác',
				notes: form.notes
			};
			const response = await servicesAPI.updateAppointment(payload, token);
			if (response.success) {
				showToast('Cập nhật dịch vụ thành công', 'success');
				onSave?.(form);
				onClose();
			} else {
				showToast(response.message || 'Có lỗi xảy ra', 'error');
			}
		} catch (error) {
			console.error('Error updating appointment:', error);
			showToast(error.message || 'Có lỗi xảy ra khi cập nhật', 'error');
		}
	};

	return (
		<ModalShell
			isOpen={isOpen}
			title="Sửa lịch hẹn"
			onClose={onClose}
			footer={(
				<>
					<button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
					<button type="submit" form="appointmentEditForm" className="btn btn-primary">Lưu</button>
				</>
			)}
		>
			<form id="appointmentEditForm" onSubmit={handleSubmit}>
				<div className="mb-3">
					<label className="form-label">Loại dịch vụ</label>
					<select className="form-select" name="serviceId" value={form.serviceId} onChange={handleChange}>
						<option value="">Chọn dịch vụ</option>
						{services.map(s => (
							<option key={s.id} value={s.id}>{s.title}</option>
						))}
					</select>
				</div>
				<div className="row">
					<div className="col-md-6 mb-3">
						<label className="form-label">Loại thú cưng</label>
						<select className="form-select" name="petType" value={form.petType} onChange={handleChange}>
							<option value="">Chọn loại thú cưng</option>
							<option value="dog">Chó</option>
							<option value="cat">Mèo</option>
							<option value="bird">Chim</option>
							<option value="other">Khác</option>
						</select>
					</div>
					<div className="col-md-6 mb-3">
						<label className="form-label">Tên thú cưng</label>
						<input className="form-control" name="petName" value={form.petName} onChange={handleChange} />
					</div>
				</div>
				<div className="mb-3">
					<label className="form-label">Ngày hẹn</label>
					<input type="date" className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`} name="appointmentDate" value={form.appointmentDate} onChange={handleChange} />
					{errors.appointmentDate && (
						<div className="invalid-feedback">{errors.appointmentDate}</div>
					)}
				</div>
				<div className="mb-3">
					<label className="form-label">Khung giờ hẹn</label>
					{!form.appointmentDate ? (
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
														const isPast = slot.slotDate === form.appointmentDate && slotDateTime <= now;
														return (
															<button
																key={slot.id}
																type="button"
																className={`btn ${selectedSlotId === slot.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm ${isPast ? 'disabled' : ''}`}
																onClick={() => {
																	if (!isPast) {
																		setSelectedSlotId(slot.id);
																		setForm(prev => ({ ...prev, appointmentTime: slot.startTime }));
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
														const isPast = slot.slotDate === form.appointmentDate && slotDateTime <= now;
														return (
															<button
																key={slot.id}
																type="button"
																className={`btn ${selectedSlotId === slot.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm ${isPast ? 'disabled' : ''}`}
																onClick={() => {
																	if (!isPast) {
																		setSelectedSlotId(slot.id);
																		setForm(prev => ({ ...prev, appointmentTime: slot.startTime }));
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
				</div>
				<div className="mb-3">
					<label className="form-label">Ghi chú</label>
					<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Ghi chú thêm (nếu có)" />
				</div>
			</form>
		</ModalShell>
	);
};

export default AppointmentEditModal;
