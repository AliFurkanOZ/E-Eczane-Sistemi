import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EczaneSidebar from '../../../components/layout/EczaneSidebar';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import {
    Box,
    Plus,
    Trash2,
    Edit2,
    RefreshCw,
    AlertTriangle,
    Package
} from 'lucide-react';
import * as eczaneApi from '../../../api/eczaneApi';

const StockList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stocks, setStocks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

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
        <div className="min-h-screen bg-gray-50">
            <EczaneSidebar />

            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Header */}
                            <div className="bg-white rounded-lg shadow mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">Stok Yönetimi</h1>
                                        <p className="text-sm text-gray-500">İlaç stoklarınızı görüntüleyin ve yönetin</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate('/eczane/urun-ekle')}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Ürün Ekle
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={fetchStocks}
                                            className="flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Yenile
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loading />
                                </div>
                            ) : stocks.length > 0 ? (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    İlaç
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Barkod
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fiyat
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Miktar
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Durum
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    İşlemler
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stocks.map((stock) => {
                                                const status = getStockStatus(stock.miktar, stock.min_stok || 10);
                                                return (
                                                    <tr key={stock.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Package className="h-8 w-8 text-gray-400 mr-3" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {stock.ilac?.ad || stock.ilac_adi || 'Bilinmiyor'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {stock.ilac?.kategori || stock.kategori || '-'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stock.ilac?.barkod || stock.barkod || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stock.ilac?.fiyat ? `${parseFloat(stock.ilac.fiyat).toFixed(2)} ₺` : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {editingId === stock.id ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="number"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                                                        min="0"
                                                                    />
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => handleUpdate(stock.id)}
                                                                        className="bg-green-600"
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
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {stock.miktar} adet
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                                {status.text === 'Düşük' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
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
                                                                className="text-red-600"
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
                            ) : (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <Box className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Stok bulunamadı</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Henüz stok kaydı yok. Ürün ekleyerek başlayın.
                                    </p>
                                    <div className="mt-6">
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate('/eczane/urun-ekle')}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Ürün Ekle
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StockList;
