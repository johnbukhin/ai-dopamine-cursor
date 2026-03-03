import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-emerald-800 text-stone-50 hover:bg-emerald-900 focus:ring-emerald-800",
    secondary: "bg-stone-200 text-emerald-900 hover:bg-stone-300 focus:ring-stone-400",
    danger: "bg-rose-100 text-rose-800 hover:bg-rose-200 focus:ring-rose-200",
    ghost: "bg-transparent text-emerald-800 hover:bg-stone-100",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};