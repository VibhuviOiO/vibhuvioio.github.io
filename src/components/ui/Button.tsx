import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  external?: boolean;
}

const variantClasses = {
  primary: 'bg-gradient-primary shadow-primary text-white hover:opacity-90',
  secondary: 'bg-transparent border border-black/20 text-black/70 hover:bg-gray-50',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  external = false,
}: ButtonProps) {
  const baseClassName = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClassName}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className={baseClassName}>
      {children}
    </button>
  );
}
