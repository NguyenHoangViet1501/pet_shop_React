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
  }
};
