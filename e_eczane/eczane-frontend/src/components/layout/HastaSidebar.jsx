import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  FileText, 
  Package, 
  ShoppingCart, 
  History, 
  Search 
} from 'lucide-react';

const HastaSidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Genel Bakış', href: '/hasta/dashboard', icon: Home },
    { name: 'Profilim', href: '/hasta/profil', icon: User },
    { name: 'Reçetelerim', href: '/hasta/receteler', icon: FileText },
    { name: 'İlaç Ara', href: '/hasta/ilaclar', icon: Search },
    { name: 'Sepetim', href: '/hasta/sepet', icon: ShoppingCart },
    { name: 'Sipariş Geçmişim', href: '/hasta/siparisler', icon: History },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5">
        <div className="flex flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white rounded-lg p-2">
              <Package className="h-6 w-6" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">E-Eczane</span>
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HastaSidebar;