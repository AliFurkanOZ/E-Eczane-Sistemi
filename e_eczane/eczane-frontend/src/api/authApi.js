import axios from './axios';

export const authApi = {
  // Login
  login: async (identifier, password, userType) => {
    const response = await axios.post('/api/auth/login', {
      identifier,
      password,
      user_type: userType,
    });
    return response.data;
  },

  // Register Hasta
  registerHasta: async (data) => {
    const response = await axios.post('/api/auth/register/hasta', data);
    return response.data;
  },

  // Register Eczane
  registerEczane: async (data) => {
    const response = await axios.post('/api/auth/register/eczane', data);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axios.post('/api/auth/change-password', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  },
};
