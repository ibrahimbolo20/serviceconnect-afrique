import axios from 'axios';
import API_ENDPOINTS from '../config/api';

export const providerService = {
  // Récupérer tous les prestataires
  getAll: async () => {
    const response = await axios.get(API_ENDPOINTS.PROVIDERS);
    return response.data;
  },

  // Récupérer un prestataire par ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_ENDPOINTS.PROVIDERS}/${id}`);
    return response.data;
  }
};