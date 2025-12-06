import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { LogOut, User, FileText, Package, ShoppingCart, History } from 'lucide-react';
import * as hastaApi from '../../api/hastaApi';
import Loading from '../../components/common/Loading';
import HastaSidebar from '../../components/layout/HastaSidebar';

const HastaDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userType, user } = useSelector((state) => state.auth);
  const { sepet } = useSelector((state) => state.hasta);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch user data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile
      const profileData = await hastaApi.getProfile();
      setProfile(profileData);
      
      // Fetch prescriptions
      const prescriptionsData = await hastaApi.getPrescriptions();
      setPrescriptions(prescriptionsData);
      
      // Fetch orders
      const ordersData = await hastaApi.getOrders();
      setOrders(ordersData);
      
    } catch (err) {
      // Handle 404 errors gracefully - use mock data or defaults
      console.error('Error fetching data:', err);
      setError('Veriler yüklenirken bir hata oluştu. Demo verileri gösteriliyor.');
      
      // Set default/mock data to prevent blank screen
      setProfile({
        ad: user?.name || 'Demo Kullanıcı',
        soyad: '',
        tc_no: '12345678901',
        email: user?.email || 'demo@example.com',
        telefon: '555 123 45 67',
        adres: 'Demo Adres, Ankara',
        created_at: new Date().toISOString()
      });
      
      setPrescriptions([
        {
          recete_no: 'RCT2025001',
          tc_no: '12345678901',
          tarih: new Date().toISOString().split('T')[0],
          doktor_adi: 'Dr. Ahmet Yılmaz',
          hastane: 'Ankara Üniversitesi Tıp Fakültesi',
          ilac_listesi: [
            {
              ilac_id: '1',
              barkod: '8699123456789',
              ad: 'Parol 500mg',
              kategori: 'normal',
              miktar: 2,
              kullanim_talimati: 'Günde 2 kez, yemekten sonra alın.',
              fiyat: 25.50,
              etken_madde: 'Parasetamol'
            }
          ],
          toplam_tutar: 51.00
        }
      ]);
      
      setOrders([
        {
          id: '1',
          siparis_no: 'ORD2025001',
          eczane_id: '1',
          eczane_adi: 'Merkez Eczanesi',
          hasta_id: '1',
          hasta_adi: 'Demo Kullanıcı',
          toplam_tutar: 75.50,
          durum: 'teslim_edildi',
          odeme_durumu: 'odendi',
          teslimat_adresi: 'Demo Adres, Ankara',
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          detaylar: [
            {
              ilac_id: '1',
              ilac_adi: 'Parol 500mg',
              barkod: '8699123456789',
              miktar: 2,
              birim_fiyat: 25.50,
              ara_toplam: 51.00
            },
            {
              ilac_id: '2',
              ilac_adi: 'Apranax Fort 550mg',
              barkod: '8699567812345',
              miktar: 1,
              birim_fiyat: 24.50,
              ara_toplam: 24.50
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HastaSidebar />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="px-6 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Hasta Dashboard
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Hoş geldiniz! Hasta paneline giriş yaptınız.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {userType.toUpperCase()}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="px-6 py-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loading />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div 
                          className="bg-white rounded-lg shadow p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate('/hasta/receteler')}
                        >
                          <div className="flex items-center">
                            <div className="rounded-full bg-blue-100 p-3">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-500">Aktif Reçeteler</h3>
                              <p className="text-2xl font-semibold text-gray-900">{prescriptions.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-white rounded-lg shadow p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate('/hasta/siparisler')}
                        >
                          <div className="flex items-center">
                            <div className="rounded-full bg-green-100 p-3">
                              <Package className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-500">Siparişlerim</h3>
                              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-white rounded-lg shadow p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate('/hasta/sepet')}
                        >
                          <div className="flex items-center">
                            <div className="rounded-full bg-yellow-100 p-3">
                              <ShoppingCart className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-500">Sepetteki Ürünler</h3>
                              <p className="text-2xl font-semibold text-gray-900">{sepet.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-white rounded-lg shadow p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate('/hasta/profil')}
                        >
                          <div className="flex items-center">
                            <div className="rounded-full bg-purple-100 p-3">
                              <User className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-500">Profilim</h3>
                              <p className="text-sm font-semibold text-gray-900">
                                Bilgileri Görüntüle
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                      )}
                      
                      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Son Siparişlerim</h3>
                        {orders.length > 0 ? (
                          <div className="overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {orders.slice(0, 3).map((order) => (
                                <li key={order.id} className="py-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        Sipariş No: {order.siparis_no}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-gray-900">
                                        {order.toplam_tutar.toFixed(2)} TL
                                      </p>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        order.durum === 'teslim_edildi' ? 'bg-green-100 text-green-800' :
                                        order.durum === 'iptal_edildi' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {order.durum === 'beklemede' ? 'Beklemede' :
                                         order.durum === 'onaylandi' ? 'Onaylandı' :
                                         order.durum === 'hazirlaniyor' ? 'Hazırlanıyor' :
                                         order.durum === 'yolda' ? 'Yolda' :
                                         order.durum === 'teslim_edildi' ? 'Teslim Edildi' :
                                         order.durum === 'iptal_edildi' ? 'İptal Edildi' : 'Bilinmiyor'}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4">
                              <Button
                                variant="secondary"
                                onClick={() => navigate('/hasta/siparisler')}
                                className="w-full"
                              >
                                Tüm Siparişleri Görüntüle
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <History className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz siparişiniz yok</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              İlk siparişinizi oluşturmak için alışveriş yapmaya başlayın.
                            </p>
                            <div className="mt-6">
                              <Button
                                variant="primary"
                                onClick={() => navigate('/hasta/ilaclar')}
                              >
                                İlaç Ara
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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

export default HastaDashboard;