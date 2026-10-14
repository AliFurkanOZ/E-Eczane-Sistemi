import api from './axios';

/**
 * Doktor API endpoints
 */

// Get doktor profile
export const getProfile = async () => {
    const response = await api.get('/api/doktor/profil');
    return response.data;
};

// Search medicines
export const searchMedicines = async (params) => {
    const response = await api.get('/api/doktor/ilac/ara', { params });
    return response.data;
};

// Create prescription
export const createPrescription = async (prescriptionData) => {
    const response = await api.post('/api/doktor/recete/yaz', prescriptionData);
    return response.data;
};

// Get my prescriptions
export const getMyPrescriptions = async (params) => {
    const response = await api.get('/api/doktor/recetelerim', { params });
    return response.data;
};

// Register doktor
export const registerDoktor = async (doktorData) => {
    const response = await api.post('/api/auth/register/doktor', doktorData);
    return response.data;
};

export default {
    getProfile,
    searchMedicines,
    createPrescription,
    getMyPrescriptions,
    registerDoktor
};
