import { authAPI } from "../api/auth";

/**
 * Custom hook để sử dụng các hàm xác thực từ API
 * Bao gồm: sendOtp, verifyOtp, changePasswordWithOtp
 */
export const useAuthApi = () => {
  const sendOtp = async (identifier) => {
    try {
      const response = await authAPI.sendOtp(identifier);
      if (!response.success) {
        throw new Error(response.message || "Gửi OTP thất bại");
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Không thể gửi OTP. Vui lòng thử lại sau.");
    }
  };

  const verifyOtp = async (identifier, otp) => {
    try {
      const response = await authAPI.verifyOtp(identifier, otp);
      if (!response.success) {
        throw new Error(response.message || "Mã OTP không chính xác");
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Xác thực OTP thất bại.");
    }
  };

  const changePassword = async (identifier, newPassword) => {
    try {
      const response = await authAPI.changePassword(identifier, newPassword);
      if (!response.success) {
        throw new Error(response.message || "Đổi mật khẩu thất bại");
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Không thể đổi mật khẩu. Vui lòng thử lại sau.");
    }
  };

  return {
    sendOtp,
    verifyOtp,
    changePassword,
  };
};
