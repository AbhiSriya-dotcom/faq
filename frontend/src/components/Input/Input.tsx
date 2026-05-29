import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`h-14 w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-[14px] shadow-sm outline-none transition placeholder:text-[#9da1a1] focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  )
}

export default Input
