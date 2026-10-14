import api from './axios';

/**
 * DynamoDB (NoSQL) Admin API endpoints
 */

// Cosmos DB Health Check
export const getCosmosHealth = async () => {
  const response = await api.get('/api/cosmos/health');
  return response.data;
};

// Cosmos DB İstatistikleri
export const getCosmosStats = async () => {
  const response = await api.get('/api/cosmos/stats');
  return response.data;
};

// Tüm bildirimleri getir (admin)
export const getAllBildirimler = async (params = {}) => {
  const response = await api.get('/api/cosmos/bildirimler', { params });
  return response.data;
};

// Kullanıcı bildirimleri
export const getUserBildirimler = async (userId) => {
  const response = await api.get(`/api/cosmos/bildirimler/kullanici/${userId}`);
  return response.data;
};

// Sipariş geçmişi
export const getSiparisGecmisi = async (siparisId) => {
  const response = await api.get(`/api/cosmos/siparis-gecmisi/${siparisId}`);
  return response.data;
};

// Sistem logları
export const getSistemLoglari = async (params = {}) => {
  const response = await api.get('/api/cosmos/loglar', { params });
  return response.data;
};

// PostgreSQL vs DynamoDB Benchmark
export const runBenchmark = async () => {
  const response = await api.get('/api/cosmos/benchmark');
  return response.data;
};

export default {
  getCosmosHealth,
  getCosmosStats,
  getAllBildirimler,
  getUserBildirimler,
  getSiparisGecmisi,
  getSistemLoglari,
  runBenchmark
};
