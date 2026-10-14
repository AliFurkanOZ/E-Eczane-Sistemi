import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    CreditCard,
    Lock,
    ArrowLeft,
    Check,
    AlertCircle,
    Shield,
    Package,
    Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import * as hastaApi from '../../../api/hastaApi';
import { clearSepet } from '../../../redux/slices/hastaSlice';

const Payment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [pharmacy, setPharmacy] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [prescription, setPrescription] = useState(null);
    const [errors, setErrors] = useState({});
    const [cardType, setCardType] = useState(null);

    useEffect(() => {
        loadOrderData();
    }, []);

    const loadOrderData = async () => {
        const storedPharmacy = sessionStorage.getItem('selectedPharmacy');
        const storedMedicines = sessionStorage.getItem('selectedMedicines');
        const storedPrescription = sessionStorage.getItem('selectedPrescription');

        if (!storedPharmacy || !storedMedicines) {
            toast.error('Ödeme bilgileri bulunamadı');
            navigate('/hasta/sepet');
            return;
        }

        setPharmacy(JSON.parse(storedPharmacy));
        setMedicines(JSON.parse(storedMedicines));
        if (storedPrescription) {
            setPrescription(JSON.parse(storedPrescription));
        }
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const match = cleaned.match(/.{1,4}/g);
        return match ? match.join(' ') : '';
    };

    const handleCardNumberChange = (e) => {
        const rawValue = e.target.value.replace(/\s+/g, '');
        if (rawValue.length <= 16) {
            setCardNumber(formatCardNumber(rawValue));

            if (rawValue.startsWith('4')) {
                setCardType('visa');
            } else if (rawValue.startsWith('5')) {
                setCardType('mastercard');
            } else {
                setCardType(null);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const cleanedCardNumber = cardNumber.replace(/\s+/g, '');

        if (cleanedCardNumber.length !== 16) {
            newErrors.cardNumber = 'Kart numarası 16 haneli olmalıdır';
        }

        if (!cardHolder.trim()) {
            newErrors.cardHolder = 'Kart sahibi adı gerekli';
        }

        if (!expiryMonth || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
            newErrors.expiryMonth = 'Geçerli bir ay girin';
        }

        if (!expiryYear || expiryYear.length !== 2) {
            newErrors.expiryYear = 'Geçerli bir yıl girin';
        }

        if (!cvv || cvv.length !== 3) {
            newErrors.cvv = 'CVV 3 haneli olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) {
            toast.error('Lütfen tüm alanları doğru şekilde doldurun');
            return;
        }

        setLoading(true);
        try {
            let teslimatAdresi = '';
            try {
                const profile = await hastaApi.getProfile();
                teslimatAdresi = profile?.adres || '';
            } catch (err) {
                console.warn('Could not fetch profile for address:', err);
            }

            const paymentData = {
                kart_bilgisi: {
                    kart_numarasi: cardNumber.replace(/\s+/g, ''),
                    son_kullanma_ay: expiryMonth.padStart(2, '0'),
                    son_kullanma_yil: expiryYear,
                    cvv: cvv,
                    kart_sahibi: cardHolder.toUpperCase()
                },
                tutar: totalAmount.toFixed(2),
                siparis_bilgileri: {
                    eczane_id: pharmacy.id,
                    recete_id: prescription?.recete_id || null,
                    items: medicines.map(m => ({
                        ilac_id: m.ilac_id,
                        ilac_adi: m.ad || m.ilac_adi || 'Bilinmeyen İlaç',
                        barkod: m.barkod || '',
                        miktar: m.miktar || 1,
                        birim_fiyat: String(parseFloat(m.fiyat || m.birim_fiyat || 0).toFixed(2)),
                        ara_toplam: String((parseFloat(m.fiyat || m.birim_fiyat || 0) * (m.miktar || 1)).toFixed(2))
                    })),
                    teslimat_adresi: teslimatAdresi,
                    siparis_notu: null
                }
            };

            const result = await hastaApi.processPayment(paymentData);

            if (result.basarili) {
                sessionStorage.removeItem('selectedPrescription');
                sessionStorage.removeItem('selectedMedicines');
                sessionStorage.removeItem('selectedPharmacy');
                sessionStorage.removeItem('cartItems');

                dispatch(clearSepet());

                toast.success(`Ödeme başarılı! Sipariş No: ${result.siparis_no}`);
                navigate('/hasta/siparisler');
            } else {
                toast.error(result.mesaj || 'Ödeme başarısız');
            }
        } catch (err) {
            console.error('Payment error:', err);
            toast.error(err.response?.data?.detail || 'Ödeme işlemi sırasında hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = medicines.reduce((sum, m) => {
        const price = parseFloat(m.fiyat || m.birim_fiyat || 0);
        return sum + (price * (m.miktar || 1));
    }, 0);

    return (
        <MainLayout sidebar={<HastaSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/hasta/eczane-sec')}
                        className="mb-3"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                        Ödeme
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Siparişinizi tamamlamak için ödeme bilgilerinizi girin.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Payment Form */}
                <div className="lg:col-span-2">
                    <Card className="overflow-visible">
                        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CreditCard className="w-6 h-6 mr-3" />
                                    <h3 className="text-lg font-bold">Kart Bilgileri</h3>
                                </div>
                                <div className="flex items-center text-sm text-slate-300">
                                    <Lock className="w-4 h-4 mr-1" />
                                    256-bit SSL
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="p-6">
                            {/* Credit Card Preview */}
                            <div className="mb-8">
                                <div className={`relative w-full max-w-sm mx-auto h-48 rounded-2xl p-6 text-white shadow-2xl transition-all duration-300 ${cardType === 'visa'
                                        ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900'
                                        : cardType === 'mastercard'
                                            ? 'bg-gradient-to-br from-orange-500 via-red-600 to-red-800'
                                            : 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900'
                                    }`}>
                                    {/* Card chip */}
                                    <div className="absolute top-6 left-6 w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md opacity-80" />

                                    {/* Card type logo */}
                                    <div className="absolute top-6 right-6 text-2xl font-bold opacity-80">
                                        {cardType === 'visa' && 'VISA'}
                                        {cardType === 'mastercard' && 'MC'}
                                    </div>

                                    {/* Card number */}
                                    <div className="absolute bottom-16 left-6 right-6 text-xl tracking-widest font-mono">
                                        {cardNumber || '•••• •••• •••• ••••'}
                                    </div>

                                    {/* Card holder & expiry */}
                                    <div className="absolute bottom-6 left-6 right-6 flex justify-between text-sm">
                                        <div>
                                            <div className="text-xs text-white/60 uppercase">Kart Sahibi</div>
                                            <div className="font-medium truncate max-w-[180px]">
                                                {cardHolder.toUpperCase() || 'AD SOYAD'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-white/60 uppercase">Son Kullanma</div>
                                            <div className="font-medium">
                                                {expiryMonth || 'MM'}/{expiryYear || 'YY'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-5">
                                {/* Card Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kart Numarası
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            placeholder="0000 0000 0000 0000"
                                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-primary-500/20 ${errors.cardNumber
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-slate-200 focus:border-primary-500'
                                                }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {cardType === 'visa' && (
                                                <span className="text-blue-600 font-bold">VISA</span>
                                            )}
                                            {cardType === 'mastercard' && (
                                                <span className="text-red-600 font-bold">MC</span>
                                            )}
                                        </div>
                                    </div>
                                    {errors.cardNumber && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.cardNumber}
                                        </p>
                                    )}
                                </div>

                                {/* Card Holder */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kart Sahibi Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        placeholder="AD SOYAD"
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-primary-500/20 uppercase ${errors.cardHolder
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-slate-200 focus:border-primary-500'
                                            }`}
                                    />
                                    {errors.cardHolder && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.cardHolder}
                                        </p>
                                    )}
                                </div>

                                {/* Expiry & CVV */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Ay
                                        </label>
                                        <input
                                            type="text"
                                            value={expiryMonth}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                setExpiryMonth(val);
                                            }}
                                            placeholder="MM"
                                            maxLength={2}
                                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-primary-500/20 text-center ${errors.expiryMonth
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-slate-200 focus:border-primary-500'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Yıl
                                        </label>
                                        <input
                                            type="text"
                                            value={expiryYear}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                setExpiryYear(val);
                                            }}
                                            placeholder="YY"
                                            maxLength={2}
                                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-primary-500/20 text-center ${errors.expiryYear
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-slate-200 focus:border-primary-500'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            CVV
                                        </label>
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                                setCvv(val);
                                            }}
                                            placeholder="•••"
                                            maxLength={3}
                                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-primary-500/20 text-center ${errors.cvv
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-slate-200 focus:border-primary-500'
                                                }`}
                                        />
                                    </div>
                                </div>
                                {(errors.expiryMonth || errors.expiryYear || errors.cvv) && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Lütfen geçerli tarih ve CVV bilgilerini girin
                                    </p>
                                )}
                            </div>

                            {/* Security Info */}
                            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center">
                                <Shield className="w-8 h-8 text-emerald-600 mr-3 flex-shrink-0" />
                                <div className="text-sm text-emerald-800">
                                    <strong>Güvenli Ödeme:</strong> Kart bilgileriniz 256-bit SSL şifreleme ile korunmaktadır.
                                    Bilgileriniz güvenle işlenmektedir.
                                </div>
                            </div>

                            {/* Test Card Info */}
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="text-sm text-blue-800">
                                    <strong>Test Kartları:</strong>
                                    <div className="mt-2 space-y-1 font-mono text-xs">
                                        <div>✅ 4111 1111 1111 1111 (Başarılı)</div>
                                        <div>✅ 5500 0000 0000 0004 (Başarılı)</div>
                                        <div>❌ 4000 0000 0000 0002 (Yetersiz bakiye)</div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold text-slate-800">Sipariş Özeti</h3>
                        </CardHeader>
                        <CardBody>
                            {/* Selected Pharmacy */}
                            {pharmacy && (
                                <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                    <div className="flex items-center">
                                        <Building2 className="w-5 h-5 text-primary-600 mr-3" />
                                        <div>
                                            <p className="font-bold text-primary-800">{pharmacy.eczane_adi}</p>
                                            <p className="text-sm text-primary-600">{pharmacy.mahalle}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Medicine List */}
                            <div className="space-y-2 mb-4">
                                {medicines.map((m, index) => (
                                    <div key={m.ilac_id || index} className="flex justify-between text-sm">
                                        <span className="text-slate-600 flex items-center">
                                            <Package className="w-4 h-4 mr-2 text-slate-400" />
                                            {m.ad || m.ilac_adi} x{m.miktar}
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {(parseFloat(m.fiyat || m.birim_fiyat || 0) * (m.miktar || 1)).toFixed(2)} ₺
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-slate-600">Toplam</span>
                                    <span className="text-3xl font-bold text-primary-600">
                                        {totalAmount.toFixed(2)} ₺
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                onClick={handlePayment}
                                loading={loading}
                                disabled={loading}
                                className="w-full py-4 text-lg"
                            >
                                {loading ? (
                                    'İşleniyor...'
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5 mr-2" />
                                        Ödemeyi Tamamla
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center">
                                <Check className="w-4 h-4 mr-1 text-emerald-500" />
                                Ödeme sonrası sipariş otomatik oluşturulacaktır
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default Payment;
