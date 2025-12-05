import axios from 'axios';
import { BASE_URL } from '@/lib/axios';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// format
import { formatCurrency } from '@/lib/utils';

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products/new-arrivals`);
        setNewArrivals(response.data);
      } catch (error) {
        console.error('Lỗi xảy ra khi truy xuất fetchNewArrivals: ', error);
        toast.error('Lỗi xảy ra khi truy xuất fetchNewArrivals.');
      }
    };
    fetchNewArrivals();
  }, []);

  // const newArrivals = [

  //   {
  //     _id: 1,
  //     name: 'Stylish Jacket',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 2,
  //     name: 'Gile',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 3,
  //     name: 'Bomber',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 4,
  //     name: 'T-shirt',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 5,
  //     name: 'Pants',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 6,
  //     name: 'Sweater',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 7,
  //     name: 'Stylish',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  //   {
  //     _id: 8,
  //     name: 'Jacket',
  //     price: 350000,
  //     images: [
  //       {
  //         url: 'https://picsum.photos/500/500?random=1',
  //         altText: 'Stylish',
  //       },
  //     ],
  //   },
  // ];

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

    // console.log({
    //   scrollLeft: container.scrollLeft,
    //   clientWidth: container.clientWidth,
    //   containerScrollWidth: container.scrollWidth,
    //   offsetLeft: scrollRef.current.offsetLeft,
    // });
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
  }, [newArrivals]);

  return (
    <section className="px-4 md:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Khám phá sản phẩm mới</h2>
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
          no-scrollbar
          ${isDragging ? ' cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {newArrivals.map((product) => (
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

export default NewArrivals;
