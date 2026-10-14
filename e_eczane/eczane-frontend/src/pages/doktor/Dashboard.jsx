import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    FilePlus,
    FileText,
    User,
    ArrowRight,
    Calendar,
    Stethoscope,
    Activity
} from 'lucide-react';
import * as doktorApi from '../../api/doktorApi';
import MainLayout from '../../components/layout/MainLayout';
import DoktorSidebar from '../../components/layout/DoktorSidebar';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DoktorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayPrescriptions: 0,
        totalPrescriptions: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, prescData] = await Promise.all([
                doktorApi.getProfile().catch(() => null),
                doktorApi.getMyPrescriptions({ page: 1, page_size: 5 }).catch(() => ({ items: [], total: 0 }))
            ]);

            if (profileData) setProfile(profileData);

            const prescItems = prescData?.items || [];
            setPrescriptions(prescItems);

            // Today's prescriptions
            const today = new Date().toISOString().split('T')[0];
            const todayCount = prescItems.filter(p => p.tarih === today).length;

            setStats({
                todayPrescriptions: todayCount,
                totalPrescriptions: prescData?.total || 0
            });
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Bugün Yazılan',
            value: stats.todayPrescriptions,
            icon: FilePlus,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            href: '/doktor/recetelerim'
        },
        {
            title: 'Toplam Reçete',
            value: stats.totalPrescriptions,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/doktor/recetelerim'
        },
    ];

    const quickActions = [
        {
            title: 'Reçete Yaz',
            desc: 'Hastaya yeni reçete oluştur',
            icon: FilePlus,
            href: '/doktor/recete-yaz',
            primary: true
        },
        {
            title: 'Reçetelerim',
            desc: 'Yazdığınız reçeteleri görüntüleyin',
            icon: FileText,
            href: '/doktor/recetelerim'
        },
        {
            title: 'Profilim',
            desc: 'Profil bilgilerinizi düzenleyin',
            icon: User,
            href: '/doktor/profil'
        },
    ];

    return (
        <MainLayout sidebar={<DoktorSidebar />}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                        Hoş Geldiniz, {profile?.tam_ad || profile?.ad || 'Doktor'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {profile?.hastane || 'E-Eczane Doktor Paneli'}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white shadow-sm">
                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm font-medium text-slate-600">
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Quick Action - Primary */}
            <div className="mb-8">
                <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-none cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/doktor/recete-yaz')}>
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <FilePlus className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Yeni Reçete Yaz</h2>
                                    <p className="text-teal-100">Hastanın TC numarasını girerek reçete oluşturun</p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            hover
                            className="cursor-pointer group"
                            onClick={() => navigate(stat.href)}
                        >
                            <CardBody className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="p-1 rounded-full hover:bg-slate-100 text-slate-300 group-hover:text-teal-500 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-bold text-slate-800">{stat.value}</h4>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Prescriptions & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Prescriptions */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Son Yazdığım Reçeteler</h3>
                                <p className="text-xs text-slate-500 mt-1">Son 5 reçeteniz</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/doktor/recetelerim')}>
                                Tümünü Gör
                            </Button>
                        </CardHeader>
                        <div className="divide-y divide-slate-100">
                            {prescriptions.length > 0 ? (
                                prescriptions.map((presc) => (
                                    <div key={presc.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-800">{presc.recete_no}</p>
                                                <p className="text-sm text-slate-500">
                                                    {presc.hasta_adi} - TC: {presc.tc_no?.slice(0, 3)}***
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {presc.ilaclar?.length || 0} ilaç
                                                </p>
                                                <p className="text-xs text-slate-500">{presc.tarih}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                    <p>Henüz reçete yazmadınız</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 px-1">Hızlı İşlemler</h3>
                    {quickActions.slice(1).map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.title}
                                onClick={() => navigate(action.href)}
                                className="group relative flex items-center w-full p-4 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-left"
                            >
                                <div className="p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors mr-4">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{action.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
    );
};

export default DoktorDashboard;
