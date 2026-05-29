import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
  type?: 'button' | 'submit' | 'reset'
  children?: ReactNode
}

function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
  const variants: Record<ButtonVariant, string> = {
    primary:
      'min-h-11 rounded-lg bg-black px-6 text-[14px] text-white hover:bg-[#2e3132] focus:ring-offset-white',
    secondary:
      'min-h-9 rounded-lg border border-[#c4c7c7] bg-white px-5 text-[13px] text-[#444748] hover:border-black hover:text-black focus:ring-offset-[#f8f9fa]',
    ghost:
      'text-[12px] text-[#6b7280] hover:text-black focus:ring-offset-transparent',
  }

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
