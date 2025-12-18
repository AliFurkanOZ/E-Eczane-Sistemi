import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';
import {
    ArrowLeft,
    Package,
    MapPin,
    Phone,
    User,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    FileText,
    Pill,
    CreditCard
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const data = await eczaneApi.getOrderDetails(orderId);
            setOrder(data);
        } catch (err) {
            console.error('Error fetching order details:', err);
            toast.error('Sipariş detayları yüklenemedi');
            navigate('/eczane/siparisler');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await eczaneApi.approveOrder(orderId);
            toast.success('Sipariş onaylandı');
            fetchOrderDetails();
        } catch (err) {
            console.error('Error approving order:', err);
            const errorMsg = err.response?.data?.detail || 'Sipariş onaylanırken hata oluştu';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        setActionLoading(true);
        try {
            await eczaneApi.updateOrderStatus(orderId, newStatus);
            toast.success('Sipariş durumu güncellendi');
            fetchOrderDetails();
        } catch (err) {
            console.error('Error updating status:', err);
            const errorMsg = err.response?.data?.detail || 'Durum güncellenirken hata oluştu';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        const reason = prompt('İptal nedeni (en az 10 karakter):');
        if (!reason) return;

        if (reason.length < 10) {
            toast.error('İptal nedeni en az 10 karakter olmalıdır');
            return;
        }

        setActionLoading(true);
        try {
            await eczaneApi.cancelOrder(orderId, reason);
            toast.success('Sipariş iptal edildi');
            fetchOrderDetails();
        } catch (err) {
            console.error('Error canceling order:', err);
            const errorMsg = err.response?.data?.detail || 'Sipariş iptal edilirken hata oluştu';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusConfig = (durum) => {
        const configs = {
            beklemede: { text: 'Beklemede', variant: 'warning', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            onaylandi: { text: 'Onaylandı', variant: 'primary', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
            hazirlaniyor: { text: 'Hazırlanıyor', variant: 'purple', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
            yolda: { text: 'Yolda', variant: 'primary', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            teslim_edildi: { text: 'Teslim Edildi', variant: 'success', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            iptal_edildi: { text: 'İptal Edildi', variant: 'danger', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
        };
        return configs[durum] || { text: durum, variant: 'secondary', icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' };
    };

    const getNextStatusOptions = (currentStatus) => {
        const transitions = {
            beklemede: [],
            onaylandi: [{ value: 'hazirlaniyor', label: 'Hazırlanıyor' }],
            hazirlaniyor: [{ value: 'yolda', label: 'Yolda' }],
            yolda: [{ value: 'teslim_edildi', label: 'Teslim Edildi' }],
            teslim_edildi: [],
            iptal_edildi: []
        };
        return transitions[currentStatus] || [];
    };

    if (loading) {
        return (
            <MainLayout sidebar={<EczaneSidebar />}>
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loading />
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout sidebar={<EczaneSidebar />}>
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold text-slate-800">Sipariş bulunamadı</h2>
                    <Button variant="primary" className="mt-4" onClick={() => navigate('/eczane/siparisler')}>
                        Siparişlere Dön
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const status = getStatusConfig(order.durum);
    const StatusIcon = status.icon;
    const nextOptions = getNextStatusOptions(order.durum);
    const canApprove = order.durum === 'beklemede';
    const canCancel = ['beklemede', 'onaylandi', 'hazirlaniyor'].includes(order.durum);

    return (
        <MainLayout sidebar={<EczaneSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/eczane/siparisler')}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Geri
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                            Sipariş #{order.siparis_no}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant={status.variant} className="text-sm">
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.text}
                            </Badge>
                            <span className="text-sm text-slate-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-600" />
                                <h3 className="font-bold text-slate-800">Hasta Bilgileri</h3>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Hasta Adı</p>
                                        <p className="font-medium text-slate-800">{order.hasta_adi || 'Belirtilmemiş'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Telefon</p>
                                        <p className="font-medium text-slate-800">{order.hasta_telefon || 'Belirtilmemiş'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Delivery Address */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-600" />
                                <h3 className="font-bold text-slate-800">Teslimat Adresi</h3>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                </div>
                                <p className="text-slate-700">
                                    {order.teslimat_adresi || 'Adres belirtilmemiş'}
                                </p>
                            </div>
                            {order.siparis_notu && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Sipariş Notu:</p>
                                    <p className="text-slate-700">{order.siparis_notu}</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Pill className="w-5 h-5 text-primary-600" />
                                <h3 className="font-bold text-slate-800">Sipariş Kalemleri</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="p-0">
                            <div className="divide-y divide-slate-100">
                                {order.detaylar?.map((item, index) => (
                                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 rounded-lg">
                                                    <Package className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.ilac_adi}</p>
                                                    <p className="text-xs text-slate-500">Barkod: {item.barkod || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-800">
                                                    {parseFloat(item.ara_toplam || 0).toFixed(2)} ₺
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {item.miktar} adet × {parseFloat(item.birim_fiyat || 0).toFixed(2)} ₺
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Cancellation Reason */}
                    {order.durum === 'iptal_edildi' && order.iptal_nedeni && (
                        <Card className="border-red-200 bg-red-50/50">
                            <CardBody>
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-700">İptal Nedeni:</p>
                                        <p className="text-red-600">{order.iptal_nedeni}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Right Column - Actions & Summary */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary-600" />
                                <h3 className="font-bold text-slate-800">Sipariş Özeti</h3>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Ürün Sayısı</span>
                                    <span className="font-medium text-slate-800">{order.detaylar?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Ödeme Durumu</span>
                                    <Badge variant={order.odeme_durumu === 'odendi' ? 'success' : 'warning'}>
                                        {order.odeme_durumu === 'odendi' ? 'Ödendi' : 'Bekliyor'}
                                    </Badge>
                                </div>
                                <div className="border-t border-slate-100 pt-3 mt-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-600">Toplam Tutar</span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            {parseFloat(order.toplam_tutar || 0).toFixed(2)} ₺
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Actions */}
                    {(canApprove || nextOptions.length > 0 || canCancel) && (
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold text-slate-800">İşlemler</h3>
                            </CardHeader>
                            <CardBody className="space-y-3">
                                {canApprove && (
                                    <Button
                                        variant="primary"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Siparişi Onayla
                                    </Button>
                                )}

                                {nextOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        variant="primary"
                                        className={`w-full ${option.value === 'hazirlaniyor' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                                option.value === 'yolda' ? 'bg-purple-600 hover:bg-purple-700' :
                                                    option.value === 'teslim_edildi' ? 'bg-green-600 hover:bg-green-700' : ''
                                            }`}
                                        onClick={() => handleUpdateStatus(option.value)}
                                        disabled={actionLoading}
                                    >
                                        {option.value === 'hazirlaniyor' && <Package className="w-4 h-4 mr-2" />}
                                        {option.value === 'yolda' && <Truck className="w-4 h-4 mr-2" />}
                                        {option.value === 'teslim_edildi' && <CheckCircle className="w-4 h-4 mr-2" />}
                                        {option.label}
                                    </Button>
                                ))}

                                {canCancel && (
                                    <Button
                                        variant="danger"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleCancel}
                                        disabled={actionLoading}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Siparişi İptal Et
                                    </Button>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {/* Prescription Info */}
                    {order.recete_id && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary-600" />
                                    <h3 className="font-bold text-slate-800">Reçete Bilgisi</h3>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-sm text-slate-600">
                                    Bu sipariş bir reçeteye bağlıdır.
                                </p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default OrderDetail;
