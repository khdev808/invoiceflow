import { forwardRef, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`if-input${className ? ` ${className}` : ''}`} {...props} />
  ),
);

Input.displayName = 'Input';
