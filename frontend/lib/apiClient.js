import axios from "axios";

// Environment-specific Base URL ensures it matches the environment of the developer pulling the code
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// Axios instance relying purely on the environment variable
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// A generic request handler wrapping Axios to keep the API object DRY
async function request(config) {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `API request failed with status: ${error.response?.status}`);
  }
}

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '')
  }
};

// Frontend developer endpoints properly mapped to Axios configurations
export const api = {
  register: (data) => request({ method: 'POST', url: '/api/auth/register/', data }),
  login: (data) => request({ method: 'POST', url: '/api/auth/login/', data }),
  getUser: (id) => request({ method: 'GET', url: `/api/users/${id}/` }),
  updateUser: (id, data) => request({ method: 'PUT', url: `/api/users/${id}/`, data }),
  generateMatch: (data) => request({ method: 'POST', url: '/api/matches/', data }),
  getMatch: (id) => request({ method: 'GET', url: `/api/matches/${id}/` }),
  acceptMatch: (id) => request({ method: 'PUT', url: `/api/matches/${id}/accept/` }),
  rejectMatch: (id) => request({ method: 'PUT', url: `/api/matches/${id}/reject/` }),
  createConversation: (data) => request({ method: 'POST', url: '/api/conversations/', data }),
  getConversation: (id) => request({ method: 'GET', url: `/api/conversations/${id}/` }),
  sendMessage: (data) => request({ method: 'POST', url: '/api/messages/', data }),
  getMessage: (id) => request({ method: 'GET', url: `/api/messages/${id}/` }),
  editMessage: (id, data) => request({ method: 'PUT', url: `/api/messages/${id}/`, data }),
  deleteMessage: (id) => request({ method: 'DELETE', url: `/api/messages/${id}/` }),
  createPayment: (data) => request({ method: 'POST', url: '/api/payments/', data }),
  getPayment: (id) => request({ method: 'GET', url: `/api/payments/${id}/` }),
  subscribeMembership: (data) => request({ method: 'POST', url: '/api/memberships/', data }),
  getMembership: (id) => request({ method: 'GET', url: `/api/memberships/${id}/` }),
  reportProfile: (data) => request({ method: 'POST', url: '/api/reports/profile/', data }),
  reportMessage: (data) => request({ method: 'POST', url: '/api/reports/message/', data }),
  blockUser: (data) => request({ method: 'POST', url: '/api/block/', data }),
};

export default apiClient;