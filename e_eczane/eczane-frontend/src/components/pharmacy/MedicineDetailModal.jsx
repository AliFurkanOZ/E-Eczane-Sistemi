import React from 'react';
import { X, Pill, FileText, Building2, Beaker, Tag, AlertCircle, ExternalLink, Package } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * İlaç Detay Modal Bileşeni
 * Stok listesinden ilaç detaylarını görüntülemek için kullanılır
 */
const MedicineDetailModal = ({ isOpen, onClose, stock }) => {
    if (!isOpen || !stock) return null;

    const getCategoryLabel = (kategori) => {
        const categories = {
            'normal': 'Normal İlaç',
            'kirmizi_recete': 'Kırmızı Reçete',
            'yesil_recete': 'Yeşil Reçete',
            'mor_recete': 'Mor Reçete',
            'turuncu_recete': 'Turuncu Reçete',
            'soguk_zincir': 'Soğuk Zincir'
        };
        return categories[kategori] || kategori || 'Bilinmiyor';
    };

    const getCategoryVariant = (kategori) => {
        const variants = {
            'normal': 'success',
            'kirmizi_recete': 'danger',
            'yesil_recete': 'success',
            'mor_recete': 'warning',
            'turuncu_recete': 'warning',
            'soguk_zincir': 'info'
        };
        return variants[kategori] || 'default';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-t-2xl px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                    <Pill className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {stock.ilac?.ad || stock.ilac_adi || 'Bilinmiyor'}
                                    </h3>
                                    <p className="text-emerald-100 text-sm mt-1 flex items-center">
                                        <Tag className="w-4 h-4 mr-1" />
                                        Barkod: {stock.ilac?.barkod || stock.ilac_barkod || '-'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-3">
                            <Badge variant={getCategoryVariant(stock.ilac_kategori || stock.ilac?.kategori)}>
                                {getCategoryLabel(stock.ilac_kategori || stock.ilac?.kategori)}
                            </Badge>
                            <Badge variant={stock.ilac_receteli || stock.ilac?.receteli ? 'danger' : 'success'}>
                                {stock.ilac_receteli || stock.ilac?.receteli ? (
                                    <><AlertCircle className="w-3 h-3 mr-1" /> Reçeteli</>
                                ) : (
                                    'Reçetesiz'
                                )}
                            </Badge>
                            <Badge variant="info">
                                <Package className="w-3 h-3 mr-1" />
                                Stok: {stock.miktar} adet
                            </Badge>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Fiyat */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-100">
                                <div className="flex items-center text-emerald-600 mb-2">
                                    <span className="text-sm font-medium">Fiyat</span>
                                </div>
                                <p className="text-2xl font-bold text-emerald-700">
                                    {stock.ilac?.fiyat || stock.ilac_fiyat
                                        ? `${parseFloat(stock.ilac?.fiyat || stock.ilac_fiyat).toFixed(2)} ₺`
                                        : '-'}
                                </p>
                            </div>

                            {/* Etken Madde */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center text-slate-600 mb-2">
                                    <Beaker className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">Etken Madde</span>
                                </div>
                                <p className="text-slate-800 font-medium">
                                    {stock.ilac_etken_madde || stock.ilac?.etken_madde || 'Belirtilmemiş'}
                                </p>
                            </div>

                            {/* Firma */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center text-slate-600 mb-2">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">Üretici Firma</span>
                                </div>
                                <p className="text-slate-800 font-medium">
                                    {stock.ilac_firma || stock.ilac?.firma || 'Belirtilmemiş'}
                                </p>
                            </div>

                            {/* Minimum Stok */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center text-slate-600 mb-2">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">Minimum Stok Seviyesi</span>
                                </div>
                                <p className="text-slate-800 font-medium">
                                    {stock.min_stok || 10} adet
                                </p>
                            </div>
                        </div>

                        {/* Kullanım Talimatı */}
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-center text-blue-700 mb-3">
                                <FileText className="w-5 h-5 mr-2" />
                                <span className="font-semibold">Kullanım Talimatı</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {stock.ilac_kullanim_talimati || stock.ilac?.kullanim_talimati || 'Kullanım talimatı bulunmamaktadır.'}
                            </p>
                        </div>

                        {/* Prospektüs Link */}
                        {(stock.ilac_prospektus_url || stock.ilac?.prospektus_url) && (
                            <a
                                href={stock.ilac_prospektus_url || stock.ilac?.prospektus_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Prospektüsü Görüntüle
                            </a>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
                        <div className="flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                            >
                                Kapat
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetailModal;
