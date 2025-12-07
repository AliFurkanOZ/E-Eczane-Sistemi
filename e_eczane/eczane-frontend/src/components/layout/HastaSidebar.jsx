import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
  Package,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  ClipboardList,
  Pill,
  User,
  LogOut,
  HelpCircle
} from 'lucide-react';

const HastaSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    { name: 'Ana Sayfa', href: '/hasta/dashboard', icon: LayoutDashboard },
    { name: 'Reçetelerim', href: '/hasta/receteler', icon: FileText },
    { name: 'Siparişlerim', href: '/hasta/siparisler', icon: ClipboardList },
    { name: 'İlaç Ara', href: '/hasta/ilaclar', icon: Pill },
    { name: 'Sepetim', href: '/hasta/sepet', icon: ShoppingCart },
    { name: 'Profilim', href: '/hasta/profil', icon: User },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow sidebar-official overflow-y-auto">
          {/* Header */}
          <div className="flex items-center px-4 py-4 border-b border-gray-200 bg-[#005f9e]">
            <div className="bg-white rounded p-1.5">
              <Package className="h-6 w-6 text-[#005f9e]" />
            </div>
            <div className="ml-3">
              <h1 className="text-sm font-bold text-white">E-Eczane</h1>
              <p className="text-xs text-blue-100">Hasta Paneli</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#005f9e] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Hoş Geldiniz</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user?.email || 'hasta@email.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Help & Logout */}
          <div className="border-t border-gray-200 py-4">
            <a href="#" className="sidebar-nav-item text-gray-500">
              <HelpCircle className="w-5 h-5 mr-3" />
              <span className="text-sm">Yardım</span>
            </a>
            <button
              onClick={handleLogout}
              className="sidebar-nav-item w-full text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-sm">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="header-official px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-white" />
            <span className="ml-2 text-white font-semibold">E-Eczane</span>
          </div>
          <button onClick={handleLogout} className="text-white p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Nav */}
        <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto">
          <div className="flex px-2 py-2">
            {navigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center px-4 py-2 min-w-[70px] ${isActive ? 'text-[#005f9e]' : 'text-gray-500'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HastaSidebar;