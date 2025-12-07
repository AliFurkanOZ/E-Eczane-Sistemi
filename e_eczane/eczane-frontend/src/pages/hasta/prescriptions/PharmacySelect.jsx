import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
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
import HastaSidebar from '../../../components/layout/HastaSidebar';
import toast from 'react-hot-toast';

const PharmacySelect = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Get selected prescription and medicines from session
        const storedPrescription = sessionStorage.getItem('selectedPrescription');
        const storedMedicines = sessionStorage.getItem('selectedMedicines');

        if (!storedPrescription || !storedMedicines) {
            toast.error('Önce reçete ve ilaç seçimi yapmalısınız');
            navigate('/hasta/receteler');
            return;
        }

        setPrescription(JSON.parse(storedPrescription));
        setMedicines(JSON.parse(storedMedicines));

        await fetchPharmacies(JSON.parse(storedMedicines));
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

            // Demo data
            setPharmacies([
                {
                    id: '1',
                    eczane_adi: 'Merkez Eczanesi',
                    eczaci_adi: 'Mehmet',
                    eczaci_soyadi: 'Kaya',
                    adres: 'Kızılay Mah. Gazi Mustafa Kemal Blv. No:5, Çankaya/Ankara',
                    telefon: '312 111 11 11',
                    mahalle: 'Kızılay',
                    mesafe: '0.5 km',
                    stok_durumu: 'tam', // tam, kismi, yok
                    eksik_ilaclar: []
                },
                {
                    id: '2',
                    eczane_adi: 'Yıldız Eczanesi',
                    eczaci_adi: 'Fatma',
                    eczaci_soyadi: 'Öztürk',
                    adres: 'Bahçelievler Mah. 7. Cadde No:22, Yenimahalle/Ankara',
                    telefon: '312 222 22 22',
                    mahalle: 'Bahçelievler',
                    mesafe: '2.3 km',
                    stok_durumu: 'tam',
                    eksik_ilaclar: []
                },
                {
                    id: '3',
                    eczane_adi: 'Sağlık Eczanesi',
                    eczaci_adi: 'Ali',
                    eczaci_soyadi: 'Demir',
                    adres: 'Etlik Mah. Hastane Cad. No:10, Keçiören/Ankara',
                    telefon: '312 333 33 33',
                    mahalle: 'Etlik',
                    mesafe: '4.1 km',
                    stok_durumu: 'kismi',
                    eksik_ilaclar: ['Augmentin 1000mg']
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPharmacy = (pharmacy) => {
        if (pharmacy.stok_durumu === 'yok') {
            toast.error('Bu eczanede seçili ilaçlar mevcut değil');
            return;
        }
        setSelectedPharmacy(pharmacy);
    };

    const handleCreateOrder = async () => {
        if (!selectedPharmacy) {
            toast.error('Lütfen bir eczane seçin');
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                eczane_id: selectedPharmacy.id,
                recete_id: prescription.id,
                recete_no: prescription.recete_no,
                ilaclar: medicines.map(m => ({
                    ilac_id: m.ilac_id,
                    miktar: m.miktar
                })),
                teslimat_adresi: '' // Will be fetched from user profile
            };

            await hastaApi.createOrder(orderData);

            // Clear session storage
            sessionStorage.removeItem('selectedPrescription');
            sessionStorage.removeItem('selectedMedicines');

            toast.success('Siparişiniz oluşturuldu!');
            navigate('/hasta/siparisler');
        } catch (err) {
            console.error('Error creating order:', err);
            toast.error('Sipariş oluşturulurken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const getStockBadge = (stokDurumu) => {
        const badges = {
            tam: { text: 'Tüm İlaçlar Mevcut', color: 'bg-green-100 text-green-800', icon: Check },
            kismi: { text: 'Kısmi Stok', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            yok: { text: 'Stok Yok', color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };
        return badges[stokDurumu] || badges.yok;
    };

    const totalAmount = medicines.reduce((sum, m) => sum + (m.fiyat * m.miktar), 0);

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
                                            <Button
                                                variant="secondary"
                                                onClick={() => navigate('/hasta/receteler')}
                                                className="mb-3"
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Geri
                                            </Button>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                Eczane Seçimi
                                            </h1>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Seçtiğiniz ilaçları temin edebileceğiniz eczaneler
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selected Medicines Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Seçilen İlaçlar ({medicines.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {medicines.map((m) => (
                                        <span key={m.ilac_id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                            {m.ad} x{m.miktar}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-2 text-lg font-bold text-blue-900">
                                    Toplam: {totalAmount.toFixed(2)} ₺
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loading />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Pharmacy List */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Uygun Eczaneler</h3>
                                        {pharmacies.length > 0 ? (
                                            pharmacies.map((pharmacy) => {
                                                const stockBadge = getStockBadge(pharmacy.stok_durumu);
                                                const StockIcon = stockBadge.icon;
                                                const isSelected = selectedPharmacy?.id === pharmacy.id;

                                                return (
                                                    <div
                                                        key={pharmacy.id}
                                                        className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all border-2 ${isSelected
                                                                ? 'border-blue-500 ring-2 ring-blue-200'
                                                                : 'border-transparent hover:border-gray-200'
                                                            } ${pharmacy.stok_durumu === 'yok' ? 'opacity-50' : ''}`}
                                                        onClick={() => handleSelectPharmacy(pharmacy)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start">
                                                                <div className={`rounded-full p-2 mr-3 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'
                                                                    }`}>
                                                                    <Building2 className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'
                                                                        }`} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">{pharmacy.eczane_adi}</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        Ecz. {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockBadge.color}`}>
                                                                <StockIcon className="w-3 h-3 mr-1" />
                                                                {stockBadge.text}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 space-y-1">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                                {pharmacy.adres}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                                {pharmacy.telefon}
                                                            </div>
                                                            {pharmacy.mesafe && (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                                    {pharmacy.mesafe} uzaklıkta
                                                                </div>
                                                            )}
                                                        </div>

                                                        {pharmacy.stok_durumu === 'kismi' && pharmacy.eksik_ilaclar?.length > 0 && (
                                                            <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                                                                <strong>Eksik:</strong> {pharmacy.eksik_ilaclar.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                    Uygun eczane bulunamadı
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Seçtiğiniz ilaçları stoklarında bulunduran eczane yok.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="lg:sticky lg:top-6">
                                        <div className="bg-white rounded-lg shadow">
                                            <div className="px-6 py-4 border-b border-gray-200">
                                                <h3 className="text-lg font-medium text-gray-900">Sipariş Özeti</h3>
                                            </div>
                                            <div className="px-6 py-4">
                                                {/* Selected Pharmacy */}
                                                {selectedPharmacy ? (
                                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <Check className="w-5 h-5 text-green-600 mr-2" />
                                                            <div>
                                                                <p className="font-medium text-green-900">{selectedPharmacy.eczane_adi}</p>
                                                                <p className="text-sm text-green-700">{selectedPharmacy.mahalle}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">Lütfen bir eczane seçin</p>
                                                    </div>
                                                )}

                                                {/* Medicine List */}
                                                <div className="space-y-2 mb-4">
                                                    {medicines.map((m) => (
                                                        <div key={m.ilac_id} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">{m.ad} x{m.miktar}</span>
                                                            <span className="text-gray-900">{(m.fiyat * m.miktar).toFixed(2)} ₺</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="flex justify-between font-medium">
                                                        <span className="text-gray-900">Toplam</span>
                                                        <span className="text-xl text-gray-900">{totalAmount.toFixed(2)} ₺</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    onClick={handleCreateOrder}
                                                    loading={submitting}
                                                    disabled={!selectedPharmacy}
                                                    className="w-full mt-6"
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Sipariş Oluştur
                                                </Button>

                                                <p className="text-xs text-gray-500 text-center mt-3">
                                                    Sipariş oluşturduktan sonra eczane tarafından onaylanması gerekmektedir.
                                                </p>
                                            </div>
                                        </div>
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

export default PharmacySelect;
