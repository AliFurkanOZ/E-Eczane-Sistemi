import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
    Package,
    LayoutDashboard,
    ClipboardList,
    Box,
    PlusCircle,
    User,
    LogOut,
    HelpCircle,
    ChevronRight,
    Store
} from 'lucide-react';

const EczaneSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const navigation = [
        { name: 'Ana Sayfa', href: '/eczane/dashboard', icon: LayoutDashboard },
        { name: 'Siparişler', href: '/eczane/siparisler', icon: ClipboardList },
        { name: 'Stok Yönetimi', href: '/eczane/stoklar', icon: Box },
        { name: 'Ürün Ekle', href: '/eczane/urun-ekle', icon: PlusCircle },
        { name: 'Profilim', href: '/eczane/profil', icon: User },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-6 py-8 flex items-center">
                <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
                    <Store className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500 font-display">
                        E-Eczane
                    </h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">ECZANE PANELİ</p>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="px-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-white/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-full blur-2xl -mr-8 -mt-8 opacity-50 transition-opacity group-hover:opacity-100" />

                    <div className="flex items-center relative z-10">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {user?.name || 'Eczane Adı'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.email || 'eczane@email.com'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Menü
                </p>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`
                                group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                }
                            `}
                        >
                            <Icon className={`
                                mr-3 h-5 w-5 transition-colors duration-200
                                ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}
                            `} />
                            <span className="flex-1">{item.name}</span>
                            {isActive && (
                                <ChevronRight className="w-4 h-4 text-emerald-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 mt-auto">
                <div className="border-t border-slate-200/60 pt-4 space-y-1">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                        Oturumu Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EczaneSidebar;
