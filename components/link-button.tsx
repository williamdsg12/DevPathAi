import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LinkButtonProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants>

/**
 * A Next.js Link styled as a button. Use for navigation instead of
 * `<Button render={<Link />} />` to keep correct anchor semantics.
 */
export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
