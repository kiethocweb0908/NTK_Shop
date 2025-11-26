import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const QuantityButtonvariants = cva(
  `rounded border 
  hover:border-primary-300 hover:text-primary-300 
  transition-all ease-in duration-150  cursor-pointer
  active:text-primary active:border-primary`,
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        small: 'h-6 w-6 text-lg leading-none font-medium',
        default: 'min-w-[34px] py-1 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const QuantitySelector = React.memo(
  ({ quantity, handleQuantityChange, textShow = true, variant, size, className }) => {
    console.log('quantity');

    return (
      <div className={cn(className)}>
        {textShow && <p className="text-gray-700">Số lượng:</p>}
        <div className="flex items-center space-x-4 mt-2">
          <button
            className={cn(QuantityButtonvariants({ variant, size }))}
            onClick={() => handleQuantityChange('minus')}
          >
            -
          </button>
          <span className="inline-block min-w-5 text-center text-lg select-none">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange('plus')}
            className={cn(QuantityButtonvariants({ variant, size }))}
          >
            +
          </button>
        </div>
      </div>
    );
  }
);

export default QuantitySelector;
