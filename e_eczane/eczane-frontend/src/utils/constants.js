/**
 * Application Constants
 */

// Environment Variables
export const API_URL = import.meta.env.VITE_API_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;

// User Types
export const USER_TYPES = {
  HASTA: 'hasta',
  ECZANE: 'eczane',
  ADMIN: 'admin',
};

// Order Status
export const SIPARIS_DURUM = {
  BEKLEMEDE: 'beklemede',
  ONAYLANDI: 'onaylandi',
  HAZIRLANIYOR: 'hazirlaniyor',
  YOLDA: 'yolda',
  TESLIM_EDILDI: 'teslim_edildi',
  IPTAL_EDILDI: 'iptal_edildi',
};

// Order Status Labels (Turkish)
export const SIPARIS_DURUM_LABELS = {
  [SIPARIS_DURUM.BEKLEMEDE]: 'Beklemede',
  [SIPARIS_DURUM.ONAYLANDI]: 'Onaylandı',
  [SIPARIS_DURUM.HAZIRLANIYOR]: 'Hazırlanıyor',
  [SIPARIS_DURUM.YOLDA]: 'Yolda',
  [SIPARIS_DURUM.TESLIM_EDILDI]: 'Teslim Edildi',
  [SIPARIS_DURUM.IPTAL_EDILDI]: 'İptal Edildi',
};

// Order Status Badge Colors
export const SIPARIS_DURUM_COLORS = {
  [SIPARIS_DURUM.BEKLEMEDE]: 'badge-warning',
  [SIPARIS_DURUM.ONAYLANDI]: 'badge-info',
  [SIPARIS_DURUM.HAZIRLANIYOR]: 'badge-info',
  [SIPARIS_DURUM.YOLDA]: 'badge-info',
  [SIPARIS_DURUM.TESLIM_EDILDI]: 'badge-success',
  [SIPARIS_DURUM.IPTAL_EDILDI]: 'badge-danger',
};

// Legacy exports for backward compatibility
export const ORDER_STATUS = SIPARIS_DURUM;
export const ORDER_STATUS_LABELS = SIPARIS_DURUM_LABELS;

// Payment Status
export const PAYMENT_STATUS = {
  BEKLEMEDE: 'BEKLEMEDE',
  TAMAMLANDI: 'TAMAMLANDI',
  BASARISIZ: 'BASARISIZ',
  IADE_EDILDI: 'IADE_EDILDI',
};

// Pharmacy Approval Status
export const APPROVAL_STATUS = {
  BEKLEMEDE: 'BEKLEMEDE',
  ONAYLANDI: 'ONAYLANDI',
  REDDEDILDI: 'REDDEDILDI',
};

// Pharmacy Approval Status Labels
export const APPROVAL_STATUS_LABELS = {
  BEKLEMEDE: 'Onay Bekliyor',
  ONAYLANDI: 'Onaylandı',
  REDDEDILDI: 'Reddedildi',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SIPARIS: 'SIPARIS',
  SISTEM: 'SISTEM',
  TANITIM: 'TANITIM',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  USER_TYPE: 'userType',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER_HASTA: '/register/hasta',
  REGISTER_ECZANE: '/register/eczane',
  
  // Hasta routes
  HASTA_DASHBOARD: '/hasta/dashboard',
  HASTA_PROFILE: '/hasta/profil',
  HASTA_MEDICINES: '/hasta/ilaclar',
  HASTA_PRESCRIPTIONS: '/hasta/receteler',
  HASTA_CART: '/hasta/sepet',
  HASTA_ORDERS: '/hasta/siparisler',
  
  // Eczane routes
  ECZANE_DASHBOARD: '/eczane/dashboard',
  ECZANE_PROFILE: '/eczane/profil',
  ECZANE_STOCK: '/eczane/stok',
  ECZANE_ORDERS: '/eczane/siparisler',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PHARMACIES: '/admin/eczaneler',
  ADMIN_PATIENTS: '/admin/hastalar',
  ADMIN_ORDERS: '/admin/siparisler',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
};

export default {
  API_URL,
  APP_NAME,
  USER_TYPES,
  SIPARIS_DURUM,
  SIPARIS_DURUM_LABELS,
  SIPARIS_DURUM_COLORS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS,
  APPROVAL_STATUS,
  APPROVAL_STATUS_LABELS,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  ROUTES,
  PAGINATION,
  FILE_UPLOAD,
};
