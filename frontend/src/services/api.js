import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const buildingAPI = {
  fetchBuildings: async () => {
    const response = await api.get('/buildings');
    return response.data;
  },

  processQuery: async (query, buildings) => {
    const response = await api.post('/query', {
      query,
      buildings
    });
    return response.data;
  }
};

export const userAPI = {
  createUser: async (username) => {
    const response = await api.post('/users', { username });
    return response.data;
  },

  saveProject: async (userId, name, filters) => {
    const response = await api.post('/projects', {
      user_id: userId,
      name,
      filters
    });
    return response.data;
  },

  getUserProjects: async (userId) => {
    const response = await api.get(`/projects/${userId}`);
    return response.data;
  }
};

export default api;