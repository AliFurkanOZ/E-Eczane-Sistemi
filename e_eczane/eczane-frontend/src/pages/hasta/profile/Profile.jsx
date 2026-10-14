import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save, Mail, Phone, MapPin, CreditCard, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import * as hastaApi from '../../../api/hastaApi';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
      setError('Profil bilgileri yüklenirken bir hata oluştu.');
      // Set basic data from auth state
      setFormData({
        ad: user?.name?.split(' ')[0] || '',
        soyad: user?.name?.split(' ').slice(1).join(' ') || '',
        adres: '',
        telefon: '',
        email: user?.email || ''
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

    try {
      const updateData = {
        ad: formData.ad,
        soyad: formData.soyad,
        adres: formData.adres,
        telefon: formData.telefon
      };

      if (formData.email !== profile?.email) {
        updateData.email = formData.email;
      }

      await hastaApi.updateProfile(updateData);
      toast.success('Profil bilgileriniz başarıyla güncellendi');
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout sidebar={<HastaSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Profilim
          </h1>
          <p className="text-slate-500 mt-2">
            Kişisel bilgilerinizi görüntüleyin ve güncelleyin.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchProfile}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/hasta/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody className="py-16">
            <div className="flex justify-center">
              <Loading />
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardBody className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {formData.ad} {formData.soyad}
              </h3>
              <p className="text-slate-500 text-sm mt-1">{formData.email}</p>

              {profile?.tc_no && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">TC: {profile.tc_no}</span>
                  </div>
                </div>
              )}

              {profile?.created_at && (
                <p className="text-xs text-slate-400 mt-4">
                  Üyelik: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                </p>
              )}
            </CardBody>
          </Card>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-slate-800">Profil Bilgileri</h3>
                <p className="text-sm text-slate-500">Kişisel bilgilerinizi güncelleyin</p>
              </CardHeader>
              <CardBody>
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ad" className="block text-sm font-medium text-slate-700 mb-2">
                        Ad
                      </label>
                      <input
                        type="text"
                        name="ad"
                        id="ad"
                        value={formData.ad}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="soyad" className="block text-sm font-medium text-slate-700 mb-2">
                        Soyad
                      </label>
                      <input
                        type="text"
                        name="soyad"
                        id="soyad"
                        value={formData.soyad}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="telefon" className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="telefon"
                        id="telefon"
                        value={formData.telefon}
                        onChange={handleChange}
                        placeholder="555 123 45 67"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="adres" className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Adres
                    </label>
                    <textarea
                      id="adres"
                      name="adres"
                      rows={3}
                      value={formData.adres}
                      onChange={handleChange}
                      placeholder="Adresinizi girin..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                    />
                  </div>

                  {profile?.tc_no && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <CreditCard className="w-4 h-4 inline mr-1" />
                        TC Kimlik No
                      </label>
                      <input
                        type="text"
                        value={profile.tc_no}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        TC Kimlik Numarası güvenlik nedeniyle değiştirilemez.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Profile;