import React from 'react';
import Hero from '../components/Layout/Hero';
import GenderCollectionSection from '../components/Products/GenderCollectionSection';
import NewArriivals from '../components/Products/NewArrivals';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div>
      {/* ảnh đầu trang */}
      <Hero />

      {/* bộ sưu tập nam nữ */}
      <GenderCollectionSection />

      {/* Sản phẩm mới */}
      <NewArrivals />

      {/* sản phẩm bán chạy */}
      <h2 className="text-3xl text-center font-bold mb-4 pt-16">
        Sản phẩm bán chạy
      </h2>
      <ProductDetails />
    </div>
  );
};

export default Home;
