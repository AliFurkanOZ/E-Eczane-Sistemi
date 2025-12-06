import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { Search, ArrowLeft } from 'lucide-react';
import HastaSidebar from '../../../components/layout/HastaSidebar';
import { addToSepet } from '../../../redux/slices/hastaSlice';

const MedicineSearch = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      // Mock search results - in a real app, this would call an API
      const mockResults = [
        {
          id: '1',
          name: 'Parol 500mg',
          barcode: '8699123456789',
          price: 25.50,
          inStock: true
        },
        {
          id: '2',
          name: 'Apranax Fort 550mg',
          barcode: '8699567812345',
          price: 32.75,
          inStock: true
        },
        {
          id: '3',
          name: 'Minoset 20mg',
          barcode: '8699987654321',
          price: 18.90,
          inStock: false
        }
      ];
      
      // Filter results based on search term
      const filteredResults = mockResults.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.barcode.includes(searchTerm)
      );
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (medicine) => {
    // Add to Redux store instead of making API call
    const cartItem = {
      ilac_id: medicine.id,
      ilac_adi: medicine.name,
      barkod: medicine.barcode,
      miktar: 1,
      birim_fiyat: medicine.price,
      ara_toplam: medicine.price,
      receteli: false
    };
    
    dispatch(addToSepet(cartItem));
    alert(`${medicine.name} sepete eklendi!`);
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
                        İlaç Ara
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        İlaç adı veya barkod numarasına göre arama yapın
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
                  <form onSubmit={handleSearch} className="mb-8">
                    <label htmlFor="medicine-search" className="block text-sm font-medium text-gray-700 mb-2">
                      İlaç Adı veya Barkod
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="medicine-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="İlaç adı veya barkod giriniz..."
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {loading ? 'Aranıyor...' : 'Ara'}
                      </button>
                    </div>
                  </form>

                  {searchResults.length > 0 ? (
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Arama Sonuçları ({searchResults.length} sonuç)
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((medicine) => (
                          <div key={medicine.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{medicine.name}</h3>
                              <span className="text-sm font-medium text-green-600">{medicine.price.toFixed(2)} TL</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Barkod: {medicine.barcode}</p>
                            <div className="mt-3 flex justify-between items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                medicine.inStock 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {medicine.inStock ? 'Stokta' : 'Stokta Yok'}
                              </span>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => handleAddToCart(medicine)}
                                disabled={!medicine.inStock}
                              >
                                Sepete Ekle
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : searchTerm ? (
                    <div className="text-center py-12">
                      <Search className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Sonuç bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        "{searchTerm}" için hiçbir sonuç bulunamadı. Farklı bir terim deneyin.
                      </p>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Popüler İlaçlar</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-gray-900">Parol 500mg</h4>
                              <span className="text-sm font-medium text-green-600">25.50 TL</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Barkod: 8699123456789</p>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Stokta
                              </span>
                              <Button variant="secondary" size="sm">
                                Sepete Ekle
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicineSearch;