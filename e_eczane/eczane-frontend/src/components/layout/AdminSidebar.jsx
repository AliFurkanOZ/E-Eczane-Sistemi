import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
    Package,
    LayoutDashboard,
    Clock,
    Building2,
    Users,
    ClipboardList,
    LogOut,
    Shield,
    ChevronRight,
    Activity,
    Stethoscope
} from 'lucide-react';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const navigation = [
        { name: 'Ana Sayfa', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Onay Bekleyenler', href: '/admin/eczaneler/bekleyenler', icon: Clock },
        { name: 'Tüm Eczaneler', href: '/admin/eczaneler', icon: Building2 },
        { name: 'Tüm Hastalar', href: '/admin/hastalar', icon: Users },
        { name: 'Doktorlar', href: '/admin/doktorlar', icon: Stethoscope },
        { name: 'Tüm Siparişler', href: '/admin/siparisler', icon: ClipboardList },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-6 py-8 flex items-center">
                <div className="bg-gradient-to-tr from-purple-600 to-purple-400 p-2.5 rounded-xl shadow-lg shadow-purple-500/30">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-500 font-display">
                        E-Eczane
                    </h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">YÖNETİM PANELİ</p>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="px-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-white/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-full blur-2xl -mr-8 -mt-8 opacity-50 transition-opacity group-hover:opacity-100" />

                    <div className="flex items-center relative z-10">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                Administrator
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.email || 'admin@email.com'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Yönetim
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
                                    ? 'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-100'
                                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                }
                            `}
                        >
                            <Icon className={`
                                mr-3 h-5 w-5 transition-colors duration-200
                                ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-500'}
                            `} />
                            <span className="flex-1">{item.name}</span>
                            {isActive && (
                                <ChevronRight className="w-4 h-4 text-purple-400" />
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

export default AdminSidebar;
