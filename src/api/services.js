import { apiFetch } from '../utils/api';

// Service icons mapping
export const serviceIcons = {
  veterinary: "fas fa-stethoscope",
  grooming: "fas fa-bath",
  haircut: "fas fa-cut",
  vaccination: "fas fa-syringe",
  petboarding: "fas fa-dog",
};

// Format duration helper
export const formatDuration = (minutes) => {
  if (minutes === undefined || minutes === null) return "";
  const total = Number(minutes);
  if (Number.isNaN(total)) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
};

// Map service DTO helper
export const mapServiceDto = (dto) => ({
  id: dto.id,
  key: dto.name,
  icon: serviceIcons[dto.name] || "fas fa-paw",
  title: dto.title || dto.name,
  description: dto.description || "",
  duration: formatDuration(dto.durationMinutes),
  price: typeof dto.price === "number" ? dto.price : parseFloat(dto.price || "0"),
});

// Cache variables
let servicesCache = null;
let inFlightPromise = null;

// Services API functions
export const servicesAPI = {
  // Lấy danh sách dịch vụ active (với cache và data processing)
  getActiveServices: async () => {
    if (servicesCache) return servicesCache;
    if (inFlightPromise) return inFlightPromise;

    inFlightPromise = apiFetch('/v1/services/active')
      .then((response) => {
        const payload = response || {};
        const list = Array.isArray(payload.result) ? payload.result : [];
        const mapped = list
          .filter((s) => {
            const v = s.isActive;
            if (v === undefined || v === null) return true;
            if (typeof v === "number") return v === 1;
            if (typeof v === "boolean") return v;
            const str = String(v).toLowerCase();
            return str === "1" || str === "true" || str === "y" || str === "active";
          })
          .map(mapServiceDto);
        servicesCache = mapped;
        return mapped;
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        inFlightPromise = null;
      });

    return inFlightPromise;
  },

  // Tạo appointment mới
  createAppointment: async (appointmentData, token) => {
    return await apiFetch('/v1/appointments', {
      method: 'POST',
      body: appointmentData,
      token
    });
  },

  // Lấy danh sách appointments của user
  getUserAppointments: async (token) => {
    return await apiFetch('/v1/appointments', { token });
  },

  // Lấy danh sách appointments phân trang
  getAppointmentsPaged: async ({ token, userId, roleName, page = 0, size = 8 }) => {
    return await apiFetch(`/v1/appointments/list?page=${page}&size=${size}`, {
      method: 'POST',
      body: { userId, roleName },
      token
    });
  },



  // Cập nhật appointment (theo API mới)
  updateAppointment: async (updateData, token) => {
    return await apiFetch('/v1/appointments/update', {
      method: 'PUT',
      body: updateData,
      token
    });
  },

  // Hủy appointment
  cancelAppointment: async (appointmentId, token) => {
    return await apiFetch(`/v1/appointments/cancel`, {
      method: 'PUT',
      body:  appointmentId ,
      token
    });
  },

  // Lấy danh sách thời gian đặt lịch khả dụng
  getAvailableBookingTimes: async (serviceId, date) => {
    return await apiFetch('/v1/booking-times/available', {
      method: 'POST',
      body: { serviceId, date }
    });
  }
};
