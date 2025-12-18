import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    User,
    ArrowLeft,
    Save,
    Building2,
    MapPin,
    Phone,
    CreditCard,
    Edit2
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
            <MainLayout sidebar={<EczaneSidebar />}>
                <div className="flex justify-center items-center h-96">
                    <Loading />
                </div>
            </MainLayout>
        );
    }

    const status = getStatusBadge(profile?.onay_durumu);

    return (
        <MainLayout sidebar={<EczaneSidebar />}>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="secondary"
                    onClick={() => navigate('/eczane/dashboard')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Dashboard
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600 flex items-center">
                    <User className="w-8 h-8 text-emerald-600 mr-3" />
                    Eczane Profili
                </h1>
            </div>

            {/* Profile Card */}
            <Card className="max-w-4xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8">
                    <div className="flex items-center">
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <Building2 className="h-12 w-12 text-emerald-600" />
                        </div>
                        <div className="ml-6">
                            <h2 className="text-2xl font-bold text-white">
                                {profile?.eczane_adi}
                            </h2>
                            <p className="text-emerald-100">
                                Sicil No: {profile?.sicil_no}
                            </p>
                            <Badge
                                variant={status.text === 'Onaylı' ? 'success' : status.text === 'Reddedildi' ? 'danger' : 'warning'}
                                className="mt-2"
                            >
                                {status.text}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <CardBody>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Eczane Bilgileri</h3>
                        {!editMode ? (
                            <Button
                                variant="secondary"
                                onClick={() => setEditMode(true)}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Düzenle
                            </Button>
                        ) : (
                            <div className="flex gap-2">
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
                                    className="bg-emerald-600 hover:bg-emerald-700"
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
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    Eczacı Adı Soyadı
                                </label>
                                <p className="text-slate-800 font-medium">
                                    Ecz. {profile?.eczaci_adi} {profile?.eczaci_soyadi}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    Diploma No
                                </label>
                                <p className="text-slate-800 font-medium">{profile?.eczaci_diploma_no}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    E-posta
                                </label>
                                <p className="text-slate-800 font-medium">{profile?.email}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    Mahalle
                                </label>
                                <p className="text-slate-800 font-medium">{profile?.mahalle}</p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-4">
                            <div className={editMode ? '' : 'p-4 bg-slate-50 rounded-xl'}>
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Telefon
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="telefon"
                                        value={formData.telefon}
                                        onChange={handleChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                ) : (
                                    <p className="text-slate-800 font-medium">{profile?.telefon}</p>
                                )}
                            </div>
                            <div className={editMode ? '' : 'p-4 bg-slate-50 rounded-xl'}>
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Adres
                                </label>
                                {editMode ? (
                                    <textarea
                                        name="adres"
                                        value={formData.adres}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                ) : (
                                    <p className="text-slate-800 font-medium">{profile?.adres}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-slate-500" />
                            Banka Bilgileri
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={editMode ? '' : 'p-4 bg-slate-50 rounded-xl'}>
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    Hesap No
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="banka_hesap_no"
                                        value={formData.banka_hesap_no}
                                        onChange={handleChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                ) : (
                                    <p className="text-slate-800 font-medium">{profile?.banka_hesap_no}</p>
                                )}
                            </div>
                            <div className={editMode ? '' : 'p-4 bg-slate-50 rounded-xl'}>
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    IBAN
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="iban"
                                        value={formData.iban}
                                        onChange={handleChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                ) : (
                                    <p className="text-slate-800 font-mono text-sm font-medium">{profile?.iban}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default EczaneProfile;
