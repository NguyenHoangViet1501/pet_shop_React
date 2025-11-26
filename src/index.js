import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import "./styles/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 1. staleTime: Dữ liệu được coi là "tươi mới" trong bao lâu?
      // Ví dụ: 5 phút. Trong 5p này, dù user chuyển trang qua lại,
      // React Query sẽ trả về cache ngay lập tức, KHÔNG gọi API.
      staleTime: 5 * 60 * 1000,

      // 2. gcTime (trước đây là cacheTime): Dữ liệu không dùng nữa sẽ lưu trong bộ nhớ bao lâu trước khi bị xóa?
      // Ví dụ: 10 phút. Giữ lâu giúp user quay lại trang cũ vẫn thấy data ngay.
      gcTime: 10 * 60 * 1000,

      // 3. refetchOnWindowFocus: Khi user tab ra ngoài rồi quay lại tab này, có fetch lại không?
      // Nên để false để tránh gọi API thừa thãi nếu data ít thay đổi.
      refetchOnWindowFocus: false,

      // 4. retry: Nếu gọi API lỗi, thử lại mấy lần? (Mặc định là 3, nên giảm xuống 1 cho đỡ tốn tài nguyên)
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AppointmentProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AppointmentProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
