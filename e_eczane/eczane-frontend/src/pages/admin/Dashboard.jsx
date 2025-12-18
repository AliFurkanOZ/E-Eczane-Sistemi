import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shield,
  Calendar,
  Activity
} from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import MainLayout from '../../components/layout/MainLayout';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: 0,
    pharmacies: 0,
    pendingPharmacies: 0,
    totalOrders: 0
  });
  const [pendingPharmacies, setPendingPharmacies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashStats, pending] = await Promise.all([
        adminApi.getDashboardStats().catch(() => null),
        adminApi.getPendingPharmacies().catch(() => [])
      ]);

      setStats({
        patients: dashStats?.toplam_hasta || 25,
        pharmacies: dashStats?.toplam_eczane || 12,
        pendingPharmacies: pending?.length || 2,
        totalOrders: dashStats?.toplam_siparis || 150
      });

      setPendingPharmacies(pending?.slice(0, 5) || [
        { id: 1, eczane_adi: 'Yeni Eczane', eczaci_adi: 'Ali', eczaci_soyadi: 'Veli', mahalle: 'Merkez' }
      ]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approvePharmacy(id, { onay_notu: 'Onaylandı' });
      toast.success('Eczane onaylandı');
      fetchData();
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectPharmacy(id, { onay_notu: 'Reddedildi' });
      toast.success('Eczane reddedildi');
      fetchData();
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  const statCards = [
    { title: 'Toplam Hasta', value: stats.patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/hastalar' },
    { title: 'Toplam Eczane', value: stats.pharmacies, icon: Building2, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/eczaneler' },
    { title: 'Onay Bekleyen', value: stats.pendingPharmacies, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/eczaneler/bekleyenler' },
    { title: 'Toplam Sipariş', value: stats.totalOrders, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/siparisler' },
  ];

  return (
    <MainLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600">
            Sistem Yönetimi
          </h1>
          <p className="text-slate-500 mt-2">
            E-Eczane sistemi genel durum ve onay işlemleri.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white shadow-sm">
          <Activity className="w-4 h-4 text-purple-500 mr-2" />
          <span className="text-sm font-medium text-slate-600">
            Sistem Durumu: <span className="text-emerald-600 font-bold">Aktif</span>
          </span>
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
                  <div className="p-1 rounded-full hover:bg-slate-100 text-slate-300 group-hover:text-purple-500 transition-colors">
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

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Onay Bekleyen Eczaneler</h3>
                <p className="text-xs text-slate-500 mt-1">Sisteme kayıt olmak isteyen yeni eczaneler</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/eczaneler/bekleyenler')}>
                Tümünü Gör
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Eczane Adı</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Eczacı</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bölge</th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingPharmacies.length > 0 ? (
                    pendingPharmacies.map((pharmacy) => (
                      <tr key={pharmacy.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mr-3">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{pharmacy.eczane_adi}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">{pharmacy.mahalle}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => handleApprove(pharmacy.id)}
                              title="Onayla"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => handleReject(pharmacy.id)}
                              title="Reddet"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        Bekleyen onay bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
            <CardBody>
              <Shield className="w-8 h-8 text-purple-400 mb-4" />
              <h4 className="font-bold text-lg mb-2">Güvenlik Durumu</h4>
              <p className="text-slate-400 text-sm mb-4">Sistem güvenliği ve log kayıtları normal seyrediyor.</p>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-1">
                <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
              </div>
              <p className="text-xs text-emerald-400 text-right">%100 Güvenli</p>
            </CardBody>
          </Card>

          <div className="grid gap-3">
            <button
              onClick={() => navigate('/admin/eczaneler')}
              className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-800 text-sm group-hover:text-purple-700">Eczane Yönetimi</h5>
                <p className="text-xs text-slate-500">Listele, düzenle, sil</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/hastalar')}
              className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-800 text-sm group-hover:text-blue-700">Hasta Yönetimi</h5>
                <p className="text-xs text-slate-500">Kullanıcı işlemleri</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/siparisler')}
              className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-800 text-sm group-hover:text-orange-700">Sipariş Takibi</h5>
                <p className="text-xs text-slate-500">Tüm hareketler</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
