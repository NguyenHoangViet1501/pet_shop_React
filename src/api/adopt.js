import { apiFetch } from "../utils/api";

export const adoptApi = {
	createAdoptRequest: async (payload, token) => {
		// Use RESTful create endpoint: POST /v1/adopts
		return apiFetch("/v1/adopt", {
			method: "POST",
			body: payload,
			token,
		});
	},
	getAdoptsByUser: async (userId, params, token) => {
	const cleanParams = Object.fromEntries(
		Object.entries(params).filter(
		([_, v]) => v !== null && v !== undefined && v !== ""
		)
	);

	const query = new URLSearchParams(cleanParams).toString();

	return apiFetch(`/v1/adopt/user/${userId}?${query}`, {
		method: "GET",
		token,
	});
	},
	getAdoptDetail: async (adoptId, token) => {
	return apiFetch(`/v1/adopt/${adoptId}`, {
		method: "GET",
		token,
	});
	},
	cancelAdoptRequest: async (adoptId, token) => {
		return apiFetch(`/v1/adopt/cancel/${adoptId}`, {
			method: "PUT",
			token,
		});
	},
};
