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

export const validatePhone = (phone) => {
  const trimmed = phone.trim();
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(trimmed);
};

export const validatePassword = (password) => {
  const trimmed = password.trim();
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,50}$/;
  return passwordRegex.test(trimmed);
};
