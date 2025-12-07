import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import {
    ClipboardList,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Truck,
    Package
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';

const OrderList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialStatus = searchParams.get('durum') || '';

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState(initialStatus);

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
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId) => {
        try {
            await eczaneApi.approveOrder(orderId);
            fetchOrders();
        } catch (err) {
            console.error('Error approving order:', err);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await eczaneApi.updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleCancel = async (orderId) => {
        const reason = prompt('İptal nedeni:');
        if (!reason) return;

        try {
            await eczaneApi.cancelOrder(orderId, reason);
            fetchOrders();
        } catch (err) {
            console.error('Error canceling order:', err);
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
        <div className="min-h-screen bg-gray-50">
            <EczaneSidebar />

            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Header */}
                            <div className="bg-white rounded-lg shadow mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">Siparişler</h1>
                                        <p className="text-sm text-gray-500">Tüm siparişleri görüntüle ve yönet</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Filter className="w-4 h-4 text-gray-500" />
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={fetchOrders}
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
                            ) : orders.length > 0 ? (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Sipariş No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Hasta
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Adres
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tutar
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Durum
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tarih
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    İşlemler
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {order.siparis_no}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {order.hasta_adi}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {order.teslimat_adresi}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {parseFloat(order.toplam_tutar).toFixed(2)} ₺
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.durum)}`}>
                                                            {getStatusText(order.durum)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
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
                                                                    className="text-red-600"
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
                            ) : (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sipariş bulunamadı</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filter ? 'Bu durumda sipariş yok.' : 'Henüz sipariş yok.'}
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

export default OrderList;
