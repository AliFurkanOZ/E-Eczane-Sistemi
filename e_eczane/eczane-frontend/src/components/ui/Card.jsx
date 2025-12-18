import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
    return (
        <div
            className={`
      bg-white/80 backdrop-blur-md 
      border border-slate-200/60 
      shadow-soft rounded-2xl 
      ${hover ? 'transition-all duration-300 hover:shadow-lg hover:border-primary-200/50 hover:-translate-y-1' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
        {children}
    </div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl ${className}`}>
        {children}
    </div>
);

export default Card;
