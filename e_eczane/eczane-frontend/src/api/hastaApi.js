import api from './axios';

/**
 * Hasta (Patient) API endpoints
 */

// Get hasta profile
export const getProfile = async () => {
  const response = await api.get('/api/hasta/profil');
  return response.data;
};

// Update hasta profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/hasta/profil', profileData);
  return response.data;
};

// Search medicines
export const searchMedicines = async (params) => {
  const response = await api.get('/api/hasta/ilac/ara', { params });
  return response.data;
};

// Get medicine alternatives
export const getMedicineAlternatives = async (ilacId) => {
  const response = await api.get(`/api/hasta/ilac/${ilacId}/muadiller`);
  return response.data;
};

// Get prescriptions - FIXED: Changed from /receteler to /recetelerim
export const getPrescriptions = async () => {
  const response = await api.get('/api/hasta/recetelerim');
  return response.data;
};

// Upload prescription
export const uploadPrescription = async (formData) => {
  const response = await api.post('/api/hasta/receteler/yukle', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Query prescription by TC and/or recete_no
export const queryPrescription = async (queryData) => {
  const response = await api.post('/api/hasta/recete-sorgula', queryData);
  return response.data;
};

// Get pharmacies that have specific medicines in stock
export const getPharmaciesWithStock = async (ilacIds) => {
  const response = await api.get('/api/hasta/eczaneler', {
    params: { ilac_ids: ilacIds.join(',') }
  });
  return response.data;
};

// Get cart - This will need to be implemented in the backend
export const getCart = async () => {
  // For now, return empty cart since backend endpoints don't exist
  return { items: [], toplam_urun: 0, toplam_tutar: 0 };
};

// Add to cart - This will need to be implemented in the backend
export const addToCart = async (item) => {
  // For now, just return the item since backend endpoints don't exist
  return item;
};

// Update cart item - This will need to be implemented in the backend
export const updateCartItem = async (itemId, quantity) => {
  // For now, just return the updated item since backend endpoints don't exist
  return { itemId, miktar: quantity };
};

// Remove from cart - This will need to be implemented in the backend
export const removeFromCart = async (itemId) => {
  // For now, just return success since backend endpoints don't exist
  return { success: true };
};

// Clear cart - This will need to be implemented in the backend
export const clearCart = async () => {
  // For now, just return success since backend endpoints don't exist
  return { success: true };
};

// Create order
export const createOrder = async (orderData) => {
  const response = await api.post('/api/hasta/siparis/olustur', orderData);
  return response.data;
};

// Get orders - FIXED: Changed from /siparisler to /siparislerim
export const getOrders = async () => {
  const response = await api.get('/api/hasta/siparislerim');
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/api/hasta/siparislerim/${orderId}`);
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await api.post(`/api/hasta/siparislerim/${orderId}/iptal`);
  return response.data;
};

// Get notifications
export const getNotifications = async () => {
  const response = await api.get('/api/hasta/bildirimler');
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/api/hasta/bildirimler/${notificationId}/okundu`);
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  searchMedicines,
  getMedicineAlternatives,
  getPrescriptions,
  uploadPrescription,
  queryPrescription,
  getPharmaciesWithStock,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  getNotifications,
  markNotificationAsRead,
};