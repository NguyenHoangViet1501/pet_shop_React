import React, { useState } from 'react';

const ChangePasswordTab = ({ showToast }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    /**
     * Mật khẩu đăng nhập
     * - Không được để trống
     * - Tối thiểu 6 ký tự
     * - Phải chứa ít nhất: 1 chữ thường (a-z), 1 chữ HOA (A-Z),
     *   1 chữ số (0-9) và 1 ký tự đặc biệt (@$!%*?&#)
     *
     * Ví dụ hợp lệ: Password123!, MyP@ss2024, Secure#123
     */
    if (!password) {
      return 'Không được để trống';
    }
    if (password.length < 6) {
      return 'Tối thiểu 6 ký tự';
    }
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&#]/.test(password);
    if (!hasLowerCase || !hasUpperCase || !hasDigit || !hasSpecialChar) {
      return 'Phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt (@$!%*?&#)';
    }
    return null;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      showToast(`Mật khẩu mới: ${passwordError}`, 'danger');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Xác nhận mật khẩu không khớp.', 'danger');
      return;
    }
    showToast('Đổi mật khẩu thành công!', 'success');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="tab-pane fade show active" id="change-password">
      <div className="card">
        <div className="card-body">
          <h5>Đổi mật khẩu</h5>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input type="password" className="form-control" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input type="password" className="form-control" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input type="password" className="form-control" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
            </div>
            <button type="submit" className="btn btn-primary">Đổi mật khẩu</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordTab;