import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import * as hastaApi from '../../../api/hastaApi';
import { FileText, ArrowLeft } from 'lucide-react';
import HastaSidebar from '../../../components/layout/HastaSidebar';

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hastaApi.getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Reçeteler yüklenirken bir hata oluştu. Demo verileri gösteriliyor.');
      
      // Set mock data to prevent blank screen
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
        },
        {
          recete_no: 'RCT2025002',
          tc_no: '12345678901',
          tarih: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          doktor_adi: 'Dr. Mehmet Demir',
          hastane: 'Hacettepe Üniversitesi Tıp Fakültesi',
          ilac_listesi: [
            {
              ilac_id: '2',
              barkod: '8699567812345',
              ad: 'Apranax Fort 550mg',
              kategori: 'normal',
              miktar: 1,
              kullanim_talimati: 'Günde 1 kez, yemekten sonra alın.',
              fiyat: 24.50,
              etken_madde: 'Naproxen'
            },
            {
              ilac_id: '3',
              barkod: '8699987654321',
              ad: 'Minoset 20mg',
              kategori: 'normal',
              miktar: 3,
              kullanim_talimati: 'Günde 1 kez, aç karna alın.',
              fiyat: 18.90,
              etken_madde: 'Omeprazol'
            }
          ],
          toplam_tutar: 81.20
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
                        Reçetelerim
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Sisteminizdeki tüm reçeteleri görüntüleyin
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
                      {prescriptions.length > 0 ? (
                        prescriptions.map((prescription) => (
                          <div key={prescription.recete_no} className="p-6 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">Reçete No: {prescription.recete_no}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Tarih: {new Date(prescription.tarih).toLocaleDateString('tr-TR')}
                                </p>
                                {prescription.doktor_adi && (
                                  <p className="text-sm text-gray-500">Doktor: {prescription.doktor_adi}</p>
                                )}
                                {prescription.hastane && (
                                  <p className="text-sm text-gray-500">Hastane: {prescription.hastane}</p>
                                )}
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Aktif
                              </span>
                            </div>
                            
                            <div className="mt-4">
                              <h5 className="text-md font-medium text-gray-700 mb-2">İlaçlar:</h5>
                              <ul className="divide-y divide-gray-200">
                                {prescription.ilac_listesi.map((ilac, index) => (
                                  <li key={index} className="py-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium">{ilac.ad}</span>
                                      <span className="text-gray-500">Miktar: {ilac.miktar}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{ilac.kullanim_talimati}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <span className="text-lg font-bold text-gray-900">
                                Toplam: {prescription.toplam_tutar.toFixed(2)} TL
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz reçeteniz yok</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Sisteme reçete yüklendiğinde burada görüntülenecektir.
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

export default PrescriptionList;