import React, { useEffect, useRef, useState } from 'react';
//

('use client');
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

//

const selectedProduct = {
  name: 'Stylish Jacket',
  price: 350000,
  originalPrice: 400000,
  description: 'DDây là một chiếc áo khoác với kiểu dáng Hàn Quốc',
  brand: 'FashionBrand',
  material: 'Leather',
  sizes: ['s', 'M', 'L', 'XL'],
  colors: ['Red', 'Black'],
  images: [
    {
      url: 'https://picsum.photos/500?random=1',
      altText: 'Stylish Jacket 1',
    },
    {
      url: 'https://picsum.photos/500/500?random=2',
      altText: 'Stylish Jacket 2',
    },
    {
      url: 'https://picsum.photos/500/500?random=3',
      altText: 'Stylish Jacket 2',
    },
    {
      url: 'https://picsum.photos/500/500?random=4',
      altText: 'Stylish Jacket 2',
    },
    {
      url: 'https://picsum.photos/500/500?random=5',
      altText: 'Stylish Jacket 2',
    },
  ],
};

const ProductDetails = () => {
  const [mainImage, setMainImage] = useState(0);
  const [emblaApi, setEmblaApi] = useState(null); // Lưu api
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  // Khi carousel thay đổi slide
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setMainImage(emblaApi.selectedScrollSnap());
    };

    onSelect(); // Gọi lần đầu
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Hàm nhảy đến slide khi click thumbnail
  const scrollTo = (index) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto bg-white p4-8 sm:p-8  rounded-lg">
        <div className="flex flex-col md:grid md:grid-cols-12">
          {/* left */}
          <div className="flex flex-col sm:flex-row  md:col-span-8 lg:col-span-6">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col space-y-4 min-w-[60px] mr-5">
              {selectedProduct.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnails ${index}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2
                  transition-all duration-550 ease-in
                  ${mainImage === index ? 'border-black' : 'border-gray-300'}`}
                  onClick={() => scrollTo(index)}
                />
              ))}
            </div>

            {/* main image */}
            <div className="sm:col-span-6">
              <Carousel
                setApi={setEmblaApi} // Nhận api
                plugins={[plugin.current]}
                className="mb-4 sm:mb-0 rounded-xl overflow-hidden border border-gray-200"
                // onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent>
                  {selectedProduct.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <img
                        src={image.url}
                        alt="Main Product"
                        className={`w-full h-auto object-cover`}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* <CarouselPrevious />
              <CarouselNext /> */}
              </Carousel>
            </div>

            {/* mobile thumbnail */}
            <div className="sm:hidden grid grid-cols-5 gap-2 mb-4">
              {selectedProduct.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnails ${index}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer
                  border-2
                  transition-all duration-550 ease-in
                  ${mainImage === index ? 'border-black' : 'border-gray-300'}`}
                  onClick={() => scrollTo(index)}
                />
              ))}
            </div>
          </div>
          {/* Right Side*/}
          <div className="sm:mt-10 md:mt-0 md:ml-10 md:col-span-4 lg:col-span-6">
            {/* Tên giá mô tả */}
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              {selectedProduct.name}
            </h1>
            <p className="text-lg text-gray-600 mb-1 line-through">
              {selectedProduct.originalPrice &&
                `${selectedProduct.originalPrice} vnđ`}
            </p>
            <p className="text-xl text-gray-500 mb-2">
              {selectedProduct.price} vnđ
            </p>
            <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
            {/* màu sắc */}
            <div className="mb-4">
              <p className="text-gray-700"> Màu sắc:</p>
              <div className="flex gap-2 mt-2">
                {selectedProduct.colors.map((color, index) => (
                  <button
                    key={index}
                    className="rounded-full border w-8 h-8"
                    style={{
                      backgroundColor: color.toLocaleLowerCase(),
                      filter: 'brightness(0.5)',
                    }}
                  >
                    {}
                  </button>
                ))}
              </div>
            </div>
            {/* size */}
            <div className="mb-4">
              <p className="text-gray-700">Size:</p>
              <div className="flex gap-2 mt-2">
                {selectedProduct.sizes.map((size, index) => (
                  <button
                    key={index}
                    className="min-w-[45px] max-w-[47px] text-center py-2 rounded border select-none
                    hover:border-primary-300 hover:text-primary-300 transition-all ease-in duration-150
                active:border-primary active:text-primary cursor-pointer"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {/* số lượng */}
            <div className="mb-6">
              <p className="text-gray-700">Số lượng:</p>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  className="min-w-[34px] py-1 rounded text-lg border
                hover:border-primary-300 hover:text-primary-300 transition-all ease-in duration-150
                active:border-primary active:text-primary cursor-pointer"
                >
                  -
                </button>
                <span className="text-lg select-none">1</span>
                <button
                  className="min-w-[34px] py-1 rounded text-lg border
                hover:border-primary-300 hover:text-primary-300 transition-all ease-in duration-150
                active:border-primary active:text-primary cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            {/* Thêm giỏ hàng */}
            <button
              className="w-full text-white bg-primary-400 border-2 border-primary-400 py-3 rounded-lg font-semibold
             hover:bg-white hover:text-primary-400
              active:bg-primary-400 active:text-white 
              transition-all ease-in duration-150"
            >
              Thêm vào giỏ hàng
            </button>
            <div className="mt-10 text-gray-700">
              <h3 className="text-xl font-bold mb-4">Characteristics:</h3>
              <table className="w-full text-left text-sm text-gray-600">
                <tbody>
                  <tr>
                    <td className="py-1">Brand</td>
                    <td className="py-1">{selectedProduct.brand}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Material</td>
                    <td className="py-1">{selectedProduct.material}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
