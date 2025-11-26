// context/StockContext.jsx
import React, { createContext, useContext, useRef } from 'react';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const stockCache = useRef(new Map()); // 🎯 Cache stock data

  const getStock = async (productId, color, size) => {
    const cacheKey = `${productId}-${color}-${size}`;

    // Nếu có trong cache và chưa quá 30 giây → dùng cache
    const cached = stockCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.stock;
    }

    // Không có cache hoặc cache cũ → gọi API
    try {
      const response = await axiosInstance.get(`/api/products/${productId}`);
      const product = response.data;
      const variant = product.variants.find((v) => v.colorName === color);
      const sizeVariant = variant?.sizes.find((s) => s.name === size);
      const stock = sizeVariant?.countInStock || 0;

      // Lưu vào cache
      stockCache.current.set(cacheKey, {
        stock,
        timestamp: Date.now(),
      });

      return stock;
    } catch (error) {
      console.error('Lỗi khi lấy stock:', error);
      return 0;
    }
  };

  return <StockContext.Provider value={{ getStock }}>{children}</StockContext.Provider>;
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
};
