import api from './axios';

/**
 * Eczane (Pharmacy) API endpoints
 * Backend'deki router/eczane.py ile uyumlu
 */

// ==================== PROFİL ====================

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

// ==================== STOK YÖNETİMİ ====================

// Get all stock
export const getStock = async () => {
  const response = await api.get('/api/eczane/stoklar');
  return response.data;
};

// Get low stock alerts
export const getStockAlerts = async () => {
  const response = await api.get('/api/eczane/stoklar/uyarilar');
  return response.data;
};

// Add stock
export const addStock = async (stockData) => {
  const response = await api.post('/api/eczane/stoklar', stockData);
  return response.data;
};

// Update stock
export const updateStock = async (stockId, stockData) => {
  const response = await api.put(`/api/eczane/stoklar/${stockId}`, stockData);
  return response.data;
};

// Delete stock
export const deleteStock = async (stockId) => {
  const response = await api.delete(`/api/eczane/stoklar/${stockId}`);
  return response.data;
};

// Add non-prescription product (creates ilac + stok)
export const addProduct = async (productData) => {
  const response = await api.post('/api/eczane/urun-ekle', productData);
  return response.data;
};

// ==================== SİPARİŞ YÖNETİMİ ====================

// Get all orders
export const getOrders = async (params = {}) => {
  const response = await api.get('/api/eczane/siparisler', { params });
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/api/eczane/siparisler/${orderId}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus, description = '') => {
  const response = await api.put(`/api/eczane/siparisler/${orderId}/durum`, {
    yeni_durum: newStatus,
    aciklama: description
  });
  return response.data;
};

// Approve order (shortcut to set status to "hazirlaniyor")
export const approveOrder = async (orderId) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/onayla`);
  return response.data;
};

// Cancel/reject order
export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/api/eczane/siparisler/${orderId}/iptal`, {
    iptal_nedeni: reason
  });
  return response.data;
};

// ==================== HELPER FUNCTIONS ====================

// Get pending orders (filter by status)
export const getPendingOrders = async () => {
  const response = await api.get('/api/eczane/siparisler', {
    params: { durum: 'beklemede' }
  });
  return response.data;
};

// Get preparing orders
export const getPreparingOrders = async () => {
  const response = await api.get('/api/eczane/siparisler', {
    params: { durum: 'hazirlaniyor' }
  });
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  getStock,
  getStockAlerts,
  addStock,
  updateStock,
  deleteStock,
  addProduct,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  approveOrder,
  cancelOrder,
  getPendingOrders,
  getPreparingOrders,
};
