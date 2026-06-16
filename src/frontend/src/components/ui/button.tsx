import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-[38px] min-w-[174px] items-center justify-center rounded-[7px] border text-[16px] font-medium uppercase transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b0a0f] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'border-[#d8d8bd] bg-[#fdd329] text-[#0b0a0f] hover:opacity-80',
        variant === 'ghost' &&
          'h-auto min-w-0 border-transparent bg-transparent px-0 py-0 text-[#0b0a0f] hover:opacity-70',
        className,
      )}
      {...props}
    />
  )
}
