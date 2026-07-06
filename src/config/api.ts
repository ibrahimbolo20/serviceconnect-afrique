export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  
  // Providers
  PROVIDERS: `${API_BASE_URL}/api/providers`,
  
  // Bookings
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  MY_BOOKINGS: `${API_BASE_URL}/api/bookings/me`,
};

export default API_ENDPOINTS;