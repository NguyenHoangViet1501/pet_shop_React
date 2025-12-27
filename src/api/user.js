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
  // Can be called as sendOtp(userData, email) to validate user data before sending
  // or sendOtp(email) to just send by email (backwards compatible).
  sendOtp: async (payloadOrEmail, email) => {
    let body = undefined;
    let queryEmail = email;

    if (typeof payloadOrEmail === 'string' && !email) {
      // called as sendOtp(email)
      queryEmail = payloadOrEmail;
    } else {
      // called as sendOtp(userData, email)
      body = payloadOrEmail;
    }

    const query = queryEmail ? `?email=${encodeURIComponent(queryEmail)}` : "";
    return await apiFetch(`/v1/users/send-otp${query}`, {
      method: 'POST',
      body,
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
