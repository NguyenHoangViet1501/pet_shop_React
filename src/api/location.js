import { apiFetch } from "../utils/api";

export const locationApi = {
    getProvinces: async () => {
        return apiFetch("/v1/locations/provinces", {
            method: "GET",
        });
    },
    getDistricts: async (provinceCode) => {
        return apiFetch(`/v1/locations/districts/${provinceCode}`, {
            method: "GET",
        });
    },
    getWards: async (districtCode) => {
        return apiFetch(`/v1/locations/wards/${districtCode}`, {
            method: "GET",
        });
    }
};

