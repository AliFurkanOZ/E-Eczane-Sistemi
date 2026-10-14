import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: "bg-primary-50 text-primary-700 ring-primary-700/10",
        secondary: "bg-slate-50 text-slate-600 ring-slate-500/10",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/10",
        danger: "bg-red-50 text-red-700 ring-red-600/10",
        purple: "bg-purple-50 text-purple-700 ring-purple-700/10",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
