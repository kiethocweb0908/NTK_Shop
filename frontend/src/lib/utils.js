import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format tiền tệ
export const formatCurrency = (amount) => {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};
