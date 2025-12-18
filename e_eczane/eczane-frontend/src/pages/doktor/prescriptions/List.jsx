import React, { useState, useEffect } from 'react';
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
    Activity
} from 'lucide-react';
import * as doktorApi from '../../../api/doktorApi';
import MainLayout from '../../../components/layout/MainLayout';
import DoktorSidebar from '../../../components/layout/DoktorSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';

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

            {/* Detail Modal */}
            {showModal && selectedPrescription && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        />

                        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-white rounded-2xl shadow-xl transform transition-all">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-teal-100 rounded-xl mr-4">
                                        <FileText className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {selectedPrescription.recete_no}
                                        </h3>
                                        <p className="text-sm text-slate-500">Reçete Detayları</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Patient Info */}
                            <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-full">
                                        <User className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{selectedPrescription.hasta_adi}</p>
                                        <p className="text-sm text-slate-500">TC: {selectedPrescription.tc_no}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <Badge variant={getStatusVariant(selectedPrescription.durum)}>
                                            {getStatusText(selectedPrescription.durum)}
                                        </Badge>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {selectedPrescription.tarih ? new Date(selectedPrescription.tarih).toLocaleDateString('tr-TR') : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medications List */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                                    <Pill className="w-4 h-4 mr-2" />
                                    İlaçlar ({selectedPrescription.ilaclar?.length || 0})
                                </h4>
                                <div className="space-y-3">
                                    {selectedPrescription.ilaclar?.map((ilac, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-800">{ilac.ilac_adi}</p>
                                                {ilac.kullanim_talimati && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{ilac.kullanim_talimati}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">{ilac.miktar} adet</p>
                                                <p className="text-xs text-emerald-600 font-medium">
                                                    {(parseFloat(ilac.fiyat) * ilac.miktar).toFixed(2)} ₺
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
                                <span className="font-semibold text-slate-700">Toplam Tutar</span>
                                <span className="text-xl font-bold text-teal-600">
                                    {parseFloat(selectedPrescription.toplam_tutar || 0).toFixed(2)} ₺
                                </span>
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
        </MainLayout>
    );
};

export default DoktorPrescriptionList;
