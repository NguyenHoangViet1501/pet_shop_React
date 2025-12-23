import { apiFetch } from "../utils/api";

export const petsApi = {
  // Lấy danh sách pets với filter (cho customer)
  getPets: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Thêm filter params
    if (params.animal) queryParams.append("animal", params.animal);
    if (params.size) queryParams.append("size", params.size);
    if (params.ageGroup) queryParams.append("ageGroup", params.ageGroup);
    if (params.isDeleted !== undefined) {
      queryParams.append("isDeleted", params.isDeleted);
    } else {
      // Mặc định chỉ lấy pets chưa bị xóa
      queryParams.append("isDeleted", "0");
    }

    const queryString = queryParams.toString();
    return await apiFetch(`/v1/pets${queryString ? `?${queryString}` : ""}`);
  },

  // Lấy danh sách animals (cho filter)
  getAnimals: async () => {
    return await apiFetch(`/v1/pets/animalsCustomer`);
  },

  // Lấy chi tiết 1 pet
  getPetById: async (id) => {
    return await apiFetch(`/v1/pets/${id}`);
  },
};

