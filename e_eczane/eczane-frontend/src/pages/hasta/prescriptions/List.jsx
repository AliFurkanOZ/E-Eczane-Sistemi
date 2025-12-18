import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// useDispatch kaldırıldı - addToSepet artık kullanılmıyor
import * as hastaApi from '../../../api/hastaApi';
import {
  FileText,
  Search,

  Check,
  Building2,
  RefreshCw,
  Calendar,
  Package,
  ArrowLeft,
  Pill
} from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';
// addToSepet import'u kaldırıldı - Sepete Ekle butonu artık kullanılmıyor

const PrescriptionList = () => {
  const navigate = useNavigate();
  // dispatch kaldırıldı - addToSepet artık kullanılmıyor
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Reçete sorgulama
  const [queryMode, setQueryMode] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryData, setQueryData] = useState({ tc_no: '', recete_no: '' });
  const [queryResult, setQueryResult] = useState(null);

  // İlaç seçimi
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await hastaApi.getProfile();
      setUserProfile(profile);
      // TC'yi otomatik doldur
      if (profile?.tc_no) {
        setQueryData(prev => ({ ...prev, tc_no: profile.tc_no }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hastaApi.getPrescriptions();
      if (Array.isArray(data)) {
        setPrescriptions(data);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Reçeteler yüklenirken bir hata oluştu.');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryPrescription = async () => {
    if (!queryData.recete_no) {
      toast.error('Lütfen Reçete No girin');
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
      toast.error('Reçete bulunamadı veya sorgulanamadı');
      setQueryResult(null);
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

  // addToCart fonksiyonu kaldırıldı - reçete takibi için Reçete Sorgula akışı kullanılmalı

  const getStatusBadge = (durum) => {
    const badges = {
      aktif: { text: 'Aktif', variant: 'success' },
      kullanildi: { text: 'Kullanıldı', variant: 'secondary' },
      iptal: { text: 'İptal', variant: 'danger' }
    };
    return badges[durum] || { text: durum, variant: 'secondary' };
  };

  return (
    <MainLayout sidebar={<HastaSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Reçetelerim
          </h1>
          <p className="text-slate-500 mt-2">
            Reçetelerinizi görüntüleyin ve sipariş oluşturun.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Button
            variant={queryMode ? "secondary" : "primary"}
            onClick={() => {
              setQueryMode(!queryMode);
              setQueryResult(null);
              setSelectedMedicines([]);
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            {queryMode ? 'Listeme Dön' : 'Reçete Sorgula'}
          </Button>
          <Button
            variant="secondary"
            onClick={fetchPrescriptions}
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

      {/* Query Mode */}
      {queryMode && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-800">E-Reçete Sorgula</h3>
            <p className="text-sm text-slate-500">Reçete numarası ile sorgulayın</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  value={queryData.tc_no}
                  readOnly
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">TC otomatik dolduruldu</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reçete No
                </label>
                <input
                  type="text"
                  value={queryData.recete_no}
                  onChange={(e) => setQueryData({ ...queryData, recete_no: e.target.value })}
                  placeholder="RCT2025001"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handleQueryPrescription}
                  disabled={queryLoading}
                  className="w-full"
                >
                  {queryLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Sorgula
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Query Result */}
      {queryResult && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">
                  Reçete: {queryResult.recete_no}
                </h3>
                {/* Reçete durumu badge */}
                <Badge variant={getStatusBadge(queryResult.durum || 'aktif').variant}>
                  {getStatusBadge(queryResult.durum || 'aktif').text}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                {queryResult.doktor_adi} - {queryResult.hastane}
              </p>
              {/* Kalan gün bilgisi */}
              {queryResult.durum === 'aktif' && queryResult.kalan_gun !== undefined && (
                <p className={`text-xs mt-1 ${queryResult.kalan_gun === 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {queryResult.kalan_gun === 0
                    ? '⚠️ Son gün! Bugün geçerli.'
                    : queryResult.kalan_gun === 1
                      ? '⏰ 1 gün kaldı'
                      : `📅 ${queryResult.kalan_gun} gün geçerli`}
                </p>
              )}
              {/* Kullanılamaz uyarısı */}
              {queryResult.kullanilabilir === false && (
                <p className="text-sm text-red-500 font-medium mt-1">
                  {queryResult.durum === 'kullanildi'
                    ? '❌ Bu reçete daha önce kullanılmış.'
                    : '❌ Bu reçetenin süresi dolmuş.'}
                </p>
              )}
            </div>
            {queryResult.kullanilabilir !== false && (
              <Button
                variant="secondary"
                size="sm"
                onClick={selectAllMedicines}
              >
                Tümünü Seç
              </Button>
            )}
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {queryResult.ilac_listesi?.map((ilac) => {
                const isSelected = selectedMedicines.find(m => m.ilac_id === ilac.ilac_id);
                const canSelect = queryResult.kullanilabilir !== false;
                return (
                  <div
                    key={ilac.ilac_id}
                    className={`p-4 rounded-xl border-2 transition-all ${!canSelect
                      ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                        ? 'border-primary-500 bg-primary-50 cursor-pointer'
                        : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    onClick={() => canSelect && toggleMedicineSelection(ilac)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {canSelect && (
                          <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-slate-300'
                            }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-800">{ilac.ad}</h4>
                          <p className="text-sm text-slate-500">{ilac.kullanim_talimati}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{parseFloat(ilac.fiyat || 0).toFixed(2)} ₺</p>
                        <p className="text-sm text-slate-500">x{ilac.miktar}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Only show selection summary and Eczane Seç button for usable prescriptions */}
            {queryResult.kullanilabilir !== false && selectedMedicines.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">
                      {selectedMedicines.length} ilaç seçildi
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      Toplam: {selectedMedicines.reduce((sum, m) => sum + (m.fiyat * m.miktar), 0).toFixed(2)} ₺
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={proceedToPharmacySelection}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Eczane Seç
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Prescription List */}
      {!queryMode && (
        <>
          {loading ? (
            <Card>
              <CardBody className="py-16">
                <div className="flex justify-center">
                  <Loading />
                </div>
              </CardBody>
            </Card>
          ) : error ? (
            <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <p className="text-yellow-800">{error}</p>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => {
                const status = getStatusBadge(prescription.durum);
                return (
                  <Card key={prescription.id || prescription.recete_no} hover>
                    <CardBody>
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-xl">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">
                              {prescription.recete_no}
                            </h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {prescription.tarih ? new Date(prescription.tarih).toLocaleDateString('tr-TR') : '-'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-3">
                          <Badge variant={status.variant}>{status.text}</Badge>
                          {/* Sepete Ekle butonu kaldırıldı - reçete takibi için Reçete Sorgula kullanılmalı */}
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        {prescription.doktor_adi && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Doktor:</span> {prescription.doktor_adi}
                          </p>
                        )}
                        {prescription.hastane && (
                          <p className="text-sm text-slate-500 mt-1">
                            <span className="font-medium">Hastane:</span> {prescription.hastane}
                          </p>
                        )}
                      </div>

                      {/* Medicines */}
                      {prescription.ilac_listesi && prescription.ilac_listesi.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">İlaçlar:</h4>
                          <div className="grid gap-2">
                            {prescription.ilac_listesi.map((ilac, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-2 px-3 bg-white border border-slate-100 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <Pill className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium text-slate-800">{ilac.ad}</span>
                                  <span className="text-slate-500 text-sm">x{ilac.miktar}</span>
                                </div>
                                <span className="font-medium text-slate-700">
                                  {parseFloat(ilac.fiyat || 0).toFixed(2)} ₺
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      {prescription.toplam_tutar && (
                        <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                          <div className="text-right">
                            <span className="text-sm text-slate-500">Toplam Tutar</span>
                            <p className="text-xl font-bold text-primary-600">
                              {parseFloat(prescription.toplam_tutar || 0).toFixed(2)} ₺
                            </p>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardBody className="py-16">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Henüz Reçeteniz Yok
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Yeni reçete sorgulamak için yukarıdaki butonu kullanabilirsiniz.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setQueryMode(true)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Reçete Sorgula
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default PrescriptionList;