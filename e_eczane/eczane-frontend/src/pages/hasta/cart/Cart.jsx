import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2, Package, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../../components/layout/MainLayout';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { removeFromSepet, updateSepetItem, clearSepet } from '../../../redux/slices/hastaSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sepet } = useSelector((state) => state.hasta);

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromSepet(itemId));
    toast.success('Ürün sepetten kaldırıldı');
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    dispatch(updateSepetItem({ ilac_id: itemId, miktar: quantity }));
  };

  const handleClearCart = () => {
    if (window.confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      dispatch(clearSepet());
      toast.success('Sepet temizlendi');
    }
  };

  const handleCheckout = () => {
    if (sepet.length === 0) {
      toast.error('Sepetiniz boş');
      return;
    }

    // Sepetteki ürünleri sessionStorage'a kaydet ve eczane seçimine yönlendir
    sessionStorage.setItem('cartItems', JSON.stringify(sepet));
    sessionStorage.setItem('selectedMedicines', JSON.stringify(sepet.map(item => ({
      ilac_id: item.ilac_id,
      ad: item.ilac_adi,
      barkod: item.barkod,
      miktar: item.miktar,
      fiyat: item.birim_fiyat
    }))));

    navigate('/hasta/eczane-sec');
    toast.success('Eczane seçimine yönlendiriliyorsunuz');
  };

  const calculateTotal = () => {
    return sepet.reduce((sum, item) => sum + (item.birim_fiyat * item.miktar), 0);
  };

  return (
    <MainLayout sidebar={<HastaSidebar />}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Sepetim
          </h1>
          <p className="text-slate-500 mt-2">
            Sepetinizdeki ürünleri yönetin ve sipariş oluşturun.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {sepet.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sepeti Temizle
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate('/hasta/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>

      {sepet.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sepet Ürünleri */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-slate-800">
                  Sepetteki Ürünler ({sepet.length})
                </h3>
              </CardHeader>
              <CardBody className="divide-y divide-slate-100">
                {sepet.map((item) => (
                  <div key={item.ilac_id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      {/* Ürün ikonu */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-primary-600" />
                      </div>

                      {/* Ürün bilgileri */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">
                          {item.ilac_adi}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Barkod: {item.barkod}
                        </p>
                        <p className="text-sm font-medium text-primary-600">
                          {parseFloat(item.birim_fiyat || 0).toFixed(2)} ₺ / adet
                        </p>
                      </div>

                      {/* Miktar kontrolü */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.ilac_id, item.miktar - 1)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-slate-800">
                          {item.miktar}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.ilac_id, item.miktar + 1)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Ara toplam ve silme */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-800">
                          {(item.birim_fiyat * item.miktar).toFixed(2)} ₺
                        </p>
                        <button
                          onClick={() => handleRemoveFromCart(item.ilac_id)}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Sipariş Özeti */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="text-lg font-bold text-slate-800">Sipariş Özeti</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Ürün Sayısı</span>
                    <span>{sepet.reduce((sum, item) => sum + item.miktar, 0)} adet</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ara Toplam</span>
                    <span>{calculateTotal().toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Kargo</span>
                    <span className="text-emerald-600">Ücretsiz</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg text-slate-800">Toplam</span>
                      <span className="font-bold text-lg text-primary-600">
                        {calculateTotal().toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={handleCheckout}
                  className="w-full mt-6"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Eczane Seç ve Sipariş Oluştur
                </Button>

                <p className="text-xs text-slate-500 text-center mt-3">
                  Siparişinizi tamamlamak için eczane seçmeniz gerekmektedir.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardBody className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Sepetiniz Boş
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Henüz sepetinize ürün eklemediniz. İlaç arayarak veya reçetelerinizden ürün ekleyebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/hasta/ilaclar')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  İlaç Ara
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/hasta/receteler')}
                >
                  Reçetelerime Git
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </MainLayout>
  );
};

export default Cart;