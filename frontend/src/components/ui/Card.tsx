// frontend/src/components/ui/Card.tsx
import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClass = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const hoverClass = hover ? 'transition-shadow hover:shadow-md cursor-pointer' : '';

  return (
    <div
      className={`${baseClass} ${hoverClass} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-6 border-b border-gray-200 ${className}`}>
      <div>
        {typeof title === 'string' ? (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        ) : (
          title
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`text-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}