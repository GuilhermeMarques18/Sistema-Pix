import * as React from 'react';
import { cn } from '@/app/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md bg-bg-input px-3 py-2 text-sm text-text',
          'placeholder:text-text-secondary',
          'border border-bg-input focus:border-brand-logo focus:outline-none focus:ring-1 focus:ring-brand-logo',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
