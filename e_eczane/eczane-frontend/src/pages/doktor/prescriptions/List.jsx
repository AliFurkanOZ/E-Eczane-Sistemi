import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    RefreshCw,
    Calendar,
    User,
    Eye,
    X,
    Pill,
    ChevronLeft,
    ChevronRight,
    Activity,
    CreditCard
} from 'lucide-react';
import * as doktorApi from '../../../api/doktorApi';
import MainLayout from '../../../components/layout/MainLayout';
import DoktorSidebar from '../../../components/layout/DoktorSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';

const PrescriptionDetailModal = ({ isOpen, onClose, prescription, getStatusVariant, getStatusText }) => {
    if (!isOpen || !prescription) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center ring-1 ring-teal-100">
                            <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {prescription.recete_no}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Reçete Detayı
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Patient Card */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 ring-1 ring-slate-100">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <User className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{prescription.hasta_adi}</p>
                                    <p className="text-sm text-slate-500 font-mono mt-0.5">TC: {prescription.tc_no}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={getStatusVariant(prescription.durum)} className="mb-1">
                                    {getStatusText(prescription.durum)}
                                </Badge>
                                <div className="flex items-center justify-end text-xs text-slate-500 mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {prescription.tarih ? new Date(prescription.tarih).toLocaleDateString('tr-TR') : '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medications List */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                            <Pill className="w-4 h-4 mr-2 text-teal-600" />
                            İlaç Listesi ({prescription.ilaclar?.length || 0})
                        </h4>
                        <div className="space-y-2">
                            {prescription.ilaclar?.map((ilac, index) => (
                                <div key={index} className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-teal-200 hover:shadow-sm transition-all">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="font-semibold text-slate-800 truncate">{ilac.ilac_adi}</p>
                                        {ilac.kullanim_talimati && (
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ilac.kullanim_talimati}</p>
                                        )}
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 mb-1">
                                            {ilac.miktar} Kutu
                                        </span>
                                        <p className="text-sm font-bold text-teal-600">
                                            {(parseFloat(ilac.fiyat) * ilac.miktar).toFixed(2)} ₺
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium uppercase">Toplam Tutar</span>
                        <span className="text-xl font-bold text-teal-700">
                            {parseFloat(prescription.toplam_tutar || 0).toFixed(2)} ₺
                        </span>
                    </div>
                    <Button variant="secondary" onClick={onClose} className="bg-white hover:bg-slate-100 border-slate-200">
                        Kapat
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const DoktorPrescriptionList = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        fetchPrescriptions();
    }, [page]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const response = await doktorApi.getMyPrescriptions({
                page,
                page_size: pageSize
            });
            setPrescriptions(response?.items || []);
            setTotal(response?.total || 0);
            setTotalPages(response?.total_pages || 1);
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (prescription) => {
        setSelectedPrescription(prescription);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPrescription(null);
    };

    const getStatusVariant = (durum) => {
        const variants = {
            aktif: 'success',
            kullanildi: 'info',
            iptal: 'danger',
            suresi_dolmus: 'warning'
        };
        return variants[durum] || 'default';
    };

    const getStatusText = (durum) => {
        const texts = {
            aktif: 'Aktif',
            kullanildi: 'Kullanıldı',
            iptal: 'İptal',
            suresi_dolmus: 'Süresi Dolmuş'
        };
        return texts[durum] || durum;
    };

    return (
        <MainLayout sidebar={<DoktorSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-600 flex items-center">
                        <FileText className="w-8 h-8 text-teal-600 mr-3" />
                        Yazdığım Reçeteler
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Toplam {total} reçete
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/doktor/recete-yaz')}
                        className="bg-teal-600 hover:bg-teal-700"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Yeni Reçete Yaz
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={fetchPrescriptions}
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
            ) : prescriptions.length > 0 ? (
                <>
                    <Card className="overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Reçete No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Hasta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Tarih
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            İlaç Sayısı
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Toplam Tutar
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Durum
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {prescriptions.map((prescription) => (
                                        <tr key={prescription.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-mono font-medium text-teal-600">
                                                    {prescription.recete_no}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {prescription.hasta_adi}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        TC: {prescription.tc_no?.slice(0, 3)}***{prescription.tc_no?.slice(-3)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <Calendar className="w-4 h-4 mr-1.5" />
                                                    {prescription.tarih ? new Date(prescription.tarih).toLocaleDateString('tr-TR') : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Pill className="w-4 h-4 mr-1.5 text-slate-400" />
                                                    {prescription.ilaclar?.length || 0} ilaç
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                                {parseFloat(prescription.toplam_tutar || 0).toFixed(2)} ₺
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusVariant(prescription.durum)}>
                                                    {getStatusText(prescription.durum)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewDetails(prescription)}
                                                    className="text-teal-600 hover:text-teal-800 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                                                    title="Detay Görüntüle"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Toplam {total} reçeteden {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} arası gösteriliyor
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium text-slate-600 px-3">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardBody className="py-16 text-center">
                        <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            Henüz reçete yazmadınız
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Hastalarınız için yeni reçete oluşturabilirsiniz.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/doktor/recete-yaz')}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            İlk Reçeteni Yaz
                        </Button>
                    </CardBody>
                </Card>
            )}

            <PrescriptionDetailModal
                isOpen={showModal}
                onClose={closeModal}
                prescription={selectedPrescription}
                getStatusVariant={getStatusVariant}
                getStatusText={getStatusText}
            />
        </MainLayout>
    );
};

export default DoktorPrescriptionList;
