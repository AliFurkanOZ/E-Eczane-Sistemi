import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import {
    Building2,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';
import toast from 'react-hot-toast';

const AllPharmacies = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchPharmacies();
    }, [filter]);

    const fetchPharmacies = async () => {
        setLoading(true);
        try {
            const params = filter ? { onay_durumu: filter } : {};
            const data = await adminApi.getAllPharmacies(params);
            setPharmacies(data || []);
        } catch (err) {
            console.error('Error fetching pharmacies:', err);
            setPharmacies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (eczaneId, currentActive) => {
        try {
            await adminApi.updatePharmacyStatus(eczaneId, { is_active: !currentActive });
            toast.success(currentActive ? 'Eczane pasif yapıldı' : 'Eczane aktif yapıldı');
            fetchPharmacies();
        } catch (err) {
            console.error('Error toggling status:', err);
            toast.error('Durum güncellenirken hata oluştu');
        }
    };

    const getStatusBadge = (onayDurumu) => {
        const badges = {
            beklemede: { text: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            onaylandi: { text: 'Onaylı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            reddedildi: { text: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle }
        };
        return badges[onayDurumu] || { text: onayDurumu, color: 'bg-gray-100 text-gray-800', icon: Clock };
    };

    const filterOptions = [
        { value: '', label: 'Tümü' },
        { value: 'beklemede', label: 'Beklemede' },
        { value: 'onaylandi', label: 'Onaylı' },
        { value: 'reddedildi', label: 'Reddedildi' }
    ];

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
                                        <Building2 className="h-6 w-6 text-green-600 mr-3" />
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900">Tüm Eczaneler</h1>
                                            <p className="text-sm text-gray-500">Toplam {pharmacies.length} eczane</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Filter className="w-4 h-4 text-gray-500" />
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            >
                                                {filterOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
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
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loading />
                                </div>
                            ) : pharmacies.length > 0 ? (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Eczane
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Eczacı
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Konum
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Onay Durumu
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kayıt Tarihi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Aktif/Pasif
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pharmacies.map((pharmacy) => {
                                                const status = getStatusBadge(pharmacy.onay_durumu);
                                                const StatusIcon = status.icon;

                                                return (
                                                    <tr key={pharmacy.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {pharmacy.eczane_adi}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Sicil: {pharmacy.sicil_no}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                Ecz. {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {pharmacy.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {pharmacy.mahalle}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(pharmacy.created_at).toLocaleDateString('tr-TR')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {pharmacy.onay_durumu === 'onaylandi' && (
                                                                <button
                                                                    onClick={() => handleToggleStatus(pharmacy.id, true)}
                                                                    className="text-green-600 hover:text-green-800"
                                                                    title="Pasif Yap"
                                                                >
                                                                    <ToggleRight className="w-8 h-8" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Eczane bulunamadı</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filter ? 'Bu filtre ile eşleşen eczane yok.' : 'Henüz kayıtlı eczane yok.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AllPharmacies;
