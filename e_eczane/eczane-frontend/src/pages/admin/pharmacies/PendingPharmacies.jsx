import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    Building2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Clock,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';
import toast from 'react-hot-toast';

const PendingPharmacies = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState([]);

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const fetchPharmacies = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getPendingPharmacies();
            setPharmacies(data || []);
        } catch (err) {
            console.error('Error fetching pharmacies:', err);
            setPharmacies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eczaneId) => {
        try {
            await adminApi.approvePharmacy(eczaneId, { onay_notu: 'Onaylandı' });
            toast.success('Eczane onaylandı!');
            fetchPharmacies();
        } catch (err) {
            console.error('Error approving pharmacy:', err);
            toast.error('Eczane onaylanırken hata oluştu');
        }
    };

    const handleReject = async (eczaneId) => {
        const reason = prompt('Red nedeni girin:');
        if (!reason) return;

        try {
            await adminApi.rejectPharmacy(eczaneId, { onay_notu: reason });
            toast.success('Eczane reddedildi');
            fetchPharmacies();
        } catch (err) {
            console.error('Error rejecting pharmacy:', err);
            toast.error('Eczane reddedilirken hata oluştu');
        }
    };

    return (
        <MainLayout sidebar={<AdminSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 flex items-center">
                        <Clock className="w-8 h-8 text-amber-500 mr-3" />
                        Onay Bekleyen Eczaneler
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {pharmacies.length} eczane onay bekliyor
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button
                        variant="secondary"
                        onClick={fetchPharmacies}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <Card>
                    <CardBody className="py-16">
                        <div className="flex justify-center">
                            <Loading />
                        </div>
                    </CardBody>
                </Card>
            ) : pharmacies.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pharmacies.map((pharmacy) => (
                        <Card key={pharmacy.id} className="overflow-hidden">
                            <CardBody>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-100 rounded-xl p-3">
                                            <Building2 className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {pharmacy.eczane_adi}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Sicil No: {pharmacy.sicil_no}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="warning">Beklemede</Badge>
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
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Mail className="w-4 h-4 mr-2 text-slate-400" />
                                        {pharmacy.email}
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                    <h4 className="text-sm font-medium text-slate-700 mb-2">Eczacı Bilgileri</h4>
                                    <p className="text-sm text-slate-600">
                                        <strong>Ad Soyad:</strong> Ecz. {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        <strong>Diploma No:</strong> {pharmacy.eczaci_diploma_no}
                                    </p>
                                </div>

                                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                    <h4 className="text-sm font-medium text-slate-700 mb-2">Banka Bilgileri</h4>
                                    <p className="text-sm text-slate-600 font-mono">
                                        <strong>IBAN:</strong> {pharmacy.iban}
                                    </p>
                                </div>

                                <div className="mt-4 text-xs text-slate-400">
                                    Kayıt tarihi: {new Date(pharmacy.created_at).toLocaleDateString('tr-TR')}
                                </div>
                            </CardBody>

                            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleReject(pharmacy.id)}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reddet
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => handleApprove(pharmacy.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Onayla
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardBody className="py-12 text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">
                            Bekleyen onay yok
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Tüm eczane kayıtları işlendi.
                        </p>
                        <div className="mt-6">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/admin/eczaneler')}
                            >
                                Tüm Eczaneleri Görüntüle
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </MainLayout>
    );
};

export default PendingPharmacies;
