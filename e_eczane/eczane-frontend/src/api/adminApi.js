import api from './axios';

/**
 * Admin API endpoints
 */

// Get admin profile
export const getProfile = async () => {
  const response = await api.get('/api/admin/profil');
  return response.data;
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
};

// Get order statistics
export const getOrderStats = async () => {
  const response = await api.get('/api/admin/dashboard/siparis-stats');
  return response.data;
};

// Get pending pharmacies
export const getPendingPharmacies = async () => {
  const response = await api.get('/api/admin/eczaneler/bekleyenler');
  return response.data;
};

// Get all pharmacies
export const getAllPharmacies = async () => {
  const response = await api.get('/api/admin/eczaneler');
  return response.data;
};

// Approve pharmacy
export const approvePharmacy = async (eczaneId, data) => {
  const response = await api.post(`/api/admin/eczaneler/${eczaneId}/onayla`, data);
  return response.data;
};

// Reject pharmacy
export const rejectPharmacy = async (eczaneId, data) => {
  const response = await api.post(`/api/admin/eczaneler/${eczaneId}/reddet`, data);
  return response.data;
};

// Update pharmacy status
export const updatePharmacyStatus = async (eczaneId, data) => {
  const response = await api.put(`/api/admin/eczaneler/${eczaneId}/durum`, data);
  return response.data;
};

// Get all patients
export const getAllPatients = async () => {
  const response = await api.get('/api/admin/hastalar');
  return response.data;
};

// Update patient status
export const updatePatientStatus = async (hastaId, data) => {
  const response = await api.put(`/api/admin/hastalar/${hastaId}/durum`, data);
  return response.data;
};

// Get all orders
export const getAllOrders = async (params) => {
  const response = await api.get('/api/admin/siparisler', { params });
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/api/admin/siparisler/${orderId}`);
  return response.data;
};

// Get all doctors
export const getAllDoctors = async (params) => {
  const response = await api.get('/api/admin/doktorlar', { params });
  return response.data;
};

// Create doctor
export const createDoctor = async (data) => {
  const response = await api.post('/api/admin/doktorlar', data);
  return response.data;
};

// Get doctor details
export const getDoctorDetails = async (doktorId) => {
  const response = await api.get(`/api/admin/doktorlar/${doktorId}`);
  return response.data;
};

// Update doctor
export const updateDoctor = async (doktorId, data) => {
  const response = await api.put(`/api/admin/doktorlar/${doktorId}`, data);
  return response.data;
};

// Update doctor status
export const updateDoctorStatus = async (doktorId, data) => {
  const response = await api.put(`/api/admin/doktorlar/${doktorId}/durum`, data);
  return response.data;
};

export default {
  getProfile,
  getDashboardStats,
  getOrderStats,
  getPendingPharmacies,
  getAllPharmacies,
  approvePharmacy,
  rejectPharmacy,
  updatePharmacyStatus,
  getAllPatients,
  updatePatientStatus,
  getAllOrders,
  getOrderDetails,
  getAllDoctors,
  createDoctor,
  getDoctorDetails,
  updateDoctor,
  updateDoctorStatus,
};
