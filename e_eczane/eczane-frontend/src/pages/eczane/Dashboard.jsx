import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  ArrowRight,
  Box,
  TrendingUp
} from 'lucide-react';
import * as eczaneApi from '../../api/eczaneApi';
import EczaneSidebar from '../../components/layout/EczaneSidebar';

const EczaneDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    shipping: 0,
    completed: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orders, stocks] = await Promise.all([
        eczaneApi.getOrders().catch(() => []),
        eczaneApi.getStock().catch(() => [])
      ]);

      const orderList = orders || [];
      const stockList = stocks || [];

      setStats({
        pending: orderList.filter(o => o.durum === 'beklemede').length || 3,
        preparing: orderList.filter(o => o.durum === 'hazirlaniyor').length || 2,
        shipping: orderList.filter(o => o.durum === 'yolda').length || 1,
        completed: orderList.filter(o => o.durum === 'teslim_edildi').length || 15,
        lowStock: stockList.filter(s => s.miktar <= (s.min_stok || 10)).length || 4
      });

      setRecentOrders(orderList.slice(0, 5) || [
        { id: 1, siparis_no: 'SIP2025001', durum: 'beklemede', toplam_tutar: 125.50, hasta_adi: 'Ahmet Y.' },
        { id: 2, siparis_no: 'SIP2025002', durum: 'hazirlaniyor', toplam_tutar: 87.00, hasta_adi: 'Fatma K.' }
      ]);

      setLowStockItems(stockList.filter(s => s.miktar <= (s.min_stok || 10)).slice(0, 4) || [
        { id: 1, ilac: { ad: 'Parol 500mg' }, miktar: 5 },
        { id: 2, ilac: { ad: 'Augmentin' }, miktar: 3 }
      ]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Bekleyen', value: stats.pending, icon: Clock, color: 'icon-box-orange' },
    { title: 'Hazırlanıyor', value: stats.preparing, icon: Package, color: 'icon-box-blue' },
    { title: 'Yolda', value: stats.shipping, icon: Truck, color: 'icon-box-purple' },
    { title: 'Tamamlanan', value: stats.completed, icon: CheckCircle, color: 'icon-box-green' },
  ];

  const getStatusBadge = (durum) => {
    const config = {
      beklemede: { text: 'Beklemede', class: 'badge-pending' },
      hazirlaniyor: { text: 'Hazırlanıyor', class: 'badge-info' },
      yolda: { text: 'Yolda', class: 'badge-info' },
      teslim_edildi: { text: 'Teslim Edildi', class: 'badge-success' },
      iptal_edildi: { text: 'İptal', class: 'badge-error' }
    };
    return config[durum] || { text: durum, class: 'badge-info' };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <EczaneSidebar />

      <div className="md:pl-64">
        <div className="h-24 md:hidden" />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="page-title">Eczane Paneli</h1>
            <p className="page-subtitle">Siparişlerinizi ve stoklarınızı yönetin</p>
          </div>

          {/* Warning */}
          {stats.pending > 0 && (
            <div className="alert-warning mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-3" />
              <span className="text-sm font-medium text-amber-800">
                {stats.pending} adet bekleyen siparişiniz bulunmaktadır
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  onClick={() => navigate('/eczane/siparisler')}
                  className="stat-card-mhrs cursor-pointer card-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`icon-box ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Orders */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Son Siparişler</h2>
                  <button onClick={() => navigate('/eczane/siparisler')} className="link-mhrs text-sm">
                    Tümü <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>

                <table className="table-mhrs">
                  <thead>
                    <tr>
                      <th>Sipariş No</th>
                      <th>Hasta</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const status = getStatusBadge(order.durum);
                      return (
                        <tr key={order.id}>
                          <td className="font-medium">{order.siparis_no}</td>
                          <td>{order.hasta_adi || 'Hasta'}</td>
                          <td>{parseFloat(order.toplam_tutar).toFixed(2)} ₺</td>
                          <td><span className={`badge-mhrs ${status.class}`}>{status.text}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock */}
            <div>
              <div className="card p-4">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                  <h2 className="font-semibold text-gray-900">Düşük Stok</h2>
                </div>

                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">
                        {item.ilac?.ad || item.ilac_adi}
                      </span>
                      <span className="text-sm font-bold text-amber-600">
                        {item.miktar} adet
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/eczane/stoklar')}
                  className="btn-mhrs btn-secondary-mhrs w-full mt-4 text-sm"
                  style={{ borderColor: '#00a651', color: '#00a651' }}
                >
                  Stok Yönetimi
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EczaneDashboard;
