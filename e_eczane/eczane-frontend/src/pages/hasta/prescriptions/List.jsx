import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import * as hastaApi from '../../../api/hastaApi';
import {
  FileText,
  ArrowLeft,
  Search,
  ShoppingCart,
  Check,
  Building2,
  RefreshCw
} from 'lucide-react';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import toast from 'react-hot-toast';

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reçete sorgulama
  const [queryMode, setQueryMode] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryData, setQueryData] = useState({ tc_no: '', recete_no: '' });
  const [queryResult, setQueryResult] = useState(null);

  // İlaç seçimi
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hastaApi.getPrescriptions();
      setPrescriptions(data || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Reçeteler yüklenirken bir hata oluştu.');

      // Demo data
      setPrescriptions([
        {
          id: '1',
          recete_no: 'RCT2025001',
          tc_no: '12345678901',
          tarih: new Date().toISOString().split('T')[0],
          doktor_adi: 'Dr. Ahmet Yılmaz',
          hastane: 'Ankara Üniversitesi Tıp Fakültesi',
          durum: 'aktif',
          ilac_listesi: [
            {
              ilac_id: '1',
              barkod: '8699123456789',
              ad: 'Parol 500mg Tablet',
              kategori: 'normal',
              miktar: 2,
              kullanim_talimati: 'Günde 3 kez 1 tablet, yemeklerden sonra',
              fiyat: 25.50,
              etken_madde: 'Parasetamol'
            },
            {
              ilac_id: '2',
              barkod: '8699987654321',
              ad: 'Augmentin 1000mg',
              kategori: 'kirmizi_recete',
              miktar: 1,
              kullanim_talimati: 'Günde 2 kez 1 tablet, 7 gün',
              fiyat: 85.00,
              etken_madde: 'Amoksisilin'
            }
          ],
          toplam_tutar: 136.00
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryPrescription = async () => {
    if (!queryData.tc_no && !queryData.recete_no) {
      toast.error('Lütfen TC No veya Reçete No girin');
      return;
    }

    setQueryLoading(true);
    try {
      const result = await hastaApi.queryPrescription(queryData);
      setQueryResult(result);
      setSelectedMedicines([]);
      toast.success('Reçete bulundu!');
    } catch (err) {
      console.error('Error querying prescription:', err);

      // Demo result
      setQueryResult({
        recete_no: queryData.recete_no || 'RCT2025003',
        tc_no: queryData.tc_no || '12345678901',
        tarih: new Date().toISOString().split('T')[0],
        doktor_adi: 'Dr. Mehmet Öz',
        hastane: 'Hacettepe Üniversitesi Hastanesi',
        durum: 'aktif',
        ilac_listesi: [
          {
            ilac_id: '3',
            barkod: '8699555555555',
            ad: 'Ventolin İnhaler',
            kategori: 'normal',
            miktar: 1,
            kullanim_talimati: 'Gerektiğinde 1-2 puf',
            fiyat: 45.75,
            etken_madde: 'Salbutamol'
          },
          {
            ilac_id: '4',
            barkod: '8699222222222',
            ad: 'Nexium 40mg',
            kategori: 'normal',
            miktar: 1,
            kullanim_talimati: 'Günde 1 kez, sabah aç karnına',
            fiyat: 68.50,
            etken_madde: 'Esomeprazol'
          }
        ],
        toplam_tutar: 114.25
      });
      toast.success('Demo reçete gösteriliyor');
    } finally {
      setQueryLoading(false);
    }
  };

  const toggleMedicineSelection = (medicine) => {
    setSelectedMedicines(prev => {
      const exists = prev.find(m => m.ilac_id === medicine.ilac_id);
      if (exists) {
        return prev.filter(m => m.ilac_id !== medicine.ilac_id);
      } else {
        return [...prev, medicine];
      }
    });
  };

  const selectAllMedicines = () => {
    if (queryResult) {
      setSelectedMedicines(queryResult.ilac_listesi);
    }
  };

  const proceedToPharmacySelection = () => {
    if (selectedMedicines.length === 0) {
      toast.error('Lütfen en az bir ilaç seçin');
      return;
    }

    // Store selected medicines and prescription in session/state
    sessionStorage.setItem('selectedPrescription', JSON.stringify(queryResult));
    sessionStorage.setItem('selectedMedicines', JSON.stringify(selectedMedicines));

    navigate('/hasta/eczane-sec');
  };

  const addToCart = async (prescription) => {
    try {
      for (const ilac of prescription.ilac_listesi) {
        await hastaApi.addToCart({
          ilac_id: ilac.ilac_id,
          miktar: ilac.miktar,
          recete_id: prescription.id
        });
      }
      toast.success('İlaçlar sepete eklendi!');
      navigate('/hasta/sepet');
    } catch (err) {
      toast.error('Sepete eklenirken hata oluştu');
    }
  };

  const getStatusBadge = (durum) => {
    const badges = {
      aktif: { text: 'Aktif', color: 'bg-green-100 text-green-800' },
      kullanildi: { text: 'Kullanıldı', color: 'bg-gray-100 text-gray-800' },
      iptal: { text: 'İptal', color: 'bg-red-100 text-red-800' }
    };
    return badges[durum] || { text: durum, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HastaSidebar />

      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Header */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Reçetelerim
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Reçetelerinizi görüntüleyin veya yeni reçete sorgulayın
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant={queryMode ? "secondary" : "primary"}
                        onClick={() => {
                          setQueryMode(!queryMode);
                          setQueryResult(null);
                          setSelectedMedicines([]);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        {queryMode ? 'Listeme Dön' : 'Reçete Sorgula'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={fetchPrescriptions}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Query Mode */}
              {queryMode && (
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">E-Reçete Sorgula</h3>
                    <p className="text-sm text-gray-500">TC Kimlik No veya Reçete No ile sorgulayın</p>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TC Kimlik No
                        </label>
                        <input
                          type="text"
                          value={queryData.tc_no}
                          onChange={(e) => setQueryData({ ...queryData, tc_no: e.target.value })}
                          placeholder="11111111111"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          maxLength={11}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reçete No
                        </label>
                        <input
                          type="text"
                          value={queryData.recete_no}
                          onChange={(e) => setQueryData({ ...queryData, recete_no: e.target.value })}
                          placeholder="RCT2025001"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="primary"
                          onClick={handleQueryPrescription}
                          loading={queryLoading}
                          className="w-full"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Sorgula
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Query Result */}
              {queryResult && (
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Reçete: {queryResult.recete_no}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {queryResult.doktor_adi} - {queryResult.hastane}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={selectAllMedicines}
                      className="text-sm"
                    >
                      Tümünü Seç
                    </Button>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {queryResult.ilac_listesi.map((ilac) => {
                        const isSelected = selectedMedicines.find(m => m.ilac_id === ilac.ilac_id);
                        return (
                          <div
                            key={ilac.ilac_id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }`}
                            onClick={() => toggleMedicineSelection(ilac)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                  }`}>
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{ilac.ad}</h4>
                                  <p className="text-sm text-gray-500">{ilac.kullanim_talimati}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">{ilac.fiyat.toFixed(2)} ₺</p>
                                <p className="text-sm text-gray-500">x{ilac.miktar}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedMedicines.length > 0 && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {selectedMedicines.length} ilaç seçildi
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              Toplam: {selectedMedicines.reduce((sum, m) => sum + (m.fiyat * m.miktar), 0).toFixed(2)} ₺
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            onClick={proceedToPharmacySelection}
                            className="flex items-center gap-2"
                          >
                            <Building2 className="w-4 h-4" />
                            Eczane Seç
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prescription List */}
              {!queryMode && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Mevcut Reçetelerim</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {loading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loading />
                      </div>
                    ) : prescriptions.length > 0 ? (
                      prescriptions.map((prescription) => {
                        const status = getStatusBadge(prescription.durum);
                        return (
                          <div key={prescription.id || prescription.recete_no} className="p-6 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center space-x-3">
                                  <h4 className="text-lg font-medium text-gray-900">
                                    {prescription.recete_no}
                                  </h4>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.text}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(prescription.tarih).toLocaleDateString('tr-TR')}
                                </p>
                                {prescription.doktor_adi && (
                                  <p className="text-sm text-gray-500">{prescription.doktor_adi}</p>
                                )}
                                {prescription.hastane && (
                                  <p className="text-sm text-gray-500">{prescription.hastane}</p>
                                )}
                              </div>
                              {prescription.durum === 'aktif' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => addToCart(prescription)}
                                  className="flex items-center gap-2"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Sepete Ekle
                                </Button>
                              )}
                            </div>

                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">İlaçlar:</h5>
                              <div className="space-y-2">
                                {prescription.ilac_listesi.map((ilac, index) => (
                                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                    <div>
                                      <span className="font-medium text-gray-900">{ilac.ad}</span>
                                      <span className="text-gray-500 text-sm ml-2">x{ilac.miktar}</span>
                                    </div>
                                    <span className="text-gray-700">{ilac.fiyat.toFixed(2)} ₺</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <span className="text-lg font-bold text-gray-900">
                                Toplam: {prescription.toplam_tutar?.toFixed(2) || '0.00'} ₺
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz reçeteniz yok</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Yeni reçete sorgulamak için yukarıdaki butonu kullanın.
                        </p>
                        <div className="mt-6">
                          <Button
                            variant="primary"
                            onClick={() => setQueryMode(true)}
                          >
                            <Search className="w-4 h-4 mr-2" />
                            Reçete Sorgula
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrescriptionList;