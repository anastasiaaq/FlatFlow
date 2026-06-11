import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-[16px] font-medium text-[#0b0a0f]', className)}
      {...props}
    />
  )
}
