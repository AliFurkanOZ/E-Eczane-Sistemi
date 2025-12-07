import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import {
    User,
    ArrowLeft,
    Save,
    Building2,
    MapPin,
    Phone,
    CreditCard
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';
import toast from 'react-hot-toast';

const EczaneProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await eczaneApi.getProfile();
            setProfile(data);
            setFormData({
                telefon: data.telefon || '',
                adres: data.adres || '',
                banka_hesap_no: data.banka_hesap_no || '',
                iban: data.iban || ''
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            toast.error('Profil yüklenirken hata oluştu');

            // Demo data
            const demoData = {
                eczane_adi: 'Merkez Eczanesi',
                sicil_no: 'ECZ001',
                eczaci_adi: 'Mehmet',
                eczaci_soyadi: 'Kaya',
                eczaci_diploma_no: 'DIP001',
                mahalle: 'Kızılay',
                telefon: '312 111 11 11',
                adres: 'Kızılay Mah. Gazi Mustafa Kemal Blv. No:5, Çankaya/Ankara',
                banka_hesap_no: '1234567890',
                iban: 'TR123456789012345678901234',
                onay_durumu: 'onaylandi',
                email: 'merkez@eczane.com'
            };
            setProfile(demoData);
            setFormData({
                telefon: demoData.telefon,
                adres: demoData.adres,
                banka_hesap_no: demoData.banka_hesap_no,
                iban: demoData.iban
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await eczaneApi.updateProfile(formData);
            setProfile(prev => ({ ...prev, ...formData }));
            setEditMode(false);
            toast.success('Profil güncellendi!');
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Profil güncellenirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (onayDurumu) => {
        const badges = {
            beklemede: { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
            onaylandi: { text: 'Onaylı', color: 'bg-green-100 text-green-800' },
            reddedildi: { text: 'Reddedildi', color: 'bg-red-100 text-red-800' }
        };
        return badges[onayDurumu] || badges.beklemede;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <EczaneSidebar />
                <div className="md:pl-64 flex justify-center items-center h-screen">
                    <Loading />
                </div>
            </div>
        );
    }

    const status = getStatusBadge(profile?.onay_durumu);

    return (
        <div className="min-h-screen bg-gray-50">
            <EczaneSidebar />

            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Header */}
                            <div className="mb-6">
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/eczane/dashboard')}
                                    className="mb-3"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <User className="w-8 h-8 text-green-600 mr-3" />
                                    Eczane Profili
                                </h1>
                            </div>

                            {/* Profile Card */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
                                    <div className="flex items-center">
                                        <div className="bg-white rounded-full p-4">
                                            <Building2 className="h-12 w-12 text-green-600" />
                                        </div>
                                        <div className="ml-6">
                                            <h2 className="text-2xl font-bold text-white">
                                                {profile?.eczane_adi}
                                            </h2>
                                            <p className="text-green-100">
                                                Sicil No: {profile?.sicil_no}
                                            </p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="px-6 py-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-medium text-gray-900">Eczane Bilgileri</h3>
                                        {!editMode ? (
                                            <Button
                                                variant="secondary"
                                                onClick={() => setEditMode(true)}
                                            >
                                                Düzenle
                                            </Button>
                                        ) : (
                                            <div className="space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setEditMode(false);
                                                        setFormData({
                                                            telefon: profile.telefon,
                                                            adres: profile.adres,
                                                            banka_hesap_no: profile.banka_hesap_no,
                                                            iban: profile.iban
                                                        });
                                                    }}
                                                >
                                                    İptal
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    onClick={handleSave}
                                                    loading={saving}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Kaydet
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Eczacı Bilgileri - Read Only */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Eczacı Adı Soyadı
                                                </label>
                                                <p className="text-gray-900">
                                                    Ecz. {profile?.eczaci_adi} {profile?.eczaci_soyadi}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Diploma No
                                                </label>
                                                <p className="text-gray-900">{profile?.eczaci_diploma_no}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    E-posta
                                                </label>
                                                <p className="text-gray-900">{profile?.email}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Mahalle
                                                </label>
                                                <p className="text-gray-900">{profile?.mahalle}</p>
                                            </div>
                                        </div>

                                        {/* Editable Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    <Phone className="w-4 h-4 inline mr-1" />
                                                    Telefon
                                                </label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        name="telefon"
                                                        value={formData.telefon}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{profile?.telefon}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    <MapPin className="w-4 h-4 inline mr-1" />
                                                    Adres
                                                </label>
                                                {editMode ? (
                                                    <textarea
                                                        name="adres"
                                                        value={formData.adres}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{profile?.adres}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                            <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                                            Banka Bilgileri
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Hesap No
                                                </label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        name="banka_hesap_no"
                                                        value={formData.banka_hesap_no}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{profile?.banka_hesap_no}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    IBAN
                                                </label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        name="iban"
                                                        value={formData.iban}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-mono text-sm">{profile?.iban}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EczaneProfile;
