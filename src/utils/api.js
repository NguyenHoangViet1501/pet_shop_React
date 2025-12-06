// api.js
// ----------------------
// Hàm helper để gọi API backend một cách tiện lợi
// Hỗ trợ:
//  ✅ Gắn Authorization token tự động
//  ✅ Refresh token nếu 401 Unauthorized
//  ✅ Xử lý JSON response & lỗi gọn gàng
// ----------------------

const API_BASE = "/api"; // Đường dẫn gốc cho API backend (ví dụ: /api/v1/...)

// Hàm chính
export async function apiFetch(
  path,
  {
    method = "GET", // Mặc định là GET nếu không truyền gì
    headers = {}, // Header bổ sung
    body, // Dữ liệu gửi lên (nếu có)
    token = localStorage.getItem("auth_token"), // Tự động lấy token từ localStorage nếu không truyền
    onTokenRefresh, // Callback để refresh token nếu bị 401
  } = {}
) {
  // 1️⃣ Gộp các header mặc định
  const finalHeaders = {
    "Content-Type": "application/json", // Gửi dữ liệu dạng JSON
    ...headers,
  };

  // Nếu có token, thêm vào Authorization header
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 2️⃣ Hàm con giúp gửi request thật sự
  const makeRequest = async (accessToken) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...finalHeaders,
        // Nếu hàm này được gọi lại sau khi refresh token, gắn token mới
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      // Chỉ stringify nếu có body
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include", // Gửi cookie nếu cần (ví dụ refresh-token cookie)
    });

    let data;
    try {
      // 3️⃣ Thử parse JSON trả về
      data = await res.json();
    } catch {
      // Nếu không parse được mà response không OK → lỗi
      if (!res.ok) throw new Error("Request failed");
      return null; // Nếu không có dữ liệu JSON, chỉ return null
    }

    // 4️⃣ Kiểm tra nếu response lỗi (status >= 400)
    if (!res.ok) {
      // Nếu bị 401 Unauthorized (token hết hạn)
      if (res.status === 401 && onTokenRefresh) {
        // Gọi hàm refresh token từ AuthContext
        const newToken = await onTokenRefresh();

        if (newToken) {
          // Gửi lại request với token mới
          return makeRequest(newToken);
        }
      }

      // Nếu không phải lỗi 401 hoặc refresh thất bại → throw lỗi ra ngoài
      throw new Error(data?.message || data?.error || "Request failed");
    }

    // 5️⃣ Nếu thành công → trả về dữ liệu JSON
    return data;
  };

  // 6️⃣ Gọi hàm makeRequest lần đầu với token ban đầu
  return makeRequest(token);
}
