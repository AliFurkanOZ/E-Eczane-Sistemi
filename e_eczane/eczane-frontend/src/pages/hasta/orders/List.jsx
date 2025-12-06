import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import * as hastaApi from '../../../api/hastaApi';
import { History, ArrowLeft } from 'lucide-react';
import HastaSidebar from '../../../components/layout/HastaSidebar';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hastaApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Siparişler yüklenirken bir hata oluştu. Demo verileri gösteriliyor.');
      
      // Set mock data to prevent blank screen
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
        },
        {
          id: '2',
          siparis_no: 'ORD2025002',
          eczane_id: '2',
          eczane_adi: 'Şehir Eczanesi',
          hasta_id: '1',
          hasta_adi: 'Demo Kullanıcı',
          toplam_tutar: 42.90,
          durum: 'hazirlaniyor',
          odeme_durumu: 'odendi',
          teslimat_adresi: 'Demo Adres, Ankara',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          detaylar: [
            {
              ilac_id: '3',
              ilac_adi: 'Minoset 20mg',
              barkod: '8699987654321',
              miktar: 3,
              birim_fiyat: 18.90,
              ara_toplam: 56.70
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
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
                        Sipariş Geçmişim
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Önceki siparişlerinizi görüntüleyin
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
                  ) : error ? (
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
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <div key={order.id} className="p-6 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">Sipariş No: {order.siparis_no}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Tarih: {new Date(order.created_at).toLocaleDateString('tr-TR')} {new Date(order.created_at).toLocaleTimeString('tr-TR')}
                                </p>
                                <p className="text-sm text-gray-500">Eczane: {order.eczane_adi}</p>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                            
                            <div className="mt-4">
                              <h5 className="text-md font-medium text-gray-700 mb-2">Sipariş Kalemleri:</h5>
                              <ul className="divide-y divide-gray-200">
                                {order.detaylar.map((item, index) => (
                                  <li key={index} className="py-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium">{item.ilac_adi}</span>
                                      <span className="text-gray-500">{item.miktar} x {item.birim_fiyat.toFixed(2)} TL</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <span className="text-lg font-bold text-gray-900">
                                Toplam: {order.toplam_tutar.toFixed(2)} TL
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <History className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz siparişiniz yok</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            İlk siparişinizi oluşturduğunuzda burada görüntülenecektir.
                          </p>
                        </div>
                      )}
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

export default OrderList;