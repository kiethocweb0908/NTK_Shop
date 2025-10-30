import React from 'react';
import Hero from '../components/Layout/Hero';
import GenderCollectionSection from '../components/Products/GenderCollectionSection';
import NewArriivals from '../components/Products/NewArrivals';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/Products/ProductGrid';
import FeaturedCollection from '@/components/Products/FeaturedCollection';
import FeaturesSection from '@/components/Products/FeaturesSection';

const plaehoderProducts = [
  {
    _id: 1,
    name: 'product 1',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=10' }],
  },
  {
    _id: 2,
    name: 'product 2',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=11' }],
  },
  {
    _id: 3,
    name: 'product 3',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=12' }],
  },
  {
    _id: 4,
    name: 'product 4',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=13' }],
  },
  {
    _id: 5,
    name: 'product 5',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=14' }],
  },
  {
    _id: 6,
    name: 'product 6',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=15' }],
  },
  {
    _id: 7,
    name: 'product 7',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=16' }],
  },
  {
    _id: 8,
    name: 'product 8',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=17' }],
  },
];

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

      {/* Sản phẩm nam nữ nổi bật */}
      <div className="container mx-auto px-4 lg:px-0">
        <h2 className="text-3xl text-center font-bold mb-4 pt-16">Áo cho nữ</h2>
        <ProductGrid products={plaehoderProducts} />
      </div>

      {/* Bộ sưu tập */}
      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;
