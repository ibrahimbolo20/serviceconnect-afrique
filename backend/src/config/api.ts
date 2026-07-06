// src/config/api.ts
const API_BASE_URL = 'http://localhost:5000';

export const API = {
  baseURL: API_BASE_URL,
  
  // Auth
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  
  // Providers
  providers: `${API_BASE_URL}/api/providers`,
  
  // Bookings
  bookings: `${API_BASE_URL}/api/bookings`,
};

export default API;