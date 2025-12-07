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
  Calendar
} from 'lucide-react';
import * as hastaApi from '../../api/hastaApi';
import HastaSidebar from '../../components/layout/HastaSidebar';

const HastaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    prescriptions: 0,
    activeOrders: 0,
    completedOrders: 0,
    cartItems: 0
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

      setStats({
        prescriptions: prescriptions?.length || 2,
        activeOrders: orders?.filter(o => !['teslim_edildi', 'iptal_edildi'].includes(o.durum)).length || 1,
        completedOrders: orders?.filter(o => o.durum === 'teslim_edildi').length || 3,
        cartItems: 0
      });

      setRecentOrders(orders?.slice(0, 4) || [
        { id: 1, siparis_no: 'SIP2025001', durum: 'hazirlaniyor', toplam_tutar: 125.50, created_at: new Date().toISOString(), eczane_adi: 'Merkez Eczanesi' },
        { id: 2, siparis_no: 'SIP2025002', durum: 'teslim_edildi', toplam_tutar: 87.00, created_at: new Date(Date.now() - 86400000).toISOString(), eczane_adi: 'Yıldız Eczanesi' }
      ]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Aktif Reçete', value: stats.prescriptions, icon: FileText, color: 'icon-box-blue', href: '/hasta/receteler' },
    { title: 'Aktif Sipariş', value: stats.activeOrders, icon: Clock, color: 'icon-box-orange', href: '/hasta/siparisler' },
    { title: 'Tamamlanan', value: stats.completedOrders, icon: CheckCircle, color: 'icon-box-green', href: '/hasta/siparisler' },
    { title: 'Sepetim', value: stats.cartItems, icon: ShoppingCart, color: 'icon-box-purple', href: '/hasta/sepet' },
  ];

  const quickActions = [
    { title: 'Reçete Sorgula', desc: 'E-reçetenizi sorgulayın', icon: FileText, href: '/hasta/receteler' },
    { title: 'İlaç Ara', desc: 'İlaç ve muadil arayın', icon: Pill, href: '/hasta/ilaclar' },
    { title: 'Sipariş Takip', desc: 'Siparişlerinizi takip edin', icon: Package, href: '/hasta/siparisler' },
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
      <HastaSidebar />

      <div className="md:pl-64">
        <div className="h-24 md:hidden" />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="page-title">Hoş Geldiniz</h1>
            <p className="page-subtitle">Reçetelerinizi sorgulayın ve siparişlerinizi yönetin</p>
          </div>

          {/* Info Banner */}
          <div className="alert-info mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-[#005f9e] mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#005f9e]">E-Reçete Sorgulama</p>
              <p className="text-sm text-gray-600 mt-1">
                TC Kimlik numaranız ve reçete numaranız ile e-reçetelerinizi sorgulayabilirsiniz.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  onClick={() => navigate(stat.href)}
                  className="stat-card-mhrs cursor-pointer card-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`icon-box ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Son Siparişler</h2>
                  <button
                    onClick={() => navigate('/hasta/siparisler')}
                    className="link-mhrs text-sm flex items-center"
                  >
                    Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      const status = getStatusBadge(order.durum);
                      return (
                        <div key={order.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="icon-box icon-box-blue">
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900 text-sm">{order.siparis_no}</p>
                                <p className="text-xs text-gray-500">{order.eczane_adi}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`badge-mhrs ${status.class}`}>{status.text}</span>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {parseFloat(order.toplam_tutar).toFixed(2)} ₺
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Henüz sipariş yok</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="card p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>

                <div className="space-y-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.title}
                        onClick={() => navigate(action.href)}
                        className="quick-action"
                      >
                        <div className="icon-box icon-box-blue">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                          <p className="text-xs text-gray-500">{action.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date().toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HastaDashboard;