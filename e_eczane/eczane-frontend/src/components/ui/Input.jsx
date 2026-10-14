import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-3 
            bg-white/50 border 
            ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'} 
            rounded-xl 
            focus:ring-2 outline-none 
            transition-all duration-200 
            placeholder:text-slate-400 
            text-sm font-medium text-slate-900
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
                    {...props}
                />
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-slate-400" />
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
