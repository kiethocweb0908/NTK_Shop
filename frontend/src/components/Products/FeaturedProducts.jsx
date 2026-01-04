import axios from 'axios';
import axiosInstance, { BASE_URL } from '@/lib/axios';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// format
import { formatCurrency } from '@/lib/utils';

const FeaturedProducts = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [featuredProduct, setFeaturedProduct] = useState([]);

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        const response = await axiosInstance.get(`api/products/featured-products`);
        setFeaturedProduct(response.data.featuredPrtoducts);
      } catch (error) {
        console.error('Lỗi xảy ra khi truy xuất fetchFeaturedProduct: ', error);
        toast.error('Lỗi xảy ra khi truy xuất fetchFeaturedProduct.');
      }
    };
    fetchFeaturedProduct();
  }, []);

  //chuột

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    // console.log('startX: ', startX);
    // console.log('offsetLeft: ', scrollRef.current.offsetLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = (e) => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchEnd = () => setIsDragging(false);

  //nút

  const scroll = (direction) => {
    const scrollAmout = direction === 'left' ? -431 : 431;
    scrollRef.current.scrollBy({ left: scrollAmout, behavior: 'smooth' });
  };

  //update Scroll Buttons
  const updateScrollButtons = () => {
    const container = scrollRef.current;

    if (container) {
      const lefScroll = container.scrollLeft;
      const rightScrollable = container.scrollWidth > lefScroll + container.clientWidth;

      setCanScrollLeft(lefScroll > 0);
      setCanScrollRight(rightScrollable);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons, {
        passive: true,
      });
      updateScrollButtons();
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [featuredProduct]);

  return (
    <section className="px-4 md:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Sản phẩm nổi bật</h2>
        <p className="text-lg text-gray-600 mb-8">
          Khám phá xu hướng mới nhất – những thiết kế vừa ra mắt giúp tủ đồ của bạn luôn
          bắt kịp đỉnh cao thời trang.
        </p>

        {/* Scroll buttons */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded border border-gray-200 ${
              canScrollLeft
                ? 'bg-white text-black hover:border-primary-400 hover:text-primary-400 transition-all duration-200 ease-in'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded border border-gray-200 ${
              canScrollRight
                ? 'bg-white text-black hover:border-primary-400 hover:text-primary-400 transition-all duration-200 ease-in'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className={`container mx-auto overflow-x-scroll flex space-x-6 relative
    scrollbar-thin
    scrollbar-track-transparent

    scrollbar-thumb-transparent
    hover:scrollbar-thumb-black/40
          ${isDragging ? ' cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {featuredProduct.map((product) => (
          <div
            key={product._id}
            className="min-w-full sm:min-w-[50%] lg:min-w-[30%] relative select-none"
          >
            <img
              src={product.variants[0]?.images[0].url}
              alt={product.variants[0]?.images[0].altText || product.name}
              className="w-full h-[500px] object-cover rounded-lg"
              draggable="false"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md text-white p-4 rounded-b-lg">
              <Link to={`/product/${product._id}`} className="block">
                <h4 className="font-medium">{product.name}</h4>
                <p className="mt-1">
                  {formatCurrency(product.discountPrice) || formatCurrency(product.price)}
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
