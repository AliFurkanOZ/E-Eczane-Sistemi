import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import { removeFromSepet, updateSepetItem } from '../../../redux/slices/hastaSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sepet } = useSelector((state) => state.hasta);

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromSepet(itemId));
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    dispatch(updateSepetItem({ ilac_id: itemId, miktar: quantity }));
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout
    alert('Ödeme sayfasına yönlendiriliyorsunuz...');
  };

  const calculateTotal = () => {
    return sepet.reduce((sum, item) => sum + (item.birim_fiyat * item.miktar), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HastaSidebar />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Sepetim
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Sepetinizdeki ürünleri yönetin
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/hasta/dashboard')}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <>
                    {sepet.length > 0 ? (
                      <>
                        <div className="divide-y divide-gray-200">
                          {sepet.map((item) => (
                            <div key={item.ilac_id} className="py-6">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                </div>
                                
                                <div className="ml-4 flex-1 flex flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.ilac_adi}</h3>
                                      <p className="ml-4">{(item.birim_fiyat * item.miktar).toFixed(2)} TL</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Barkod: {item.barkod}</p>
                                  </div>
                                  
                                  <div className="flex-1 flex items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <button 
                                        onClick={() => handleUpdateQuantity(item.ilac_id, item.miktar - 1)}
                                        className="px-2 py-1 border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50"
                                      >
                                        -
                                      </button>
                                      <span className="px-3 py-1 border-t border-b border-gray-300 text-gray-900">
                                        {item.miktar}
                                      </span>
                                      <button 
                                        onClick={() => handleUpdateQuantity(item.ilac_id, item.miktar + 1)}
                                        className="px-2 py-1 border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    <button 
                                      onClick={() => handleRemoveFromCart(item.ilac_id)}
                                      className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Kaldır
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Toplam</p>
                            <p>{calculateTotal().toFixed(2)} TL</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Kargo dahil değil.
                          </p>
                          <div className="mt-6">
                            <Button
                              variant="primary"
                              onClick={handleCheckout}
                              className="w-full flex justify-center items-center"
                            >
                              Siparişi Tamamla
                            </Button>
                          </div>
                          <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                            <p>
                              veya{' '}
                              <button
                                type="button"
                                className="text-blue-600 font-medium hover:text-blue-500"
                                onClick={() => navigate('/hasta/dashboard')}
                              >
                                Alışverişe Devam Et<span aria-hidden="true"> &rarr;</span>
                              </button>
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-12 text-center">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Sepetiniz boş</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          İlaç eklediğinizde burada görüntülenecektir.
                        </p>
                        <div className="mt-6">
                          <Button 
                            variant="primary" 
                            onClick={() => navigate('/hasta/ilaclar')}
                          >
                            İlaç Ara
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Cart;