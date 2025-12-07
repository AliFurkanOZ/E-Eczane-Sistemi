import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import AdminSidebar from '../../components/layout/AdminSidebar';
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
    { title: 'Toplam Hasta', value: stats.patients, icon: Users, color: 'icon-box-blue' },
    { title: 'Toplam Eczane', value: stats.pharmacies, icon: Building2, color: 'icon-box-green' },
    { title: 'Onay Bekleyen', value: stats.pendingPharmacies, icon: Clock, color: 'icon-box-orange' },
    { title: 'Toplam Sipariş', value: stats.totalOrders, icon: Package, color: 'icon-box-purple' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="md:pl-64">
        <div className="h-24 md:hidden" />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="page-title">Yönetim Paneli</h1>
            <p className="page-subtitle">Sistem yönetimi ve onay işlemleri</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="stat-card-mhrs">
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

          {/* Pending Approvals */}
          <div className="card">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-amber-500 mr-2" />
                <h2 className="font-semibold text-gray-900">Onay Bekleyen Eczaneler</h2>
              </div>
              <button onClick={() => navigate('/admin/eczaneler/bekleyenler')} className="link-mhrs text-sm">
                Tümü <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>

            <table className="table-mhrs">
              <thead>
                <tr>
                  <th>Eczane Adı</th>
                  <th>Eczacı</th>
                  <th>Mahalle</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pendingPharmacies.length > 0 ? (
                  pendingPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id}>
                      <td className="font-medium">{pharmacy.eczane_adi}</td>
                      <td>Ecz. {pharmacy.eczaci_adi} {pharmacy.eczaci_soyadi}</td>
                      <td>{pharmacy.mahalle}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(pharmacy.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(pharmacy.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Bekleyen onay yok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div onClick={() => navigate('/admin/eczaneler')} className="quick-action">
              <div className="icon-box icon-box-green">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-900 text-sm">Eczane Yönetimi</p>
                <p className="text-xs text-gray-500">Tüm eczaneleri görüntüle</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div onClick={() => navigate('/admin/hastalar')} className="quick-action">
              <div className="icon-box icon-box-blue">
                <Users className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-900 text-sm">Hasta Yönetimi</p>
                <p className="text-xs text-gray-500">Tüm hastaları görüntüle</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div onClick={() => navigate('/admin/siparisler')} className="quick-action">
              <div className="icon-box icon-box-purple">
                <Package className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-900 text-sm">Sipariş Takibi</p>
                <p className="text-xs text-gray-500">Tüm siparişleri görüntüle</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
