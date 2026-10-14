import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    Box,
    Plus,
    Trash2,
    Edit2,
    RefreshCw,
    AlertTriangle,
    Package,
    Eye
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';
import MedicineDetailModal from '../../../components/pharmacy/MedicineDetailModal';

const StockList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stocks, setStocks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const data = await eczaneApi.getStock();
            setStocks(data || []);
        } catch (err) {
            console.error('Error fetching stocks:', err);
            setStocks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (stockId) => {
        if (!confirm('Bu stok kaydını silmek istediğinize emin misiniz?')) return;

        try {
            await eczaneApi.deleteStock(stockId);
            fetchStocks();
        } catch (err) {
            console.error('Error deleting stock:', err);
        }
    };

    const handleUpdate = async (stockId) => {
        const newMiktar = parseInt(editValue);
        if (isNaN(newMiktar) || newMiktar < 0) {
            alert('Geçerli bir miktar girin');
            return;
        }

        try {
            await eczaneApi.updateStock(stockId, { miktar: newMiktar });
            setEditingId(null);
            fetchStocks();
        } catch (err) {
            console.error('Error updating stock:', err);
        }
    };

    const startEditing = (stock) => {
        setEditingId(stock.id);
        setEditValue(stock.miktar.toString());
    };

    const getStockStatus = (miktar, minStok) => {
        if (miktar === 0) return { text: 'Tükendi', color: 'bg-red-100 text-red-800' };
        if (miktar <= minStok) return { text: 'Düşük', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Yeterli', color: 'bg-green-100 text-green-800' };
    };

    return (
        <>
            <MainLayout sidebar={<EczaneSidebar />}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600">
                            Stok Yönetimi
                        </h1>
                        <p className="text-slate-500 mt-2">
                            İlaç stoklarınızı görüntüleyin ve yönetin
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/eczane/urun-ekle')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ürün Ekle
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={fetchStocks}
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
                ) : stocks.length > 0 ? (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            İlaç
                                        </th>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Barkod
                                        </th>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Fiyat
                                        </th>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Miktar
                                        </th>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Durum
                                        </th>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stocks.map((stock) => {
                                        const status = getStockStatus(stock.miktar, stock.min_stok || 10);
                                        return (
                                            <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-slate-100 rounded-lg mr-3">
                                                            <Package className="h-5 w-5 text-slate-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">
                                                                {stock.ilac?.ad || stock.ilac_adi || 'Bilinmiyor'}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {stock.ilac?.kategori || stock.kategori || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-500">
                                                    {stock.ilac?.barkod || stock.barkod || '-'}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                    {stock.ilac?.fiyat ? `${parseFloat(stock.ilac.fiyat).toFixed(2)} ₺` : '-'}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    {editingId === stock.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500"
                                                                min="0"
                                                            />
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleUpdate(stock.id)}
                                                                className="bg-emerald-600"
                                                            >
                                                                ✓
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => setEditingId(null)}
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-medium text-slate-800">
                                                            {stock.miktar} adet
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <Badge variant={
                                                        status.text === 'Tükendi' ? 'danger' :
                                                            status.text === 'Düşük' ? 'warning' : 'success'
                                                    }>
                                                        {status.text === 'Düşük' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                        {status.text}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap text-sm space-x-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedStock(stock);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                        title="Detayları Görüntüle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => startEditing(stock)}
                                                        disabled={editingId === stock.id}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleDelete(stock.id)}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <CardBody className="py-12 text-center">
                            <Box className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-800">Stok bulunamadı</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Henüz stok kaydı yok. Ürün ekleyerek başlayın.
                            </p>
                            <div className="mt-6">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/eczane/urun-ekle')}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ürün Ekle
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </MainLayout>

            {/* İlaç Detay Modal */}
            <MedicineDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedStock(null);
                }}
                stock={selectedStock}
            />
        </>
    );
};

export default StockList;
