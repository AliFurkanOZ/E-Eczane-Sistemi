import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { Menu, X, LogOut, Package, Home } from 'lucide-react';

const MobileHeader = ({ navigation, themeColor = 'blue', title = 'E-Eczane' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userType } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const colorClasses = {
        blue: {
            bg: 'bg-blue-600',
            hover: 'hover:bg-blue-700',
            text: 'text-blue-600',
            activeBg: 'bg-blue-50',
            activeBorder: 'border-blue-600'
        },
        green: {
            bg: 'bg-green-600',
            hover: 'hover:bg-green-700',
            text: 'text-green-600',
            activeBg: 'bg-green-50',
            activeBorder: 'border-green-600'
        },
        purple: {
            bg: 'bg-purple-600',
            hover: 'hover:bg-purple-700',
            text: 'text-purple-600',
            activeBg: 'bg-purple-50',
            activeBorder: 'border-purple-600'
        }
    };

    const colors = colorClasses[themeColor] || colorClasses.blue;

    return (
        <div className="md:hidden">
            {/* Mobile Header Bar */}
            <div className={`${colors.bg} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center">
                    <Package className="h-6 w-6 text-white" />
                    <span className="ml-2 text-white font-bold">{title}</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white p-2 rounded-md hover:bg-white/10 focus:outline-none"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="bg-white border-b border-gray-200 shadow-lg">
                    <nav className="px-2 py-3 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`${isActive
                                            ? `${colors.activeBg} ${colors.activeBorder} ${colors.text}`
                                            : 'border-transparent text-gray-600 hover:bg-gray-50'
                                        } flex items-center px-3 py-2 text-base font-medium rounded-md border-l-4`}
                                >
                                    <Icon
                                        className={`${isActive ? colors.text : 'text-gray-400'} mr-3 h-5 w-5`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md border-l-4 border-transparent"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Çıkış Yap
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default MobileHeader;
