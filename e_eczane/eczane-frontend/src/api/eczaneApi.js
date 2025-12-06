import api from './axios';

/**
 * Eczane (Pharmacy) API endpoints
 */

// Get eczane profile
export const getProfile = async () => {
  const response = await api.get('/api/eczane/profil');
  return response.data;
};

// Update eczane profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/eczane/profil', profileData);
  return response.data;
};

// Get stock
export const getStock = async () => {
  const response = await api.get('/api/eczane/stok');
  return response.data;
};

// Add stock
export const addStock = async (stockData) => {
  const response = await api.post('/api/eczane/stok/ekle', stockData);
  return response.data;
};

// Update stock
export const updateStock = async (stockId, stockData) => {
  const response = await api.put(`/api/eczane/stok/${stockId}`, stockData);
  return response.data;
};

// Delete stock
export const deleteStock = async (stockId) => {
  const response = await api.delete(`/api/eczane/stok/${stockId}`);
  return response.data;
};

// Get low stock items
export const getLowStock = async () => {
  const response = await api.get('/api/eczane/stok/dusuk');
  return response.data;
};

// Get pending orders
export const getPendingOrders = async () => {
  const response = await api.get('/api/eczane/siparisler/bekleyenler');
  return response.data;
};

// Get all orders
export const getOrders = async (params) => {
  const response = await api.get('/api/eczane/siparisler', { params });
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/api/eczane/siparisler/${orderId}`);
  return response.data;
};

// Approve order
export const approveOrder = async (orderId) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/onayla`);
  return response.data;
};

// Reject order
export const rejectOrder = async (orderId, reason) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/reddet`, { red_nedeni: reason });
  return response.data;
};

// Mark as preparing
export const markAsPreparing = async (orderId) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/hazirlaniyor`);
  return response.data;
};

// Mark as ready for delivery
export const markAsReadyForDelivery = async (orderId) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/yolda`);
  return response.data;
};

// Mark as delivered
export const markAsDelivered = async (orderId) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/teslim-edildi`);
  return response.data;
};

// Quick approve order
export const quickApproveOrder = async (orderId) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/hizli-onayla`);
  return response.data;
};

// Add product (non-prescription)
export const addProduct = async (productData) => {
  const response = await api.post('/api/eczane/urunler/ekle', productData);
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  getStock,
  addStock,
  updateStock,
  deleteStock,
  getLowStock,
  getPendingOrders,
  getOrders,
  getOrderDetails,
  approveOrder,
  rejectOrder,
  markAsPreparing,
  markAsReadyForDelivery,
  markAsDelivered,
  quickApproveOrder,
  addProduct,
};
