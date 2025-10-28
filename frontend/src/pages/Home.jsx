import React from 'react';
import Hero from '../components/Layout/Hero';
import GenderCollectionSection from '../components/Products/GenderCollectionSection';
import NewArriivals from '../components/Products/NewArrivals';
import NewArrivals from '../components/Products/NewArrivals';

const Home = () => {
  return (
    <div>
      {/* ảnh đầu trang */}
      <Hero />

      {/* bộ sưu tập nam nữ */}
      <GenderCollectionSection />

      {/* sản phẩm bán chạy */}

      {/* Sản phẩm mới */}
      <NewArrivals />
    </div>
  );
};

export default Home;
