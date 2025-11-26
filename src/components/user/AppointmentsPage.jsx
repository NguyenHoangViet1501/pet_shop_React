import React, { useState, useEffect } from 'react';
import AppointmentEditModal from './AppointmentEditModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { servicesAPI } from '../../api/services';

const PAGE_SIZE = 6;

const AppointmentsPage = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = () => {
    if (!user || !token) return;
    setLoading(true);
    servicesAPI.getAppointmentsPaged({
      token,
      userId: user.id,
      roleName: user.roles,
      page: currentPage - 1, // API dùng page bắt đầu từ 0
      size: PAGE_SIZE,
    })
      .then((data) => {
        // Nếu API trả về data.result là mảng, dùng nó thay cho data.content
        const appointments = Array.isArray(data.content) ? data.content : (Array.isArray(data.result) ? data.result : []);
        setItems(appointments);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, token, currentPage]);

  const openEdit = (apt) => setEditing(apt);
  const closeEdit = () => setEditing(null);

  const handleSave = (form) => {
    fetchAppointments();
    closeEdit();
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) {
      return;
    }
    try {
      const response = await servicesAPI.cancelAppointment(id, token);
      if (response.success) {
        showToast('Hủy lịch hẹn thành công', 'success');
        fetchAppointments(); // Tải lại danh sách sau khi hủy thành công
      } else {
        showToast( response.message || 'Không thể hủy lịch hẹn. Vui lòng thử lại sau.','error');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showToast( 'Đã có lỗi xảy ra khi hủy lịch hẹn. Vui lòng thử lại sau.','error');
    }
  };

  return (
    <div className="container page-content">
      <h1 className="mb-4">Lịch hẹn của tôi</h1>
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Dịch vụ</th>
                    <th>Thú cưng</th>
                    <th>Ngày giờ bắt đầu</th>
                    <th>Ngày giờ kết thúc</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">Bạn chưa có lịch hẹn nào</td>
                    </tr>
                  ) : (
                    items.map((appointment, idx) => (
                      <tr key={appointment.id}>
                        <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td>{appointment.serviceName || appointment.service || ''}</td>
                        <td>{appointment.namePet || appointment.petName || ''}
                            {appointment.speciePet ? ` (${appointment.speciePet})` : ''}
                        </td>
                        <td>
                          {appointment.appoinmentStart
                            ? new Date(appointment.appoinmentStart).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                            : ''}
                        </td>
                        <td>
                          {appointment.appoinmentEnd
                            ? new Date(appointment.appoinmentEnd).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                            : ''}
                        </td>
                        <td>{appointment.notes || ''}</td>
                        <td>
                          <span
                            className={
                              appointment.status === 'SCHEDULED'
                                ? 'badge bg-warning'
                                : appointment.status === 'COMPLETED'
                                ? 'badge bg-primary'
                                : appointment.status === 'CANCELED'
                                ? 'badge bg-danger'
                                : 'badge bg-secondary'
                            }
                          >
                            {appointment.status === 'SCHEDULED'
                              ? 'Đã đặt'
                              : appointment.status === 'COMPLETED'
                              ? 'Hoàn thành'
                              : appointment.status === 'CANCELED'
                              ? 'Đã hủy'
                              : appointment.status}
                          </span>
                        </td>
                        <td>
                          {appointment.status === 'SCHEDULED' ? (
                            <>
                              <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(appointment)}>Sửa</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(appointment.id)}>Hủy</button>
                            </>
                          ) : (
                            <button className="btn btn-sm btn-outline-primary">Đánh giá</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination controls */}
              <nav className="mt-3">
                <ul className="pagination justify-content-center align-items-center" style={{ minHeight: 40 }}>
                  <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}
                      style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="page-link d-flex align-items-center justify-content-center" style={{ height: 40 }} onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
                  </li>
                  {[...Array(totalPages)].map((_, idx) => (
                    <li key={idx + 1} className={`page-item${currentPage === idx + 1 ? ' active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center' }}>
                      <button className="page-link d-flex align-items-center justify-content-center" style={{ height: 40 }} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}
                      style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="page-link d-flex align-items-center justify-content-center" style={{ height: 40 }} onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>&raquo;</button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      <AppointmentEditModal
        isOpen={Boolean(editing)}
        onClose={closeEdit}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
};

export default AppointmentsPage;