import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/common/Button';
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
        if (!formData.fiyat || parseFloat(formData.fiyat) <= 0) newErrors.fiyat = 'Geçerli bir fiyat girin';
        if (!formData.kullanim_talimati.trim()) newErrors.kullanim_talimati = 'Kullanım talimatı zorunludur';
        if (!formData.miktar || parseInt(formData.miktar) < 0) newErrors.miktar = 'Geçerli bir miktar girin';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await eczaneApi.addProduct({
                barkod: formData.barkod,
                ad: formData.ad,
                kategori: formData.kategori,
                fiyat: parseFloat(formData.fiyat),
                etken_madde: formData.etken_madde || null,
                kullanim_talimati: formData.kullanim_talimati,
                firma: formData.firma || null,
                miktar: parseInt(formData.miktar),
                min_stok: parseInt(formData.min_stok) || 10
            });

            toast.success('Ürün başarıyla eklendi!');
            navigate('/eczane/stoklar');
        } catch (err) {
            console.error('Error adding product:', err);
            toast.error(err.response?.data?.detail || 'Ürün eklenirken bir hata oluştu');
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
        <div className="min-h-screen bg-gray-50">
            <EczaneSidebar />

            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
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
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <Package className="w-8 h-8 text-green-600 mr-3" />
                                    Yeni Ürün Ekle
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Reçetesiz ürün/ilaç ekleyin
                                </p>
                            </div>

                            {/* Form */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Barkod */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Barkod *
                                            </label>
                                            <input
                                                type="text"
                                                name="barkod"
                                                value={formData.barkod}
                                                onChange={handleChange}
                                                className={`w-full border ${errors.barkod ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                                                placeholder="8699123456789"
                                            />
                                            {errors.barkod && <p className="text-red-500 text-xs mt-1">{errors.barkod}</p>}
                                        </div>

                                        {/* Ürün Adı */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ürün Adı *
                                            </label>
                                            <input
                                                type="text"
                                                name="ad"
                                                value={formData.ad}
                                                onChange={handleChange}
                                                className={`w-full border ${errors.ad ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                                                placeholder="C Vitamini 1000mg"
                                            />
                                            {errors.ad && <p className="text-red-500 text-xs mt-1">{errors.ad}</p>}
                                        </div>

                                        {/* Kategori */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Kategori
                                            </label>
                                            <select
                                                name="kategori"
                                                value={formData.kategori}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            >
                                                {kategoriOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Fiyat */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fiyat (₺) *
                                            </label>
                                            <input
                                                type="number"
                                                name="fiyat"
                                                value={formData.fiyat}
                                                onChange={handleChange}
                                                step="0.01"
                                                min="0"
                                                className={`w-full border ${errors.fiyat ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                                                placeholder="35.00"
                                            />
                                            {errors.fiyat && <p className="text-red-500 text-xs mt-1">{errors.fiyat}</p>}
                                        </div>

                                        {/* Etken Madde */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Etken Madde
                                            </label>
                                            <input
                                                type="text"
                                                name="etken_madde"
                                                value={formData.etken_madde}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder="Askorbik Asit"
                                            />
                                        </div>

                                        {/* Firma */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Firma
                                            </label>
                                            <input
                                                type="text"
                                                name="firma"
                                                value={formData.firma}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder="İlaç Firması"
                                            />
                                        </div>

                                        {/* Miktar */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Başlangıç Stok Miktarı *
                                            </label>
                                            <input
                                                type="number"
                                                name="miktar"
                                                value={formData.miktar}
                                                onChange={handleChange}
                                                min="0"
                                                className={`w-full border ${errors.miktar ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                                                placeholder="50"
                                            />
                                            {errors.miktar && <p className="text-red-500 text-xs mt-1">{errors.miktar}</p>}
                                        </div>

                                        {/* Min Stok */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Minimum Stok Uyarısı
                                            </label>
                                            <input
                                                type="number"
                                                name="min_stok"
                                                value={formData.min_stok}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>

                                    {/* Kullanım Talimatı */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kullanım Talimatı *
                                        </label>
                                        <textarea
                                            name="kullanim_talimati"
                                            value={formData.kullanim_talimati}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`w-full border ${errors.kullanim_talimati ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                                            placeholder="Günde 1 tablet, yemeklerden sonra alınız."
                                        />
                                        {errors.kullanim_talimati && <p className="text-red-500 text-xs mt-1">{errors.kullanim_talimati}</p>}
                                    </div>

                                    {/* Submit */}
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate('/eczane/stoklar')}
                                            type="button"
                                        >
                                            İptal
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            loading={loading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Ürün Ekle
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddProduct;
