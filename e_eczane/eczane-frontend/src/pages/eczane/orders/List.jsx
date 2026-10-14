import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    ClipboardList,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Truck,
    Package,
    Eye
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';

const OrderList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialStatus = searchParams.get('durum') || '';

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState(initialStatus);

    // Sync filter state with URL params when navigating from dashboard
    useEffect(() => {
        const urlDurum = searchParams.get('durum') || '';
        if (urlDurum !== filter) {
            setFilter(urlDurum);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = filter ? { durum: filter } : {};
            const data = await eczaneApi.getOrders(params);
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            toast.error('Siparişler yüklenirken hata oluştu');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId) => {
        try {
            await eczaneApi.approveOrder(orderId);
            toast.success('Sipariş onaylandı');
            fetchOrders();
        } catch (err) {
            console.error('Error approving order:', err);
            const errorMsg = err.response?.data?.detail || 'Sipariş onaylanırken hata oluştu';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await eczaneApi.updateOrderStatus(orderId, newStatus);
            toast.success('Sipariş durumu güncellendi');
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
            const errorMsg = err.response?.data?.detail || 'Durum güncellenirken hata oluştu';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const handleCancel = async (orderId) => {
        const reason = prompt('İptal nedeni (en az 10 karakter):');
        if (!reason) return;

        if (reason.length < 10) {
            toast.error('İptal nedeni en az 10 karakter olmalıdır');
            return;
        }

        try {
            await eczaneApi.cancelOrder(orderId, reason);
            toast.success('Sipariş iptal edildi');
            fetchOrders();
        } catch (err) {
            console.error('Error canceling order:', err);
            const errorMsg = err.response?.data?.detail || 'Sipariş iptal edilirken hata oluştu';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const getStatusColor = (durum) => {
        const colors = {
            beklemede: 'bg-yellow-100 text-yellow-800',
            onaylandi: 'bg-blue-100 text-blue-800',
            hazirlaniyor: 'bg-indigo-100 text-indigo-800',
            yolda: 'bg-purple-100 text-purple-800',
            teslim_edildi: 'bg-green-100 text-green-800',
            iptal_edildi: 'bg-red-100 text-red-800'
        };
        return colors[durum] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (durum) => {
        const texts = {
            beklemede: 'Beklemede',
            onaylandi: 'Onaylandı',
            hazirlaniyor: 'Hazırlanıyor',
            yolda: 'Yolda',
            teslim_edildi: 'Teslim Edildi',
            iptal_edildi: 'İptal Edildi'
        };
        return texts[durum] || durum;
    };

    const statusOptions = [
        { value: '', label: 'Tümü' },
        { value: 'beklemede', label: 'Beklemede' },
        { value: 'hazirlaniyor', label: 'Hazırlanıyor' },
        { value: 'yolda', label: 'Yolda' },
        { value: 'teslim_edildi', label: 'Teslim Edildi' },
        { value: 'iptal_edildi', label: 'İptal Edildi' }
    ];

    return (
        <MainLayout sidebar={<EczaneSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600">
                        Siparişler
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Tüm siparişleri görüntüle ve yönet
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-xl px-3 py-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent border-none text-sm focus:outline-none"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={fetchOrders}
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
            ) : orders.length > 0 ? (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Sipariş No
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Hasta
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Adres
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Tutar
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Durum
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => navigate(`/eczane/siparisler/${order.id}`)}
                                                className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer font-medium"
                                            >
                                                {order.siparis_no}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-600">
                                            {order.hasta_adi}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 max-w-xs truncate">
                                            {order.teslimat_adresi}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                            {parseFloat(order.toplam_tutar).toFixed(2)} ₺
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <Badge variant={
                                                order.durum === 'beklemede' ? 'warning' :
                                                    order.durum === 'hazirlaniyor' ? 'purple' :
                                                        order.durum === 'yolda' ? 'primary' :
                                                            order.durum === 'teslim_edildi' ? 'success' :
                                                                order.durum === 'iptal_edildi' ? 'danger' : 'secondary'
                                            }>
                                                {getStatusText(order.durum)}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm space-x-2">
                                            {order.durum === 'beklemede' && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApprove(order.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleCancel(order.id)}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {order.durum === 'hazirlaniyor' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(order.id, 'yolda')}
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                >
                                                    <Truck className="w-4 h-4 mr-1" />
                                                    Yola Çıkar
                                                </Button>
                                            )}
                                            {order.durum === 'yolda' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(order.id, 'teslim_edildi')}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Package className="w-4 h-4 mr-1" />
                                                    Teslim Et
                                                </Button>
                                            )}
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
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">Sipariş bulunamadı</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {filter ? 'Bu durumda sipariş yok.' : 'Henüz sipariş yok.'}
                        </p>
                    </CardBody>
                </Card>
            )}
        </MainLayout>
    );
};

export default OrderList;
