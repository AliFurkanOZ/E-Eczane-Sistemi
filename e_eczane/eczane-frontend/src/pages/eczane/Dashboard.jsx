import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Store,
  Calendar
} from 'lucide-react';
import * as eczaneApi from '../../api/eczaneApi';
import MainLayout from '../../components/layout/MainLayout';
import EczaneSidebar from '../../components/layout/EczaneSidebar';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

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

      // Calculate real stats - no fake fallback values
      setStats({
        pending: orderList.filter(o => o.durum === 'beklemede').length,
        preparing: orderList.filter(o => o.durum === 'hazirlaniyor').length,
        shipping: orderList.filter(o => o.durum === 'yolda').length,
        completed: orderList.filter(o => o.durum === 'teslim_edildi').length,
        lowStock: stockList.filter(s => s.miktar <= (s.min_stok || 10)).length
      });

      // Set recent orders - real data only
      setRecentOrders(orderList.slice(0, 5));

      // Set low stock items - real data only
      setLowStockItems(stockList.filter(s => s.miktar <= (s.min_stok || 10)).slice(0, 4));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stat cards with proper filter navigation
  const statCards = [
    { title: 'Bekleyen Sipariş', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/eczane/siparisler?durum=beklemede' },
    { title: 'Hazırlanıyor', value: stats.preparing, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', href: '/eczane/siparisler?durum=hazirlaniyor' },
    { title: 'Yolda', value: stats.shipping, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', href: '/eczane/siparisler?durum=yolda' },
    { title: 'Tamamlanan', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/eczane/siparisler?durum=teslim_edildi' },
  ];


  const getStatusBadge = (durum) => {
    const config = {
      beklemede: { text: 'Beklemede', variant: 'warning' },
      hazirlaniyor: { text: 'Hazırlanıyor', variant: 'purple' },
      yolda: { text: 'Yolda', variant: 'primary' },
      teslim_edildi: { text: 'Teslim Edildi', variant: 'success' },
      iptal_edildi: { text: 'İptal', variant: 'danger' }
    };
    return config[durum] || { text: durum, variant: 'secondary' };
  };

  return (
    <MainLayout sidebar={<EczaneSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600">
            Eczane Yönetim Paneli
          </h1>
          <p className="text-slate-500 mt-2">
            Siparişlerinizi ve stok durumunuzu buradan takip edebilirsiniz.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white shadow-sm">
          <Calendar className="w-4 h-4 text-emerald-500 mr-2" />
          <span className="text-sm font-medium text-slate-600">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {stats.pending > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-white border border-amber-100/50 flex items-start shadow-sm animate-pulse-soft">
          <div className="p-2 bg-amber-100 rounded-xl mr-4 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Bekleyen Siparişler</h3>
              <p className="text-sm text-slate-600 mt-1">
                Şu anda onay bekleyen <span className="font-bold text-amber-600">{stats.pending}</span> adet yeni siparişiniz bulunmaktadır.
              </p>
            </div>
            <Button size="sm" variant="outline" className="ml-4 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => navigate('/eczane/siparisler')}>
              Görüntüle
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              hover
              className="cursor-pointer group"
              onClick={() => navigate(stat.href)}
            >
              <CardBody className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="p-1 rounded-full hover:bg-slate-100 text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-slate-800">{stat.value}</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Son Siparişler</h3>
                <p className="text-xs text-slate-500 mt-1">En son gelen sipariş hareketleri</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/eczane/siparisler')}>
                Tümünü Gör
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sipariş No</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hasta</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tutar</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      const status = getStatusBadge(order.durum);
                      return (
                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium text-slate-900">{order.siparis_no}</td>
                          <td className="py-4 px-6 text-sm text-slate-500">{order.hasta_adi || 'Hasta'}</td>
                          <td className="py-4 px-6 text-sm font-semibold text-emerald-600">
                            {parseFloat(order.toplam_tutar).toFixed(2)} ₺
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={status.variant}>{status.text}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        Sipariş bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <Card className="h-full border-amber-200/50">
            <CardHeader className="border-b border-amber-100 bg-amber-50/30">
              <div className="flex items-center text-amber-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <h3 className="font-bold">Kritik Stok</h3>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {lowStockItems.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-amber-50/30 transition-colors flex items-center justify-between group">
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-amber-900 transition-colors">
                          {item.ilac?.ad || item.ilac_adi}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Stokta Kalan: <span className="font-bold text-red-500">{item.miktar}</span></p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-amber-600 hover:bg-amber-100 hover:text-amber-700">
                        Stok Ekle
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p>Tüm stoklarınız yeterli seviyede.</p>
                </div>
              )}
              <div className="p-4 border-t border-slate-100">
                <Button variant="secondary" className="w-full" onClick={() => navigate('/eczane/stoklar')}>
                  Tüm Stokları Yönet
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default EczaneDashboard;
