import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as hastaApi from '../../../api/hastaApi';
import {
  Package,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hastaApi.getOrders();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Siparişler yüklenirken bir hata oluştu.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    // Simple confirmation - no reason needed from patient
    if (!window.confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await hastaApi.cancelOrder(orderId);
      toast.success('Sipariş başarıyla iptal edildi');
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMsg = err.response?.data?.detail || 'Sipariş iptal edilirken hata oluştu';
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
  };

  const getStatusConfig = (durum) => {
    const config = {
      beklemede: {
        text: 'Beklemede',
        variant: 'warning',
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      },
      onaylandi: {
        text: 'Onaylandı',
        variant: 'primary',
        icon: CheckCircle,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      },
      hazirlaniyor: {
        text: 'Hazırlanıyor',
        variant: 'purple',
        icon: Package,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
      },
      yolda: {
        text: 'Yolda',
        variant: 'primary',
        icon: Truck,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      },
      teslim_edildi: {
        text: 'Teslim Edildi',
        variant: 'success',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
      },
      iptal_edildi: {
        text: 'İptal Edildi',
        variant: 'danger',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50'
      }
    };
    return config[durum] || {
      text: durum,
      variant: 'secondary',
      icon: Package,
      color: 'text-slate-600',
      bg: 'bg-slate-50'
    };
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['teslim_edildi', 'iptal_edildi'].includes(order.durum);
    if (filter === 'completed') return order.durum === 'teslim_edildi';
    if (filter === 'cancelled') return order.durum === 'iptal_edildi';
    return true;
  });

  const filterOptions = [
    { key: 'all', label: 'Tümü', count: orders.length },
    { key: 'active', label: 'Aktif', count: orders.filter(o => !['teslim_edildi', 'iptal_edildi'].includes(o.durum)).length },
    { key: 'completed', label: 'Tamamlanan', count: orders.filter(o => o.durum === 'teslim_edildi').length },
    { key: 'cancelled', label: 'İptal', count: orders.filter(o => o.durum === 'iptal_edildi').length }
  ];

  return (
    <MainLayout sidebar={<HastaSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Siparişlerim
          </h1>
          <p className="text-slate-500 mt-2">
            Tüm siparişlerinizi görüntüleyin ve takip edin.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/hasta/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <CardBody className="py-3">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === option.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {option.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === option.key
                  ? 'bg-primary-200 text-primary-800'
                  : 'bg-slate-200 text-slate-700'
                  }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-800">Uyarı</h4>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <Card>
          <CardBody className="py-16">
            <div className="flex justify-center">
              <Loading />
            </div>
          </CardBody>
        </Card>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = getStatusConfig(order.durum);
            const StatusIcon = status.icon;
            const canCancel = ['beklemede', 'onaylandi'].includes(order.durum);

            return (
              <Card key={order.id} hover className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Status Indicator */}
                  <div className={`lg:w-2 ${status.bg}`} />

                  <div className="flex-1 p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${status.bg}`}>
                          <StatusIcon className={`w-5 h-5 ${status.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {order.siparis_no}
                          </h3>
                          <div className="flex items-center text-sm text-slate-500 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(order.created_at).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center gap-3">
                        <Badge variant={status.variant}>{status.text}</Badge>
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            İptal Et
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Pharmacy Info */}
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Eczane:</span> {order.eczane_adi || 'Belirtilmemiş'}
                      </p>
                      {order.teslimat_adresi && (
                        <p className="text-sm text-slate-500 mt-1">
                          <span className="font-medium">Teslimat:</span> {order.teslimat_adresi}
                        </p>
                      )}
                    </div>

                    {/* Order Items */}
                    {order.detaylar && order.detaylar.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Sipariş Kalemleri:
                        </h4>
                        <div className="grid gap-2">
                          {order.detaylar.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-white border border-slate-100 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-800">{item.ilac_adi}</span>
                                <span className="text-slate-500 text-sm">x{item.miktar}</span>
                              </div>
                              <span className="font-medium text-slate-700">
                                {(item.birim_fiyat * item.miktar).toFixed(2)} ₺
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cancellation Reason - shown for cancelled orders */}
                    {order.durum === 'iptal_edildi' && order.iptal_nedeni && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-700">İptal Nedeni:</p>
                            <p className="text-sm text-red-600">{order.iptal_nedeni}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-end pt-3 border-t border-slate-100">
                      <div className="text-right">
                        <span className="text-sm text-slate-500">Toplam Tutar</span>
                        <p className="text-xl font-bold text-primary-600">
                          {parseFloat(order.toplam_tutar || 0).toFixed(2)} ₺
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {filter === 'all' ? 'Henüz Siparişiniz Yok' : 'Sipariş Bulunamadı'}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {filter === 'all'
                  ? 'İlk siparişinizi oluşturmak için reçetelerinizden veya ilaç arama sayfasından ürün ekleyebilirsiniz.'
                  : 'Bu filtreye uygun sipariş bulunmuyor. Diğer filtreleri deneyebilirsiniz.'
                }
              </p>
              {filter === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => navigate('/hasta/receteler')}
                  >
                    Reçetelerime Git
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/hasta/ilaclar')}
                  >
                    İlaç Ara
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </MainLayout>
  );
};

export default OrderList;