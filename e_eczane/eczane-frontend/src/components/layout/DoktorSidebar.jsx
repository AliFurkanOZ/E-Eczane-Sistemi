import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
    LayoutDashboard,
    FilePlus,
    FileText,
    User,
    LogOut,
    Stethoscope
} from 'lucide-react';

const DoktorSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/doktor/dashboard' },
        { icon: FilePlus, label: 'Reçete Yaz', path: '/doktor/recete-yaz' },
        { icon: FileText, label: 'Yazdığım Reçeteler', path: '/doktor/recetelerim' },
        { icon: User, label: 'Profilim', path: '/doktor/profil' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                        <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800">E-Eczane</h1>
                        <p className="text-xs text-slate-500">Doktor Paneli</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 mb-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                            {user?.name || 'Doktor'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
};

export default DoktorSidebar;
