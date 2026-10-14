import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText,
  Package,
  ShoppingCart,
  Pill,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search
} from 'lucide-react';
import * as hastaApi from '../../api/hastaApi';
import MainLayout from '../../components/layout/MainLayout';
import HastaSidebar from '../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const HastaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sepet } = useSelector((state) => state.hasta);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    prescriptions: 0,
    activeOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prescriptions, orders] = await Promise.all([
        hastaApi.getPrescriptions().catch(() => []),
        hastaApi.getOrders().catch(() => [])
      ]);

      // Aktif reçeteleri say (sadece 'aktif' durumunda olanlar)
      const activePrescriptions = Array.isArray(prescriptions)
        ? prescriptions.filter(p => p.durum === 'aktif').length
        : 0;

      // Aktif siparişleri say (teslim edilmemiş ve iptal edilmemiş)
      const activeOrders = Array.isArray(orders)
        ? orders.filter(o => !['teslim_edildi', 'iptal_edildi'].includes(o.durum)).length
        : 0;

      // Tamamlanan siparişleri say
      const completedOrders = Array.isArray(orders)
        ? orders.filter(o => o.durum === 'teslim_edildi').length
        : 0;

      setStats({
        prescriptions: activePrescriptions,
        activeOrders: activeOrders,
        completedOrders: completedOrders
      });

      // Son siparişleri göster
      if (Array.isArray(orders) && orders.length > 0) {
        setRecentOrders(orders.slice(0, 4));
      } else {
        setRecentOrders([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStats({ prescriptions: 0, activeOrders: 0, completedOrders: 0 });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Aktif Reçete', value: stats.prescriptions, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', href: '/hasta/receteler' },
    { title: 'Aktif Sipariş', value: stats.activeOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', href: '/hasta/siparisler' },
    { title: 'Tamamlanan', value: stats.completedOrders, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/hasta/siparisler' },
    { title: 'Sepetim', value: sepet?.length || 0, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50', href: '/hasta/sepet' },
  ];

  const quickActions = [
    { title: 'Reçete Sorgula', desc: 'E-reçetenizi anında sorgulayın', icon: FileText, href: '/hasta/receteler', color: 'primary' },
    { title: 'İlaç Ara', desc: 'Stok ve fiyat bilgisi alın', icon: Search, href: '/hasta/ilaclar', color: 'secondary' },
    { title: 'Sipariş Takip', desc: 'Kargonuz nerede?', icon: Package, href: '/hasta/siparisler', color: 'warning' },
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
    <MainLayout sidebar={<HastaSidebar />}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Hoş Geldiniz, {user?.name || 'Hasta'}
          </h1>
          <p className="text-slate-500 mt-2">
            Sağlık süreçlerinizi kolayca yönetin ve takip edin.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-600">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-white border border-primary-100/50 flex items-start shadow-sm">
        <div className="p-2 bg-primary-100 rounded-xl mr-4 flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">E-Reçete Hatırlatması</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            TC Kimlik numaranız ve reçete numaranız ile e-reçetelerinizi sorgulayabilir, anlaşmalı eczanelerden anında sipariş oluşturabilirsiniz.
          </p>
        </div>
      </div>

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
                  <div className="p-1 rounded-full hover:bg-slate-100 text-slate-300 group-hover:text-primary-500 transition-colors">
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
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Son Siparişler</h3>
                <p className="text-xs text-slate-500 mt-1">Son verdiğiniz siparişlerin durumu</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/hasta/siparisler')}>
                Tümünü Gör
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sipariş No</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Eczane</th>
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
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <Package className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="text-sm font-medium text-slate-900">{order.siparis_no}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-500">{order.eczane_adi}</td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-700">
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
                        Henüz sipariş bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 px-1">Hızlı İşlemler</h3>
          <div className="grid gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.href)}
                  className="group relative flex items-center p-4 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className={`p-3 rounded-xl bg-${action.color}-50 text-${action.color}-600 group-hover:scale-110 transition-transform mr-4`}>
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{action.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>

          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none">
            <CardBody className="relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Mobil Uygulama</h4>
                <p className="text-primary-100 text-sm mb-4">E-Eczane deneyimini cebinizde yaşayın.</p>
                <Button size="sm" variant="ghost" className="bg-white text-primary-900 font-bold hover:bg-white/90 border-none shadow-md">
                  Yakında
                </Button>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 right-0 -mb-4 -mr-4 w-32 h-32 bg-primary-400 opacity-20 rounded-full blur-xl"></div>
            </CardBody>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HastaDashboard;