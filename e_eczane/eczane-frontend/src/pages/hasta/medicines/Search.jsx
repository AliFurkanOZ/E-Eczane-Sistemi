import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Package, ShoppingCart, RefreshCw, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';
import { addToSepet } from '../../../redux/slices/hastaSlice';
import * as hastaApi from '../../../api/hastaApi';

const MedicineSearch = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error('Lütfen arama terimi girin');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      // Backend API'den ilaç ara
      const response = await hastaApi.searchMedicines({ query: searchTerm });
      if (response && response.items) {
        setSearchResults(response.items);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Arama yapılırken bir hata oluştu');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (medicine) => {
    const cartItem = {
      ilac_id: medicine.id,
      ilac_adi: medicine.ad || medicine.name,
      barkod: medicine.barkod || medicine.barcode,
      miktar: 1,
      birim_fiyat: parseFloat(medicine.fiyat || medicine.price || 0)
    };

    dispatch(addToSepet(cartItem));
    toast.success(`${cartItem.ilac_adi} sepete eklendi!`);
  };

  return (
    <MainLayout sidebar={<HastaSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            İlaç Ara
          </h1>
          <p className="text-slate-500 mt-2">
            İlaç adı veya barkod numarasına göre arama yapın.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/hasta/sepet')}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Sepetim
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

      {/* Search Form */}
      <Card className="mb-6">
        <CardBody>
          <form onSubmit={handleSearch}>
            <label htmlFor="medicine-search" className="block text-sm font-medium text-slate-700 mb-2">
              İlaç Adı veya Barkod
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Pill className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="medicine-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="İlaç adı veya barkod giriniz..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Search Results */}
      {loading ? (
        <Card>
          <CardBody className="py-16">
            <div className="flex justify-center">
              <Loading />
            </div>
          </CardBody>
        </Card>
      ) : searchResults.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Arama Sonuçları
            </h2>
            <Badge variant="primary">{searchResults.length} sonuç</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((medicine) => (
              <Card key={medicine.id} hover>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-xl">
                        <Pill className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {medicine.ad || medicine.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {medicine.barkod || medicine.barcode}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      {parseFloat(medicine.fiyat || medicine.price || 0).toFixed(2)} ₺
                    </span>
                  </div>

                  {medicine.etken_madde && (
                    <p className="text-sm text-slate-500 mb-3">
                      Etken Madde: {medicine.etken_madde}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <Badge variant={medicine.receteli ? 'warning' : 'success'}>
                      {medicine.receteli ? 'Reçeteli' : 'Reçetesiz'}
                    </Badge>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddToCart(medicine)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Sepete Ekle
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ) : searched ? (
        <Card>
          <CardBody className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Sonuç Bulunamadı
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                "{searchTerm}" için hiçbir sonuç bulunamadı. Farklı bir terim deneyin.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                İlaç Aramaya Başlayın
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Yukarıdaki arama kutusuna ilaç adı veya barkod yazarak arama yapabilirsiniz.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </MainLayout>
  );
};

export default MedicineSearch;