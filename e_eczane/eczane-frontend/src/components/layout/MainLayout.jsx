import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children, sidebar }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-400/10 blur-[100px]" />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 inset-x-0 z-40 glass border-b border-white/20 px-4 py-3 flex items-center justify-between">
                <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                    E-Eczane
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-30 w-72 
          glass border-r border-white/20
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
            >
                <div className="h-full overflow-y-auto custom-scrollbar">
                    {sidebar}
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10 md:pl-72 min-h-screen transition-all duration-300">
                <div className="h-16 md:hidden" /> {/* Spacer for mobile header */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default MainLayout;
