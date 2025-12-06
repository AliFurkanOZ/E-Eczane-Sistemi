import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import * as hastaApi from '../../../api/hastaApi';
import { User, ArrowLeft, Save } from 'lucide-react';
import HastaSidebar from '../../../components/layout/HastaSidebar';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    adres: '',
    telefon: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hastaApi.getProfile();
      setProfile(data);
      setFormData({
        ad: data.ad || '',
        soyad: data.soyad || '',
        adres: data.adres || '',
        telefon: data.telefon || '',
        email: data.email || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Profil bilgileri yüklenirken bir hata oluştu. Demo verileri gösteriliyor.');
      
      // Set mock data to prevent blank screen
      const mockProfile = {
        ad: user?.name || 'Demo Kullanıcı',
        soyad: '',
        tc_no: '12345678901',
        email: user?.email || 'demo@example.com',
        telefon: '555 123 45 67',
        adres: 'Demo Adres, Ankara',
        created_at: new Date().toISOString()
      };
      
      setProfile(mockProfile);
      setFormData({
        ad: mockProfile.ad,
        soyad: mockProfile.soyad,
        adres: mockProfile.adres,
        telefon: mockProfile.telefon,
        email: mockProfile.email
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    
    try {
      const updateData = {
        ad: formData.ad,
        soyad: formData.soyad,
        adres: formData.adres,
        telefon: formData.telefon
      };
      
      // Only include email if it's different (as it might not be updatable)
      if (formData.email !== profile.email) {
        updateData.email = formData.email;
      }
      
      await hastaApi.updateProfile(updateData);
      setSuccess(true);
      
      // Refresh profile data
      fetchProfile();
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu: ' + err.message);
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HastaSidebar />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Profilim
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Kişisel bilgilerinizi güncelleyin
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/hasta/dashboard')}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </div>
                </div>

                <div className="px-6 py-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loading />
                    </div>
                  ) : error && !success ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Uyarı</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Başarılı</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Profil bilgileriniz başarıyla güncellendi.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {profile && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="ad" className="block text-sm font-medium text-gray-700">
                            Ad
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="ad"
                              id="ad"
                              value={formData.ad}
                              onChange={handleChange}
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="soyad" className="block text-sm font-medium text-gray-700">
                            Soyad
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="soyad"
                              id="soyad"
                              value={formData.soyad}
                              onChange={handleChange}
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
                            Telefon
                          </label>
                          <div className="mt-1">
                            <input
                              type="tel"
                              name="telefon"
                              id="telefon"
                              value={formData.telefon}
                              onChange={handleChange}
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="adres" className="block text-sm font-medium text-gray-700">
                            Adres
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="adres"
                              name="adres"
                              rows={3}
                              value={formData.adres}
                              onChange={handleChange}
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="tc_no" className="block text-sm font-medium text-gray-700">
                            TC Kimlik No
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="tc_no"
                              id="tc_no"
                              value={profile.tc_no || ''}
                              readOnly
                              className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                              TC Kimlik Numarası güvenlik nedeniyle değiştirilemez.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={saving}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;