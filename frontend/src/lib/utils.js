import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format tiền tệ
export const formatCurrency = (amount) => {
  return amount?.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

export const formatTime = (amount) => {
  return amount
    ? new Date(amount).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // dùng 24h
      })
    : '-';
};

export const toWebp = (url) => {
  return url.replace('/upload/', '/upload/f_webp/');
};
