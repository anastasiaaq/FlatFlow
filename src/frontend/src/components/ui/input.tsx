import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-[43px] w-full rounded-[7px] border border-[#d8d8bd] bg-[#fffef7] px-[14px] text-[16px] text-[#0b0a0f] outline-none transition-colors focus:border-[#0b0a0f] focus:ring-2 focus:ring-[#fdd329]',
        className,
      )}
      {...props}
    />
  )
}
