import React, { useEffect, useState } from 'react';
import Hero from '@/components/Layout/Hero';
import GenderCollectionSection from '@/components/Products/GenderCollectionSection';
import ProductDetails from '@/components/Products/ProductDetails';
import ProductGrid from '@/components/Products/ProductGrid';
import FeaturesSection from '@/components/Products/FeaturesSection';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '@/redux/slices/productsSlice';
import axiosInstance from '@/lib/axios';
import FeaturedProducts from '@/components/Products/FeaturedProducts';
import Reveal from '@/components/animations/Reveal';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, loadingFeatured, error } = useSelector(
    (state) => state.user.products
  );
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    // Fetch products for a specific collection
    dispatch(
      fetchProductsByFilters({
        gender: 'Unisex',
        limit: 8,
      })
    );

    const fetchBestSeller = async () => {
      try {
        const response = await axiosInstance.get(`api/products/best-seller`);
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error('Lỗi xảy ra khi truy xuất fetchBestSeller: ', error);
        toast.error('Lỗi xảy ra khi truy xuất fetchBestSeller.');
      }
    };
    fetchBestSeller();

    const fetchNewProducts = async () => {
      try {
        const response = await axiosInstance.get(`api/products/new-arrivals`);
        setNewProducts(response.data);
      } catch (error) {
        console.error('Lỗi xảy ra khi truy xuất fetchNewProducts: ', error);
        toast.error('Lỗi xảy ra khi truy xuất fetchNewProducts.');
      }
    };
    fetchNewProducts();
  }, [dispatch]);

  // Fetch best seller product

  console.log('Home');

  return (
    <div>
      {/* ảnh đầu trang */}
      <Reveal>
        <Hero />
      </Reveal>

      {/* bộ sưu tập nam nữ */}
      <Reveal delay={0.15}>
        <GenderCollectionSection />
      </Reveal>
      {/* Sản phẩm nổi bật */}
      <Reveal delay={0.15}>
        <FeaturedProducts />
      </Reveal>

      {/* Sản phẩm mới */}
      <Reveal delay={0.15}>
        <div className="container mx-auto px-4 lg:px-0">
          <h2 className="text-3xl text-center font-bold mb-4 pt-16">Sản phẩm mới</h2>
          <ProductGrid products={newProducts} loading={loadingFeatured} error={error} />
        </div>
      </Reveal>

      {/* sản phẩm bán chạy */}
      <Reveal delay={0.15}>
        <h2 className="text-3xl text-center font-bold mb-4 pt-16">Sản phẩm bán chạy</h2>
        {bestSellerProduct ? (
          <ProductDetails productId={bestSellerProduct._id} />
        ) : (
          <p className="text-center">Loading best seller product...</p>
        )}
      </Reveal>

      {/* Sản phẩm nam nữ nổi bật
      <div className="container mx-auto px-4 lg:px-0">
        <h2 className="text-3xl text-center font-bold mb-4 pt-16">Áo cho nữ</h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </div> */}

      {/* Bộ sưu tập */}
      {/* <FeaturedCollection /> */}
      <Reveal delay={0.15}>
        <FeaturesSection />
      </Reveal>
    </div>
  );
};

export default Home;
