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

const buttonStyles = {
  primary: {
    background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
    boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
    color: 'white',
  },
  secondary: {
    background: 'transparent',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    color: 'rgba(0, 0, 0, 0.7)',
  },
};

const sizeStyles = {
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
  const baseClassName = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all hover:opacity-90 ${sizeStyles[size]} ${className}`;
  
  const style = variant === 'primary' ? buttonStyles.primary : buttonStyles.secondary;
  
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClassName}
          style={style}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={baseClassName} style={style}>
        {children}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className={baseClassName} style={style}>
      {children}
    </button>
  );
}
