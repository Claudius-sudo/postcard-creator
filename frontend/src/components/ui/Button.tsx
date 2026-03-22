import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-400 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-soft hover:shadow-warm',
    secondary: 'bg-cream-200 hover:bg-cream-300 text-cream-800',
    outline: 'border-2 border-terracotta-500 text-terracotta-600 hover:bg-terracotta-50',
    ghost: 'text-terracotta-600 hover:bg-terracotta-50',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
