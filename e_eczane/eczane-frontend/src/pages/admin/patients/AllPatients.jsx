import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import {
    Users,
    Filter,
    RefreshCw,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';
import toast from 'react-hot-toast';

const AllPatients = () => {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchPatients();
    }, [filter]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const params = filter !== '' ? { is_active: filter === 'active' } : {};
            const data = await adminApi.getAllPatients(params);
            setPatients(data || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (hastaId, currentActive) => {
        try {
            await adminApi.updatePatientStatus(hastaId, { is_active: !currentActive });
            toast.success(currentActive ? 'Hasta pasif yapıldı' : 'Hasta aktif yapıldı');
            fetchPatients();
        } catch (err) {
            console.error('Error toggling status:', err);
            toast.error('Durum güncellenirken hata oluştu');
        }
    };

    const filterOptions = [
        { value: '', label: 'Tümü' },
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Pasif' }
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
                                        <Users className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900">Tüm Hastalar</h1>
                                            <p className="text-sm text-gray-500">Toplam {patients.length} hasta</p>
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
                                            onClick={fetchPatients}
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
                            ) : patients.length > 0 ? (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Hasta
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    TC Kimlik No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    İletişim
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Adres
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kayıt Tarihi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Durum
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {patients.map((patient) => (
                                                <tr key={patient.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-600 font-medium text-sm">
                                                                    {patient.ad?.charAt(0)}{patient.soyad?.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {patient.ad} {patient.soyad}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {patient.tc_no}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {patient.telefon}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {patient.adres}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(patient.created_at).toLocaleDateString('tr-TR')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleToggleStatus(patient.id, true)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Pasif Yap"
                                                        >
                                                            <ToggleRight className="w-8 h-8" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Hasta bulunamadı</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filter ? 'Bu filtre ile eşleşen hasta yok.' : 'Henüz kayıtlı hasta yok.'}
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

export default AllPatients;
