import React, { useState, useEffect } from 'react';
import {
  Database,
  Activity,
  Bell,
  History,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Server,
  Globe,
  ArrowRight,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import * as cosmosApi from '../../api/cosmosApi';
import BenchmarkPanel from './BenchmarkPanel';
import MainLayout from '../../components/layout/MainLayout';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const DynamoDBPanel = () => {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [bildirimler, setBildirimler] = useState([]);
  const [loglar, setLoglar] = useState([]);
  const [siparisId, setSiparisId] = useState('');
  const [siparisGecmisi, setSiparisGecmisi] = useState([]);
  const [gecmisiLoading, setGecmisiLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [healthData, statsData, bildirimData, logData] = await Promise.all([
        cosmosApi.getCosmosHealth().catch(() => null),
        cosmosApi.getCosmosStats().catch(() => null),
        cosmosApi.getAllBildirimler({ limit: 10 }).catch(() => []),
        cosmosApi.getSistemLoglari({ limit: 10 }).catch(() => [])
      ]);
      setHealth(healthData);
      setStats(statsData);
      setBildirimler(Array.isArray(bildirimData) ? bildirimData : []);
      setLoglar(Array.isArray(logData) ? logData : []);
    } catch (err) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSiparisQuery = async () => {
    if (!siparisId.trim()) {
      toast.error('Sipariş ID giriniz');
      return;
    }
    setGecmisiLoading(true);
    try {
      const data = await cosmosApi.getSiparisGecmisi(siparisId.trim());
      setSiparisGecmisi(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length === 0) {
        toast('Bu sipariş için geçmiş bulunamadı', { icon: '📭' });
      }
    } catch (err) {
      toast.error('Sorgulama sırasında hata oluştu');
      setSiparisGecmisi([]);
    } finally {
      setGecmisiLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return dateStr;
    }
  };

  const shortId = (id) => {
    if (!id) return '-';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  // SQL tabloları
  const sqlTables = [
    'users', 'hastalar', 'eczaneler', 'doktorlar', 'adminler',
    'ilaclar', 'muadil_ilaclar', 'receteler', 'recete_ilaclari',
    'siparisler', 'siparis_detaylari', 'stoklar'
  ];

  // NoSQL tabloları
  const nosqlTables = [
    { name: 'e_eczane_bildirimler', desc: 'Kullanıcı bildirimleri' },
    { name: 'e_eczane_siparis_durum_gecmisi', desc: 'Sipariş audit log' },
    { name: 'e_eczane_sistem_loglari', desc: 'Sistem olay logları' }
  ];

  const logLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'bg-red-100 text-red-700';
      case 'WARNING': return 'bg-amber-100 text-amber-700';
      case 'INFO': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <MainLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-blue-600">
              AWS DynamoDB
            </h1>
          </div>
          <p className="text-slate-500 mt-1">
            NoSQL Veritabanı Yönetimi — Polyglot Persistence: PostgreSQL (SQL) + DynamoDB (NoSQL)
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAllData}
          className="mt-4 md:mt-0"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardBody className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${health?.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Bağlantı Durumu</h3>
                <p className="text-sm text-slate-500">{health?.provider || 'AWS DynamoDB'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {health?.status === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold ring-1 ring-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-semibold ring-1 ring-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {health?.status === 'not_configured' ? 'Not Configured' : 'Error'}
                </span>
              )}
              {health?.region && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium ring-1 ring-blue-200">
                  <Globe className="w-3.5 h-3.5" />
                  {health.region}
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card hover className="group">
          <CardBody className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                <Bell className="w-6 h-6" />
              </div>
            </div>
            <h4 className="text-3xl font-bold text-slate-800">{stats?.bildirimler_count ?? '-'}</h4>
            <p className="text-sm font-medium text-slate-500 mt-1">Bildirimler</p>
          </CardBody>
        </Card>

        <Card hover className="group">
          <CardBody className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 transition-transform group-hover:scale-110">
                <History className="w-6 h-6" />
              </div>
            </div>
            <h4 className="text-3xl font-bold text-slate-800">{stats?.durum_gecmisi_count ?? '-'}</h4>
            <p className="text-sm font-medium text-slate-500 mt-1">Durum Geçmişi</p>
          </CardBody>
        </Card>

        <Card hover className="group">
          <CardBody className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <h4 className="text-3xl font-bold text-slate-800">{stats?.sistem_loglari_count ?? '-'}</h4>
            <p className="text-sm font-medium text-slate-500 mt-1">Sistem Logları</p>
          </CardBody>
        </Card>
      </div>

      {/* SQL vs NoSQL Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-bold text-slate-800">Polyglot Persistence — SQL vs NoSQL</h3>
          <p className="text-xs text-slate-500 mt-1">Verilerin veritabanlarına göre dağılımı</p>
        </CardHeader>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* PostgreSQL */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800">PostgreSQL <span className="text-xs font-normal text-slate-500">(İlişkisel)</span></h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {sqlTables.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-blue-100">
                  {t}
                </span>
              ))}
            </div>
          </div>
          {/* DynamoDB */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800">AWS DynamoDB <span className="text-xs font-normal text-slate-500">(NoSQL — Bulut)</span></h4>
            </div>
            <div className="space-y-2">
              {nosqlTables.map(t => (
                <div key={t.name} className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium ring-1 ring-orange-100">
                    {t.name}
                  </span>
                  <span className="text-xs text-slate-400">— {t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Benchmark — PostgreSQL vs DynamoDB Hız Karşılaştırması */}
      <BenchmarkPanel />

      {/* Data Tables Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Son Bildirimler */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Son Bildirimler</h3>
              <p className="text-xs text-slate-500 mt-1">DynamoDB'den son 10 bildirim</p>
            </div>
            <Bell className="w-5 h-5 text-blue-400" />
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Tarih</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">User ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Başlık</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Tip</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Okundu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bildirimler.length > 0 ? bildirimler.map((b, i) => (
                  <tr key={b.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(b.created_at)}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-mono">{shortId(b.user_id)}</td>
                    <td className="py-3 px-4 text-sm text-slate-800 font-medium truncate max-w-[150px]">{b.baslik}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{b.tip}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.okundu ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">Bildirim bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Son Sistem Logları */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Son Sistem Logları</h3>
              <p className="text-xs text-slate-500 mt-1">DynamoDB'den son 10 log</p>
            </div>
            <FileText className="w-5 h-5 text-purple-400" />
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Tarih</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Seviye</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Event</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Mesaj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loglar.length > 0 ? loglar.map((l, i) => (
                  <tr key={l.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(l.timestamp)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${logLevelColor(l.log_level)}`}>
                        {l.log_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 font-mono">{l.event_type}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 truncate max-w-[200px]">{l.message}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 text-sm">Log bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Sipariş Geçmişi Sorgulama */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-slate-800">Sipariş Durum Geçmişi Sorgulama</h3>
          <p className="text-xs text-slate-500 mt-1">Sipariş ID girerek audit trail'i görüntüleyin</p>
        </CardHeader>
        <CardBody>
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Sipariş ID giriniz..."
                value={siparisId}
                onChange={(e) => setSiparisId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSiparisQuery()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
              />
            </div>
            <Button
              onClick={handleSiparisQuery}
              disabled={gecmisiLoading}
              className="px-6"
            >
              {gecmisiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sorgula'}
            </Button>
          </div>

          {/* Timeline */}
          {siparisGecmisi.length > 0 && (
            <div className="relative pl-8 space-y-6">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-300 to-slate-200" />
              {siparisGecmisi.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 border-white shadow ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.eski_durum && (
                          <>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">{item.eski_durum}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{item.yeni_durum}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    {item.aciklama && <p className="text-sm text-slate-600">{item.aciklama}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </MainLayout>
  );
};

export default DynamoDBPanel;
