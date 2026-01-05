import { apiFetch } from "../utils/api";

export const petsApi = {
  // Lấy danh sách pets với filter (cho customer)
  getPets: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Thêm filter params
    if (params.animal) queryParams.append("animal", params.animal);
    if (params.minWeight) queryParams.append("minWeight", params.minWeight);
    if (params.maxWeight) queryParams.append("maxWeight", params.maxWeight);
    if (params.ageGroup) queryParams.append("ageGroup", params.ageGroup);
    
    // Pagination
    if (params.page !== undefined) {
      queryParams.append("page", params.page);
    }
    if (params.limit !== undefined) {
      queryParams.append("size", params.limit);
    }

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

