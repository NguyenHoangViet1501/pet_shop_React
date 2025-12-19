import { apiFetch } from '../utils/api';

// User API functions
export const userAPI = {
  // Lấy thông tin user hiện tại
  getMyInfo: async (token) => {
    return await apiFetch('/v1/users/myInfo', { token });
  },

  // Cập nhật thông tin user
  updateUser: async (userId, userData, token) => {
    return await apiFetch(`/v1/users/${userId}`, {
      method: 'PUT',
      body: userData,
      token
    });
  },
  changePasswordUser: async (userId, passwordData, token) => {
    return await apiFetch(`/v1/users/changePassword/${userId}`, {
      method: 'PUT',
      body: passwordData,
      token
    });
  },

  // Gửi OTP xác thực email
  sendOtp: async (email) => {
    return await apiFetch(`/v1/users/send-otp?email=${email}`, {
      method: 'POST',
    });
  },

  // Đăng ký tài khoản mới với OTP
  register: async (userData, otp) => {
    return await apiFetch(`/v1/users?otp=${otp}`, {
      method: 'POST',
      body: userData,
    });
  }
};
