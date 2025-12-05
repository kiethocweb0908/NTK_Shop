import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-gray-200 text-gray-200-foreground [a&]:hover:bg-gray/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        // Thêm variants mới cho trạng thái sản phẩm
        success:
          'border-transparent bg-green-500 text-white [a&]:hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
        warning:
          'border-transparent bg-amber-500 text-white [a&]:hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
        neutral:
          'border-transparent bg-gray-500 text-white [a&]:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
        soldOut:
          'border-transparent bg-red-500 text-white [a&]:hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
        male: 'border-transparent bg-blue-500/70 text-white [a&]:hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        female:
          'border-transparent bg-pink-500/70 text-white [a&]:hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700',
        unisex:
          'border-transparent bg-purple-500/70 text-white [a&]:hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
