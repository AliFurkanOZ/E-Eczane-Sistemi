import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    ClipboardList,
    Filter,
    RefreshCw
} from 'lucide-react';
import * as adminApi from '../../../api/adminApi';

const AllOrders = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = filter ? { durum: filter } : {};
            const data = await adminApi.getAllOrders(params);
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrders([]);
        } finally {
            setLoading(false);
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

    const getPaymentColor = (durum) => {
        const colors = {
            beklemede: 'bg-yellow-100 text-yellow-800',
            odendi: 'bg-green-100 text-green-800',
            iade_edildi: 'bg-red-100 text-red-800'
        };
        return colors[durum] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentText = (durum) => {
        const texts = {
            beklemede: 'Beklemede',
            odendi: 'Ödendi',
            iade_edildi: 'İade Edildi'
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
        <MainLayout sidebar={<AdminSidebar />}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 flex items-center">
                        <ClipboardList className="w-8 h-8 text-purple-600 mr-3" />
                        Tüm Siparişler
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Toplam {orders.length} sipariş
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
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Sipariş No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Hasta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Eczane
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Tutar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Sipariş Durumu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Ödeme Durumu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {order.siparis_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {order.hasta_adi}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {order.eczane_adi}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                            {parseFloat(order.toplam_tutar).toFixed(2)} ₺
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={order.durum === 'teslim_edildi' ? 'success' : order.durum === 'iptal_edildi' ? 'danger' : order.durum === 'beklemede' ? 'warning' : 'info'}>
                                                {getStatusText(order.durum)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={order.odeme_durumu === 'odendi' ? 'success' : order.odeme_durumu === 'iade_edildi' ? 'danger' : 'warning'}>
                                                {getPaymentText(order.odeme_durumu)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
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
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">Sipariş bulunamadı</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {filter ? 'Bu filtre ile eşleşen sipariş yok.' : 'Henüz sipariş yok.'}
                        </p>
                    </CardBody>
                </Card>
            )}
        </MainLayout>
    );
};

export default AllOrders;
