import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
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
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Header */}
                            <div className="bg-white rounded-lg shadow mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="h-6 w-6 text-yellow-600 mr-3" />
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900">Onay Bekleyen Eczaneler</h1>
                                            <p className="text-sm text-gray-500">{pharmacies.length} eczane onay bekliyor</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={fetchPharmacies}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Yenile
                                    </Button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loading />
                                </div>
                            ) : pharmacies.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {pharmacies.map((pharmacy) => (
                                        <div key={pharmacy.id} className="bg-white rounded-lg shadow overflow-hidden">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center">
                                                        <div className="bg-green-100 rounded-lg p-3">
                                                            <Building2 className="h-8 w-8 text-green-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {pharmacy.eczane_adi}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                Sicil No: {pharmacy.sicil_no}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Beklemede
                                                    </span>
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                        {pharmacy.adres}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                        {pharmacy.telefon}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                        {pharmacy.email}
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Eczacı Bilgileri</h4>
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Ad Soyad:</strong> Ecz. {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Diploma No:</strong> {pharmacy.eczaci_diploma_no}
                                                    </p>
                                                </div>

                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Banka Bilgileri</h4>
                                                    <p className="text-sm text-gray-600">
                                                        <strong>IBAN:</strong> {pharmacy.iban}
                                                    </p>
                                                </div>

                                                <div className="mt-4 text-xs text-gray-400">
                                                    Kayıt tarihi: {new Date(pharmacy.created_at).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>

                                            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
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
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Onayla
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                                        Bekleyen onay yok
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
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
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PendingPharmacies;
