/**
 * Card Component
 * Reusable card component with dark theme styling
 */

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  onClick,
  role,
  'aria-label': ariaLabel
}: CardProps) {
  const baseClasses = 'card bg-dark-bg-secondary border border-dark-border-primary rounded-xl p-6 shadow-md';
  const hoverClasses = hover ? 'transition-all duration-200 hover:border-dark-border-accent hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '';
  const glowClasses = glow ? 'shadow-glow-md' : '';
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${glowClasses} ${className}`}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
