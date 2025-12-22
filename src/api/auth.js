import { apiFetch } from '../utils/api';

// Auth API functions
export const authAPI = {
  // Đăng nhập
  login: async (email, password) => {
    return await apiFetch('/v1/auth/login', {
      method: 'POST',
      body: { identifier: email, password }
    });
  },

  // Đăng xuất
  logout: async (token) => {
    return await apiFetch('/v1/auth/logout', {
      method: 'POST',
      body: { token }
    });
  },

  // Refresh token
  refreshToken: async (currentToken) => {
    return await apiFetch('/v1/auth/refresh-token', {
      method: 'POST',
      body: { token: currentToken }
    });
  },

  // Gửi OTP
  sendOtp: async (identifier) => {
    return await apiFetch('/v1/auth/send-otp', {
      method: 'POST',
      body: { identifier }
    });
  },

  // Verify OTP
  verifyOtp: async (identifier, otp) => {
    // Backend đã sửa thành @RequestParam String identifier
    return await apiFetch(`/v1/auth/verify-otp?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otp)}`, {
      method: 'POST'
    });
  },

  // Đổi mật khẩu
  changePassword: async (identifier, newPassword) => {
    return await apiFetch('/v1/auth/change-password', {
      method: 'POST',
      body: { identifier, password: newPassword }
    });
  },

};

