import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'if-btn-primary',
  secondary: 'if-btn-secondary',
  danger: 'if-btn-danger',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`${variantClass[variant]}${className ? ` ${className}` : ''}`}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
