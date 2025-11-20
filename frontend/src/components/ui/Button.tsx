import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, variant = 'primary', className, ...rest }: Props) {
  const base = 'rounded-lg px-4 py-2 font-semibold transition-colors inline-flex items-center justify-center';
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export default Button;
