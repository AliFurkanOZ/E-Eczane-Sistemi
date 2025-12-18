import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import {
    Package,
    ArrowLeft,
    Save
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';
import toast from 'react-hot-toast';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        barkod: '',
        ad: '',
        kategori: 'normal',
        fiyat: '',
        etken_madde: '',
        kullanim_talimati: '',
        firma: '',
        miktar: '',
        min_stok: '10'
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.barkod.trim()) newErrors.barkod = 'Barkod zorunludur';
        if (!formData.ad.trim()) newErrors.ad = 'Ürün adı zorunludur';
        if (formData.ad.trim().length < 3) newErrors.ad = 'Ürün adı en az 3 karakter olmalıdır';
        if (!formData.fiyat || parseFloat(formData.fiyat) <= 0) newErrors.fiyat = 'Geçerli bir fiyat girin';
        if (!formData.kullanim_talimati.trim()) {
            newErrors.kullanim_talimati = 'Kullanım talimatı zorunludur';
        } else if (formData.kullanim_talimati.trim().length < 10) {
            newErrors.kullanim_talimati = 'Kullanım talimatı en az 10 karakter olmalıdır';
        }
        if (!formData.miktar || parseInt(formData.miktar) < 1) newErrors.miktar = 'Geçerli bir miktar girin (en az 1)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        console.log('[DEBUG] handleSubmit called');
        console.log('[DEBUG] formData:', formData);

        if (!validate()) {
            console.log('[DEBUG] Validation failed');
            return;
        }

        console.log('[DEBUG] Validation passed, submitting...');
        setLoading(true);

        try {
            const productData = {
                barkod: formData.barkod,
                ad: formData.ad,
                kategori: formData.kategori,
                fiyat: parseFloat(formData.fiyat),
                etken_madde: formData.etken_madde || null,
                kullanim_talimati: formData.kullanim_talimati,
                firma: formData.firma || null,
                baslangic_stok: parseInt(formData.miktar),
                min_stok: parseInt(formData.min_stok) || 10
            };

            console.log('[DEBUG] Sending product data:', productData);

            const response = await eczaneApi.addProduct(productData);
            console.log('[DEBUG] API Response:', response);

            toast.success('Ürün başarıyla eklendi!');
            navigate('/eczane/stoklar');
        } catch (err) {
            console.error('[ERROR] Error adding product:', err);
            console.error('[ERROR] Error response:', err?.response);
            console.error('[ERROR] Error response data:', err?.response?.data);

            // Daha detaylı hata mesajı
            let errorMessage = 'Ürün eklenirken bir hata oluştu';

            if (err?.response?.data?.detail) {
                // Eğer detail bir array ise (Pydantic validation errors)
                if (Array.isArray(err.response.data.detail)) {
                    const messages = err.response.data.detail.map(e => {
                        const field = e.loc?.slice(-1)[0] || 'field';
                        return `${field}: ${e.msg}`;
                    });
                    errorMessage = messages.join(', ');
                } else {
                    errorMessage = err.response.data.detail;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const kategoriOptions = [
        { value: 'normal', label: 'Normal' },
        { value: 'kirmizi_recete', label: 'Kırmızı Reçete' },
        { value: 'soguk_zincir', label: 'Soğuk Zincir' }
    ];

    return (
        <MainLayout sidebar={<EczaneSidebar />}>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="secondary"
                    onClick={() => navigate('/eczane/stoklar')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600 flex items-center">
                    <Package className="w-8 h-8 text-emerald-600 mr-3" />
                    Yeni Ürün Ekle
                </h1>
                <p className="text-slate-500 mt-2">
                    Reçetesiz ürün/ilaç ekleyin
                </p>
            </div>

            {/* Form */}
            <Card className="max-w-3xl">
                <CardBody>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Barkod */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Barkod *
                                </label>
                                <input
                                    type="text"
                                    name="barkod"
                                    value={formData.barkod}
                                    onChange={handleChange}
                                    className={`w-full border ${errors.barkod ? 'border-red-300' : 'border-slate-300'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                    placeholder="8699123456789"
                                />
                                {errors.barkod && <p className="text-red-500 text-xs mt-1">{errors.barkod}</p>}
                            </div>

                            {/* Ürün Adı */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Ürün Adı *
                                </label>
                                <input
                                    type="text"
                                    name="ad"
                                    value={formData.ad}
                                    onChange={handleChange}
                                    className={`w-full border ${errors.ad ? 'border-red-300' : 'border-slate-300'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                    placeholder="C Vitamini 1000mg"
                                />
                                {errors.ad && <p className="text-red-500 text-xs mt-1">{errors.ad}</p>}
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Kategori
                                </label>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    {kategoriOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fiyat */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Fiyat (₺) *
                                </label>
                                <input
                                    type="number"
                                    name="fiyat"
                                    value={formData.fiyat}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className={`w-full border ${errors.fiyat ? 'border-red-300' : 'border-slate-300'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                    placeholder="35.00"
                                />
                                {errors.fiyat && <p className="text-red-500 text-xs mt-1">{errors.fiyat}</p>}
                            </div>

                            {/* Etken Madde */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Etken Madde
                                </label>
                                <input
                                    type="text"
                                    name="etken_madde"
                                    value={formData.etken_madde}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Askorbik Asit"
                                />
                            </div>

                            {/* Firma */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Firma
                                </label>
                                <input
                                    type="text"
                                    name="firma"
                                    value={formData.firma}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="İlaç Firması"
                                />
                            </div>

                            {/* Miktar */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Başlangıç Stok Miktarı *
                                </label>
                                <input
                                    type="number"
                                    name="miktar"
                                    value={formData.miktar}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full border ${errors.miktar ? 'border-red-300' : 'border-slate-300'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                    placeholder="50"
                                />
                                {errors.miktar && <p className="text-red-500 text-xs mt-1">{errors.miktar}</p>}
                            </div>

                            {/* Min Stok */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Minimum Stok Uyarısı
                                </label>
                                <input
                                    type="number"
                                    name="min_stok"
                                    value={formData.min_stok}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        {/* Kullanım Talimatı */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Kullanım Talimatı *
                            </label>
                            <textarea
                                name="kullanim_talimati"
                                value={formData.kullanim_talimati}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full border ${errors.kullanim_talimati ? 'border-red-300' : 'border-slate-300'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                placeholder="Günde 1 tablet, yemeklerden sonra alınız."
                            />
                            {errors.kullanim_talimati && <p className="text-red-500 text-xs mt-1">{errors.kullanim_talimati}</p>}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/eczane/stoklar')}
                                type="button"
                            >
                                İptal
                            </Button>
                            <Button
                                variant="primary"
                                type="button"
                                loading={loading}
                                onClick={handleSubmit}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Ürün Ekle
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default AddProduct;
