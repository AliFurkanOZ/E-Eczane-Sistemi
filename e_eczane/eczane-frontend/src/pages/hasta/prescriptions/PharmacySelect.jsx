import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import * as hastaApi from '../../../api/hastaApi';
import {
    Building2,
    ArrowLeft,
    MapPin,
    Phone,
    Clock,
    Check,
    ShoppingCart,
    AlertCircle,
    Package
} from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import toast from 'react-hot-toast';

const PharmacySelect = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Get selected prescription and medicines from session
        // Data can come from either prescription flow or cart flow
        const storedPrescription = sessionStorage.getItem('selectedPrescription');
        const storedMedicines = sessionStorage.getItem('selectedMedicines');
        const storedCartItems = sessionStorage.getItem('cartItems');

        // Check if we have medicines from either source
        let medicinesList = [];
        let prescriptionData = null;

        if (storedMedicines) {
            medicinesList = JSON.parse(storedMedicines);
        } else if (storedCartItems) {
            // Cart items format might be different, normalize them
            const cartItems = JSON.parse(storedCartItems);
            medicinesList = cartItems.map(item => ({
                ilac_id: item.ilac_id,
                ad: item.ilac_adi || item.ad,
                ilac_adi: item.ilac_adi || item.ad,
                barkod: item.barkod || '',
                miktar: item.miktar || 1,
                fiyat: item.birim_fiyat || item.fiyat || 0,
                birim_fiyat: item.birim_fiyat || item.fiyat || 0
            }));
            // Also save as selectedMedicines for consistency
            sessionStorage.setItem('selectedMedicines', JSON.stringify(medicinesList));
        }

        if (medicinesList.length === 0) {
            toast.error('Önce reçete veya sepetten ilaç seçimi yapmalısınız');
            navigate('/hasta/receteler');
            return;
        }

        if (storedPrescription) {
            prescriptionData = JSON.parse(storedPrescription);
        }

        setPrescription(prescriptionData);
        setMedicines(medicinesList);

        await fetchPharmacies(medicinesList);
    };

    const fetchPharmacies = async (selectedMedicines) => {
        setLoading(true);
        try {
            // Get pharmacies that have the selected medicines in stock
            const ilacIds = selectedMedicines.map(m => m.ilac_id);
            const data = await hastaApi.getPharmaciesWithStock(ilacIds);
            setPharmacies(data || []);
        } catch (err) {
            console.error('Error fetching pharmacies:', err);
            toast.error('Eczane listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            setPharmacies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPharmacy = (pharmacy) => {
        // Handle both old string-based stok_durumu and new boolean tum_urunler_mevcut
        const hasNoStock = pharmacy.stok_durumu === 'yok' ||
            (pharmacy.tum_urunler_mevcut === false && pharmacy.stok_durumu === undefined);

        if (hasNoStock) {
            toast.error('Bu eczanede seçili ilaçlar mevcut değil');
            return;
        }
        setSelectedPharmacy(pharmacy);
    };

    const handleProceedToPayment = () => {
        if (!selectedPharmacy) {
            toast.error('Lütfen bir eczane seçin');
            return;
        }

        // UUID format validation helper
        const isValidUUID = (str) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
        };

        // Validate eczane_id
        if (!isValidUUID(selectedPharmacy.id)) {
            console.error('Invalid eczane_id:', selectedPharmacy.id);
            toast.error(`Geçersiz eczane ID formatı: ${selectedPharmacy.id}`);
            return;
        }

        // Validate all ilac_ids
        for (const m of medicines) {
            if (!isValidUUID(m.ilac_id)) {
                console.error('Invalid ilac_id:', m.ilac_id, 'for medicine:', m.ad || m.ilac_adi);
                toast.error(`Geçersiz ilaç ID formatı: ${m.ilac_id}`);
                return;
            }
        }

        // Save pharmacy to session storage for payment page
        sessionStorage.setItem('selectedPharmacy', JSON.stringify(selectedPharmacy));

        // Navigate to payment page
        toast.success('Ödeme sayfasına yönlendiriliyorsunuz');
        navigate('/hasta/odeme');
    };

    const getStockBadge = (pharmacy) => {
        // Handle both old string-based stok_durumu and new boolean tum_urunler_mevcut
        let stokDurumu = pharmacy.stok_durumu;

        // If we have tum_urunler_mevcut from backend, use it to determine status
        if (pharmacy.tum_urunler_mevcut !== undefined) {
            stokDurumu = pharmacy.tum_urunler_mevcut ? 'tam' : 'kismi';
        }

        const badges = {
            tam: { text: 'Tüm İlaçlar Mevcut', color: 'bg-green-100 text-green-800', icon: Check },
            kismi: { text: 'Kısmi Stok', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            yok: { text: 'Stok Yok', color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };
        return badges[stokDurumu] || badges.yok;
    };

    const totalAmount = medicines.reduce((sum, m) => sum + (m.fiyat * m.miktar), 0);

    return (
        <MainLayout sidebar={<HastaSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/hasta/receteler')}
                        className="mb-3"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                        Eczane Seçimi
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Seçtiğiniz ilaçları temin edebileceğiniz eczaneler
                    </p>
                </div>
            </div>

            {/* Selected Medicines Summary */}
            <Card className="mb-6 bg-gradient-to-r from-primary-50 to-white border-primary-100/50">
                <CardBody>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-primary-600" />
                        Seçilen İlaçlar ({medicines.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {medicines.map((m) => (
                            <span key={m.ilac_id} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-white border border-primary-200 text-primary-800 shadow-sm">
                                {m.ad} x{m.miktar}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 text-xl font-bold text-primary-600">
                        Toplam: {totalAmount.toFixed(2)} ₺
                    </p>
                </CardBody>
            </Card>

            {loading ? (
                <Card>
                    <CardBody className="py-16">
                        <div className="flex justify-center">
                            <Loading />
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pharmacy List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">Uygun Eczaneler</h3>
                        {pharmacies.length > 0 ? (
                            pharmacies.map((pharmacy) => {
                                const stockBadge = getStockBadge(pharmacy);
                                const StockIcon = stockBadge.icon;
                                const isSelected = selectedPharmacy?.id === pharmacy.id;

                                return (
                                    <Card
                                        key={pharmacy.id}
                                        hover
                                        className={`cursor-pointer transition-all border-2 ${isSelected
                                            ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50/30'
                                            : 'border-transparent hover:border-slate-200'
                                            } ${pharmacy.stok_durumu === 'yok' ? 'opacity-50' : ''}`}
                                        onClick={() => handleSelectPharmacy(pharmacy)}
                                    >
                                        <CardBody>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start">
                                                    <div className={`rounded-xl p-3 mr-4 ${isSelected ? 'bg-primary-100' : 'bg-slate-100'
                                                        }`}>
                                                        <Building2 className={`h-6 w-6 ${isSelected ? 'text-primary-600' : 'text-slate-500'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">{pharmacy.eczane_adi}</h4>
                                                        <p className="text-sm text-slate-500">
                                                            {pharmacy.eczaci_tam_ad || `Ecz. ${pharmacy.eczaci_adi} ${pharmacy.eczaci_soyadi}`}
                                                        </p>
                                                        {(pharmacy.ilce || pharmacy.il) && (
                                                            <p className="text-xs text-primary-600 font-medium mt-1">
                                                                📍 {[pharmacy.mahalle, pharmacy.ilce, pharmacy.il].filter(Boolean).join(' / ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stockBadge.color}`}>
                                                    <StockIcon className="w-3 h-3 mr-1" />
                                                    {stockBadge.text}
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                                    {pharmacy.adres}
                                                </div>
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                                    {pharmacy.telefon}
                                                </div>
                                                {pharmacy.mesafe && (
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                        {pharmacy.mesafe} uzaklıkta
                                                    </div>
                                                )}
                                            </div>

                                            {pharmacy.stok_durumu === 'kismi' && pharmacy.eksik_ilaclar?.length > 0 && (
                                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                                    <strong>Eksik:</strong> {pharmacy.eksik_ilaclar.join(', ')}
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card>
                                <CardBody className="py-12 text-center">
                                    <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                                    <h3 className="mt-4 text-lg font-semibold text-slate-800">
                                        Uygun eczane bulunamadı
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Seçtiğiniz ilaçları stoklarında bulunduran eczane yok.
                                    </p>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-6 h-fit">
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold text-slate-800">Sipariş Özeti</h3>
                            </CardHeader>
                            <CardBody>
                                {/* Selected Pharmacy */}
                                {selectedPharmacy ? (
                                    <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center">
                                            <Check className="w-5 h-5 text-emerald-600 mr-3" />
                                            <div>
                                                <p className="font-bold text-emerald-800">{selectedPharmacy.eczane_adi}</p>
                                                <p className="text-sm text-emerald-600">{selectedPharmacy.mahalle}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                        <p className="text-sm text-slate-500">Lütfen bir eczane seçin</p>
                                    </div>
                                )}

                                {/* Medicine List */}
                                <div className="space-y-2 mb-4">
                                    {medicines.map((m) => (
                                        <div key={m.ilac_id} className="flex justify-between text-sm">
                                            <span className="text-slate-600">{m.ad} x{m.miktar}</span>
                                            <span className="font-medium text-slate-800">{(m.fiyat * m.miktar).toFixed(2)} ₺</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-600">Toplam</span>
                                        <span className="text-2xl font-bold text-primary-600">{totalAmount.toFixed(2)} ₺</span>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleProceedToPayment}
                                    disabled={!selectedPharmacy}
                                    className="w-full mt-6"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Ödemeye Geç
                                </Button>

                                <p className="text-xs text-slate-500 text-center mt-4">
                                    Ödeme işlemi sonrası siparişiniz otomatik olarak oluşturulacaktır.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default PharmacySelect;
