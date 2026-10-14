import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    Stethoscope,
    Filter,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Eye,
    X,
    Phone,
    Mail,
    FileText,
    Calendar,
    Building,
    Plus,
    User
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';
import toast from 'react-hot-toast';

const AllDoctors = () => {
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const [filter, setFilter] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        email: '',
        password: '',
        diploma_no: '',
        ad: '',
        soyad: '',
        uzmanlik: '',
        hastane: '',
        telefon: ''
    });
    const [addLoading, setAddLoading] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, [filter]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const params = filter !== '' ? { is_active: filter === 'true' } : {};
            const data = await adminApi.getAllDoctors(params);
            setDoctors(data || []);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (doktorId, currentActive) => {
        try {
            await adminApi.updateDoctorStatus(doktorId, { is_active: !currentActive });
            toast.success(currentActive ? 'Doktor pasif yapıldı' : 'Doktor aktif yapıldı');
            fetchDoctors();
        } catch (err) {
            console.error('Error toggling status:', err);
            toast.error('Durum güncellenirken hata oluştu');
        }
    };


    const handleViewDetails = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDoctor(null);
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setAddLoading(true);

        try {
            await adminApi.createDoctor(newDoctor);
            toast.success('Doktor başarıyla eklendi');
            setShowAddModal(false);
            setNewDoctor({
                email: '',
                password: '',
                diploma_no: '',
                ad: '',
                soyad: '',
                uzmanlik: '',
                hastane: '',
                telefon: ''
            });
            fetchDoctors();
        } catch (err) {
            console.error('Error adding doctor:', err);
            const errorMsg = err.response?.data?.detail || 'Doktor eklenirken hata oluştu';
            toast.error(errorMsg);
        } finally {
            setAddLoading(false);
        }
    };

    const filterOptions = [
        { value: '', label: 'Tümü' },
        { value: 'true', label: 'Aktif' },
        { value: 'false', label: 'Pasif' }
    ];

    return (
        <>
            <MainLayout sidebar={<AdminSidebar />}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 flex items-center">
                            <Stethoscope className="w-8 h-8 text-blue-600 mr-3" />
                            Doktor Yönetimi
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Toplam {doctors.length} doktor
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Doktor Ekle
                        </Button>
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
                            onClick={fetchDoctors}
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
                ) : doctors.length > 0 ? (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Doktor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Uzmanlık
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Hastane
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Durum
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
                                    {doctors.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {doctor.tam_ad || `Dr. ${doctor.ad} ${doctor.soyad}`}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Diploma: {doctor.diploma_no}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {doctor.uzmanlik || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {doctor.hastane || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={doctor.is_active ? 'success' : 'secondary'}>
                                                    {doctor.is_active ? 'Aktif' : 'Pasif'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(doctor.created_at).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(doctor)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                                        title="Detay Görüntüle"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(doctor.id, doctor.is_active)}
                                                        className={`${doctor.is_active ? 'text-emerald-600 hover:text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title={doctor.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                                    >
                                                        {doctor.is_active ? (
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
                            <Stethoscope className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-800">Doktor bulunamadı</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {filter ? 'Bu filtre ile eşleşen doktor yok.' : 'Henüz kayıtlı doktor yok.'}
                            </p>
                            <Button
                                variant="primary"
                                className="mt-4"
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                İlk Doktoru Ekle
                            </Button>
                        </CardBody>
                    </Card>
                )}
            </MainLayout>

            {/* Detail Modal */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeModal}
                        />
                        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-white rounded-2xl shadow-xl transform transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                        <Stethoscope className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedDoctor.tam_ad || `Dr. ${selectedDoctor.ad} ${selectedDoctor.soyad}`}
                                        </h3>
                                        <p className="text-sm text-gray-500">Doktor Detayları</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedDoctor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {selectedDoctor.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Diploma No
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedDoctor.diploma_no}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <User className="w-4 h-4 mr-2" />
                                            Ad Soyad
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {selectedDoctor.ad} {selectedDoctor.soyad}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Mail className="w-4 h-4 mr-2" />
                                            E-posta
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedDoctor.email}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Telefon
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedDoctor.telefon || '-'}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Stethoscope className="w-4 h-4 mr-2" />
                                            Uzmanlık
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedDoctor.uzmanlik || '-'}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Building className="w-4 h-4 mr-2" />
                                            Hastane
                                        </div>
                                        <p className="font-medium text-gray-900">{selectedDoctor.hastane || '-'}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
                                        <div className="flex items-center text-gray-500 text-sm mb-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Kayıt Tarihi
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedDoctor.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button variant="secondary" onClick={closeModal}>
                                    Kapat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Doctor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowAddModal(false)}
                        />
                        <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle bg-white rounded-2xl shadow-xl transform transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                        <Plus className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Yeni Doktor Ekle</h3>
                                        <p className="text-sm text-gray-500">Sisteme yeni doktor kaydı</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddDoctor} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newDoctor.ad}
                                            onChange={(e) => setNewDoctor({ ...newDoctor, ad: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newDoctor.soyad}
                                            onChange={(e) => setNewDoctor({ ...newDoctor, soyad: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newDoctor.email}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newDoctor.password}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Diploma No *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDoctor.diploma_no}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, diploma_no: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Uzmanlık</label>
                                        <input
                                            type="text"
                                            value={newDoctor.uzmanlik}
                                            onChange={(e) => setNewDoctor({ ...newDoctor, uzmanlik: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Örn: Dahiliye"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <input
                                            type="text"
                                            value={newDoctor.telefon}
                                            onChange={(e) => setNewDoctor({ ...newDoctor, telefon: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="05xx xxx xx xx"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hastane</label>
                                    <input
                                        type="text"
                                        value={newDoctor.hastane}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, hastane: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Örn: Şehir Hastanesi"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={addLoading}
                                    >
                                        {addLoading ? 'Ekleniyor...' : 'Doktor Ekle'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllDoctors;
