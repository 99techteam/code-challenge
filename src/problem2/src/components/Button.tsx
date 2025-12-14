import type { ButtonHTMLAttributes, FC, ReactNode } from "react";

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 not:disabled:hover:bg-blue-600 not:disabled:active:bg-blue-700 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-200',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-slate-100',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
};

export const Button: FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    className = '',
    ...props
}) => {
    const baseStyles = 'rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-custom"></div>
            )}
            {children}
        </button>
    );
};
