import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FilePlus,
    Search,
    Plus,
    Minus,
    Trash2,
    User,
    Pill,
    ArrowLeft,
    Check,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import DoktorSidebar from '../../../components/layout/DoktorSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';
import * as doktorApi from '../../../api/doktorApi';

const CreatePrescription = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: TC gir, 2: İlaç seç, 3: Önizleme
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [tcNo, setTcNo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedMedicines, setSelectedMedicines] = useState([]);

    // Created prescription
    const [createdPrescription, setCreatedPrescription] = useState(null);

    const handleTcSubmit = () => {
        if (tcNo.length !== 11) {
            toast.error('TC Kimlik No 11 haneli olmalıdır');
            return;
        }
        setStep(2);
        toast.success('TC numarası doğrulandı');
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setSearchLoading(true);
        try {
            const response = await doktorApi.searchMedicines({ query: searchTerm });
            setSearchResults(response?.items || []);
        } catch (err) {
            console.error('Search error:', err);
            toast.error('İlaç araması yapılamadı');
        } finally {
            setSearchLoading(false);
        }
    };

    const addMedicine = (medicine) => {
        const exists = selectedMedicines.find(m => m.ilac_id === medicine.id);
        if (exists) {
            toast.error('Bu ilaç zaten eklendi');
            return;
        }

        setSelectedMedicines([...selectedMedicines, {
            ilac_id: medicine.id,
            ilac_adi: medicine.ad,
            fiyat: parseFloat(medicine.fiyat),
            miktar: 1,
            kullanim_talimati: ''
        }]);
        toast.success(`${medicine.ad} eklendi`);
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...selectedMedicines];
        updated[index][field] = value;
        setSelectedMedicines(updated);
    };

    const removeMedicine = (index) => {
        const updated = selectedMedicines.filter((_, i) => i !== index);
        setSelectedMedicines(updated);
    };

    const handleSubmit = async () => {
        if (selectedMedicines.length === 0) {
            toast.error('En az bir ilaç eklemelisiniz');
            return;
        }

        setSubmitting(true);
        try {
            const prescriptionData = {
                tc_no: tcNo,
                ilaclar: selectedMedicines.map(m => ({
                    ilac_id: m.ilac_id,
                    miktar: m.miktar,
                    kullanim_talimati: m.kullanim_talimati
                }))
            };

            const result = await doktorApi.createPrescription(prescriptionData);
            setCreatedPrescription(result);
            setStep(3);
            toast.success('Reçete başarıyla oluşturuldu!');
        } catch (err) {
            console.error('Create error:', err);
            toast.error('Reçete oluşturulurken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateTotal = () => {
        return selectedMedicines.reduce((sum, m) => sum + (m.fiyat * m.miktar), 0);
    };

    const resetForm = () => {
        setStep(1);
        setTcNo('');
        setSearchTerm('');
        setSearchResults([]);
        setSelectedMedicines([]);
        setCreatedPrescription(null);
    };

    return (
        <MainLayout sidebar={<DoktorSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                        Reçete Yaz
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Hastaya yeni bir reçete oluşturun
                    </p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/doktor/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Dashboard
                </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        1
                    </div>
                    <div className={`w-16 h-1 ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        2
                    </div>
                    <div className={`w-16 h-1 ${step >= 3 ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        3
                    </div>
                </div>
            </div>

            {/* Step 1: TC No Input */}
            {step === 1 && (
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <h3 className="text-lg font-bold text-slate-800">Hasta Bilgileri</h3>
                        <p className="text-sm text-slate-500">Hastanın TC Kimlik numarasını girin</p>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    TC Kimlik No
                                </label>
                                <input
                                    type="text"
                                    value={tcNo}
                                    onChange={(e) => setTcNo(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    placeholder="11 haneli TC Kimlik numarası"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-lg tracking-wider"
                                    maxLength={11}
                                />
                                <p className="text-xs text-slate-400 mt-1">{tcNo.length}/11 karakter</p>
                            </div>

                            <Button
                                variant="primary"
                                onClick={handleTcSubmit}
                                disabled={tcNo.length !== 11}
                                className="w-full bg-teal-600 hover:bg-teal-700"
                            >
                                Devam Et
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Step 2: Medicine Selection */}
            {step === 2 && (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Search */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-bold text-slate-800">İlaç Ara ve Ekle</h3>
                                <p className="text-sm text-slate-500">Hasta: TC {tcNo.slice(0, 3)}***{tcNo.slice(-3)}</p>
                            </CardHeader>
                            <CardBody>
                                <div className="flex gap-3 mb-4">
                                    <div className="flex-1 relative">
                                        <Pill className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="İlaç adı veya barkod..."
                                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                    <Button variant="primary" onClick={handleSearch} disabled={searchLoading} className="bg-teal-600 hover:bg-teal-700">
                                        {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {searchResults.map((medicine) => (
                                            <div
                                                key={medicine.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-800">{medicine.ad}</p>
                                                    <p className="text-sm text-slate-500">{medicine.barkod}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-teal-600">{parseFloat(medicine.fiyat).toFixed(2)} ₺</span>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => addMedicine(medicine)}
                                                        className="bg-teal-600 hover:bg-teal-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Selected Medicines */}
                        {selectedMedicines.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-bold text-slate-800">Seçilen İlaçlar ({selectedMedicines.length})</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    {selectedMedicines.map((medicine, index) => (
                                        <div key={index} className="p-4 border border-slate-200 rounded-xl">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{medicine.ilac_adi}</p>
                                                    <p className="text-sm text-teal-600">{medicine.fiyat.toFixed(2)} ₺/adet</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateMedicine(index, 'miktar', Math.max(1, medicine.miktar - 1))}
                                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{medicine.miktar}</span>
                                                    <button
                                                        onClick={() => updateMedicine(index, 'miktar', medicine.miktar + 1)}
                                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeMedicine(index)}
                                                        className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600 ml-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={medicine.kullanim_talimati}
                                                onChange={(e) => updateMedicine(index, 'kullanim_talimati', e.target.value)}
                                                placeholder="Kullanım talimatı (ör: Günde 3 kez, yemeklerden sonra)"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    ))}
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* Summary */}
                    <div>
                        <Card className="sticky top-4">
                            <CardHeader>
                                <h3 className="text-lg font-bold text-slate-800">Reçete Özeti</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Hasta TC</span>
                                        <span className="font-medium">{tcNo.slice(0, 3)}***{tcNo.slice(-3)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">İlaç Sayısı</span>
                                        <span className="font-medium">{selectedMedicines.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Toplam Adet</span>
                                        <span className="font-medium">{selectedMedicines.reduce((sum, m) => sum + m.miktar, 0)}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="font-bold">Toplam Tutar</span>
                                            <span className="font-bold text-lg text-teal-600">{calculateTotal().toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={selectedMedicines.length === 0 || submitting}
                                        className="w-full bg-teal-600 hover:bg-teal-700"
                                    >
                                        {submitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                        {submitting ? 'Kaydediliyor...' : 'Reçeteyi Oluştur'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setStep(1)}
                                        className="w-full"
                                    >
                                        Geri Dön
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && createdPrescription && (
                <Card className="max-w-2xl mx-auto">
                    <CardBody className="text-center py-8">
                        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-10 h-10 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reçete Oluşturuldu!</h2>
                        <p className="text-slate-500 mb-6">Reçete başarıyla kaydedildi.</p>

                        <div className="bg-slate-50 rounded-xl p-6 text-left mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Reçete No</p>
                                    <p className="font-bold text-lg text-teal-600">{createdPrescription.recete_no}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Hasta</p>
                                    <p className="font-medium">{createdPrescription.hasta_adi}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Tarih</p>
                                    <p className="font-medium">{createdPrescription.tarih}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Toplam Tutar</p>
                                    <p className="font-bold text-teal-600">{parseFloat(createdPrescription.toplam_tutar || 0).toFixed(2)} ₺</p>
                                </div>
                            </div>

                            {createdPrescription.ilaclar && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-slate-500 mb-2">İlaçlar</p>
                                    {createdPrescription.ilaclar.map((ilac, i) => (
                                        <div key={i} className="flex justify-between py-1">
                                            <span>{ilac.ilac_adi} x{ilac.miktar}</span>
                                            <span className="font-medium">{(ilac.fiyat * ilac.miktar).toFixed(2)} ₺</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button variant="primary" onClick={resetForm} className="bg-teal-600 hover:bg-teal-700">
                                <FilePlus className="w-4 h-4 mr-2" />
                                Yeni Reçete Yaz
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/doktor/recetelerim')}>
                                Reçetelerimi Gör
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </MainLayout>
    );
};

export default CreatePrescription;
