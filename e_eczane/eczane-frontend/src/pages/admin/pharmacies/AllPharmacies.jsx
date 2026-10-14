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
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    ToggleLeft,
    ToggleRight,
    Eye,
    X,
    Phone,
    Mail,
    MapPin,
    User,
    CreditCard,
    FileText,
    Calendar
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';
import toast from 'react-hot-toast';

const AllPharmacies = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState([]);
    const [filter, setFilter] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    const handleViewDetails = (pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPharmacy(null);
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
        <>
            <MainLayout sidebar={<AdminSidebar />}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 flex items-center">
                            <Building2 className="w-8 h-8 text-emerald-600 mr-3" />
                            Tüm Eczaneler
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Toplam {pharmacies.length} eczane
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
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Eczane
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Eczacı
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Konum
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Onay Durumu
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
                                    {pharmacies.map((pharmacy) => {
                                        const status = getStatusBadge(pharmacy.onay_durumu);
                                        const StatusIcon = status.icon;

                                        return (
                                            <tr key={pharmacy.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {pharmacy.eczane_adi}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            Sicil: {pharmacy.sicil_no}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">
                                                        Ecz. {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {pharmacy.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {pharmacy.mahalle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={status.text === 'Onaylı' ? 'success' : status.text === 'Reddedildi' ? 'danger' : 'warning'}>
                                                        {status.text}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(pharmacy.created_at).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(pharmacy)}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                                            title="Detay Görüntüle"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        {pharmacy.onay_durumu === 'onaylandi' && (
                                                            <button
                                                                onClick={() => handleToggleStatus(pharmacy.id, pharmacy.is_active)}
                                                                className={`${pharmacy.is_active ? 'text-emerald-600 hover:text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}
                                                                title={pharmacy.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                                            >
                                                                {pharmacy.is_active ? (
                                                                    <ToggleRight className="w-7 h-7" />
                                                                ) : (
                                                                    <ToggleLeft className="w-7 h-7" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <CardBody className="py-12 text-center">
                            <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-800">Eczane bulunamadı</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {filter ? 'Bu filtre ile eşleşen eczane yok.' : 'Henüz kayıtlı eczane yok.'}
                            </p>
                        </CardBody>
                    </Card>
                )}
            </MainLayout>

            {/* Detail Modal */}
            {showModal && selectedPharmacy && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeModal}
                        />

                        {/* Modal */}
                        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-white rounded-2xl shadow-xl transform transition-all">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-xl mr-4">
                                        <Building2 className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedPharmacy.eczane_adi}
                                        </h3>
                                        <p className="text-sm text-gray-500">Eczane Detayları</p>
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
                            <div className="space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedPharmacy.onay_durumu).color}`}>
                                        {getStatusBadge(selectedPharmacy.onay_durumu).text}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedPharmacy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {selectedPharmacy.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Sicil No
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPharmacy.sicil_no}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <User className="w-4 h-4 mr-2" />
                                            Eczacı
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            Ecz. {selectedPharmacy.eczaci_adi} {selectedPharmacy.eczaci_soyadi}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Mail className="w-4 h-4 mr-2" />
                                            E-posta
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPharmacy.email}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Telefon
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPharmacy.telefon}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Adres
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {selectedPharmacy.adres}, {selectedPharmacy.mahalle}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Diploma No
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPharmacy.eczaci_diploma_no}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Kayıt Tarihi
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedPharmacy.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Banka Hesap No
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedPharmacy.banka_hesap_no || '-'}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            IBAN
                                        </div>
                                        <p className="font-medium text-gray-900 text-sm">{selectedPharmacy.iban || '-'}</p>
                                    </div>
                                </div>

                                {/* Onay Notu */}
                                {selectedPharmacy.onay_notu && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <div className="flex items-center text-yellow-700 text-sm mb-1 font-medium">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Onay Notu
                                        </div>
                                        <p className="text-yellow-800">{selectedPharmacy.onay_notu}</p>
                                    </div>
                                )}
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

export default AllPharmacies;
