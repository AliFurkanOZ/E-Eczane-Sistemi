import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    User,
    Mail,
    Phone,
    Building2,
    GraduationCap,
    Stethoscope,
    Award,
    Calendar,
    FileText,
    RefreshCw
} from 'lucide-react';
import * as doktorApi from '../../../api/doktorApi';
import MainLayout from '../../../components/layout/MainLayout';
import DoktorSidebar from '../../../components/layout/DoktorSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';

const DoktorProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [prescriptionStats, setPrescriptionStats] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [profileData, prescData] = await Promise.all([
                doktorApi.getProfile().catch(() => null),
                doktorApi.getMyPrescriptions({ page: 1, page_size: 1 }).catch(() => ({ total: 0 }))
            ]);

            if (profileData) setProfile(profileData);
            setPrescriptionStats({ total: prescData?.total || 0 });
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout sidebar={<DoktorSidebar />}>
                <Card>
                    <CardBody className="py-16">
                        <div className="flex justify-center">
                            <Loading />
                        </div>
                    </CardBody>
                </Card>
            </MainLayout>
        );
    }

    return (
        <MainLayout sidebar={<DoktorSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-600 flex items-center">
                        <User className="w-8 h-8 text-teal-600 mr-3" />
                        Profilim
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Doktor profil bilgileriniz
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button
                        variant="secondary"
                        onClick={fetchProfile}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Yenile
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold text-slate-800">Kişisel Bilgiler</h3>
                        </CardHeader>
                        <CardBody className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <User className="w-4 h-4 mr-2" />
                                    Ad
                                </div>
                                <p className="font-medium text-slate-900">{profile?.ad || '-'}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <User className="w-4 h-4 mr-2" />
                                    Soyad
                                </div>
                                <p className="font-medium text-slate-900">{profile?.soyad || '-'}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <Mail className="w-4 h-4 mr-2" />
                                    E-posta
                                </div>
                                <p className="font-medium text-slate-900">{profile?.email || user?.email || '-'}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Telefon
                                </div>
                                <p className="font-medium text-slate-900">{profile?.telefon || '-'}</p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Professional Info */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold text-slate-800">Mesleki Bilgiler</h3>
                        </CardHeader>
                        <CardBody className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    Diploma No
                                </div>
                                <p className="font-mono font-medium text-teal-600">{profile?.diploma_no || '-'}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <Stethoscope className="w-4 h-4 mr-2" />
                                    Uzmanlık Alanı
                                </div>
                                <p className="font-medium text-slate-900">{profile?.uzmanlik || 'Genel Pratisyen'}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Hastane / Klinik
                                </div>
                                <p className="font-medium text-slate-900">{profile?.hastane || '-'}</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Stats & Quick Info */}
                <div className="space-y-6">
                    {/* Profile Avatar Card */}
                    <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none">
                        <CardBody className="text-center py-8">
                            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <Stethoscope className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">
                                Dr. {profile?.ad} {profile?.soyad}
                            </h3>
                            <p className="text-teal-100">{profile?.uzmanlik || 'Genel Pratisyen'}</p>
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <Badge variant="info" className="bg-white/20 text-white border-none">
                                    <Award className="w-3 h-3 mr-1" />
                                    Aktif Doktor
                                </Badge>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold text-slate-800">İstatistikler</h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
                                <div className="flex items-center">
                                    <div className="p-2 bg-teal-100 rounded-lg mr-3">
                                        <FileText className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <span className="font-medium text-slate-700">Toplam Reçete</span>
                                </div>
                                <span className="text-2xl font-bold text-teal-600">{prescriptionStats.total}</span>
                            </div>
                        </CardBody>
                    </Card>

                    {/* System Info */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold text-slate-800">Sistem Bilgileri</h3>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Hesap Durumu</span>
                                <Badge variant="success">Aktif</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Kullanıcı Tipi</span>
                                <span className="font-medium text-slate-700">Doktor</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default DoktorProfile;
