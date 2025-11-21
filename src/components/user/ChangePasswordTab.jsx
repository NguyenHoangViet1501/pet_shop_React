import React, { useState } from 'react';
import { userAPI } from '../../api/user';

const ChangePasswordTab = ({ showToast, userId, token }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword)
      return showToast('Vui lòng nhập đầy đủ thông tin.', 'warning');
    if (newPassword !== confirmPassword)
      return showToast('Xác nhận mật khẩu không khớp.', 'danger');
    if (!userId)
      return showToast('Không tìm thấy người dùng. Vui lòng đăng nhập lại.', 'danger');

    // Validate mật khẩu mới
    if (newPassword.length < 8) {
      return showToast('Mật khẩu tối thiểu là 8 ký tự', 'danger');
    }
    // Regex: ít nhất 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return showToast('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ HOA, 1 số và 1 ký tự đặc biệt (@$!%*?&#)', 'danger');
    }

    setSubmitting(true);
    try {
      const res = await userAPI.changePasswordUser(
        userId,
        {
          oldPassword: currentPassword,
          newPassword,
        },
        token
      );
      if (res?.success) {
        showToast(res.message || 'Đổi mật khẩu thành công!', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(res?.message || 'Đổi mật khẩu thất bại.', 'danger');
      }
    } catch (err) {
      console.error('Change password error:', err);
      showToast(err.message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tab-pane fade show active" id="change-password">
      <div className="card">
        <div className="card-body">
          <h5>Đổi mật khẩu</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-control"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordTab;
