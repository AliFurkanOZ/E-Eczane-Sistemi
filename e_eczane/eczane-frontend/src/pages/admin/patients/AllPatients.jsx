import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    Users,
    Filter,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Eye,
    X,
    Phone,
    Mail,
    MapPin,
    User,
    CreditCard,
    Calendar
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';
import toast from 'react-hot-toast';

const AllPatients = () => {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [filter, setFilter] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPatient(null);
    };

    const filterOptions = [
        { value: '', label: 'Tümü' },
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Pasif' }
    ];

    return (
        <>
            <MainLayout sidebar={<AdminSidebar />}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 flex items-center">
                            <Users className="w-8 h-8 text-blue-600 mr-3" />
                            Tüm Hastalar
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Toplam {patients.length} hasta
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                {filterOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={fetchPatients}
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
                ) : patients.length > 0 ? (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Hasta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            TC Kimlik No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            İletişim
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Adres
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Kayıt Tarihi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium text-sm">
                                                            {patient.ad?.charAt(0)}{patient.soyad?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {patient.ad} {patient.soyad}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {patient.tc_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {patient.telefon}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                                {patient.adres}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(patient.created_at).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(patient)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                                        title="Detay Görüntüle"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(patient.id, patient.is_active)}
                                                        className={`${patient.is_active ? 'text-emerald-600 hover:text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title={patient.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                                    >
                                                        {patient.is_active ? (
                                                            <ToggleRight className="w-7 h-7" />
                                                        ) : (
                                                            <ToggleLeft className="w-7 h-7" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <CardBody className="py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-800">Hasta bulunamadı</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {filter ? 'Bu filtre ile eşleşen hasta yok.' : 'Henüz kayıtlı hasta yok.'}
                            </p>
                        </CardBody>
                    </Card>
                )}
            </MainLayout>

            {/* Detail Modal */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeModal}
                        />

                        {/* Modal */}
                        <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle bg-white rounded-2xl shadow-xl transform transition-all">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedPatient.ad} {selectedPatient.soyad}
                                        </h3>
                                        <p className="text-sm text-gray-500">Hasta Detayları</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedPatient.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {selectedPatient.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            TC Kimlik No
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPatient.tc_no}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Telefon
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPatient.telefon}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Adres
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPatient.adres}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Kayıt Tarihi
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedPatient.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Güncelleme Tarihi
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedPatient.updated_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-end">
                                <Button variant="secondary" onClick={closeModal}>
                                    Kapat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllPatients;
