import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import ProductGrid from './ProductGrid';

//

const selectedProduct = {
  name: 'Stylish Jacket',
  price: 350000,
  originalPrice: 400000,
  description: 'DDây là một chiếc áo khoác với kiểu dáng Hàn Quốc',
  brand: 'FashionBrand',
  material: 'Leather',
  colors: [
    {
      name: 'Red',
      sizes: [
        {
          size: 'M',
          quantity: 5,
        },
        {
          size: 'L',
          quantity: 7,
        },
        {
          size: 'XL',
          quantity: 6,
        },
      ],
      images: [
        {
          url: 'https://picsum.photos/500?random=1',
          altText: 'Stylish Jacket 1',
        },
        {
          url: 'https://picsum.photos/500?random=2',
          altText: 'Stylish Jacket 1',
        },
        {
          url: 'https://picsum.photos/500?random=3',
          altText: 'Stylish Jacket 1',
        },
        {
          url: 'https://picsum.photos/500?random=4',
          altText: 'Stylish Jacket 1',
        },
        {
          url: 'https://picsum.photos/500?random=5',
          altText: 'Stylish Jacket 1',
        },
      ],
    },
    {
      name: 'Black',
      sizes: [
        {
          size: 'M',
          quantity: 7,
        },
        {
          size: 'L',
          quantity: 2,
        },
        {
          size: 'XL',
          quantity: 0,
        },
      ],
      images: [
        {
          url: 'https://picsum.photos/500?random=7',
          altText: 'Stylish Jacket 1',
        },
        {
          url: 'https://picsum.photos/500?random=8',
          altText: 'Stylish Jacket 1',
        },
        {
          url: 'https://picsum.photos/500?random=9',
          altText: 'Stylish Jacket 1',
        },
      ],
    },
  ],
};

const similarProducts = [
  {
    _id: 1,
    name: 'product 1',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=1' }],
  },
  {
    _id: 2,
    name: 'product 2',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=1' }],
  },
  {
    _id: 3,
    name: 'product 3',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=1' }],
  },
  {
    _id: 4,
    name: 'product 4',
    price: 250000,
    images: [{ url: 'https://picsum.photos/500?random=1' }],
  },
];

const ProductDetails = () => {
  const [currentColor, setCurrentColor] = useState(0);
  const [mainImage, setMainImage] = useState(0);
  const [emblaApi, setEmblaApi] = useState(null); // Lưu api
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    selectedProduct.colors[currentColor].name
  );
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisable] = useState(false);
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

  //Quantity - +
  const handleQuantityChange = (action) => {
    if (action === 'plus') {
      const currentSizeObj = selectedProduct.colors[currentColor].sizes.find(
        (s) => s.size === selectedSize
      );

      if (!currentSizeObj) {
        toast.warning('Vui lòng chọn size trước!');
        return;
      }

      if (quantity >= currentSizeObj.quantity) {
        toast.warning('đã đạt đến số lượng trong kho!');
        return;
      }
      setQuantity((prev) => prev + 1);
    }

    if (action === 'minus') {
      if (quantity <= 1) {
        toast.warning('số lượng không thể nhỏ hơn 1!');
        return;
      }
      setQuantity((prev) => prev - 1);
    }
  };

  //Add to cart
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Vui lòng chọn màu sắc và kích thước!', {
        duration: 1000,
      });
      return;
    }

    setIsButtonDisable(true);

    setTimeout(() => {
      toast.success('Thêm sản phẩm vào giỏ hàng thành công', {
        duration: 1000,
      });
      setIsButtonDisable(false);
    }, 500);
  };

  const handleColor = (index) => {
    setCurrentColor(index);
  };

  //chạy lại khi thay đổi màu sắc, reset size
  useEffect(() => {
    setSelectedColor(selectedProduct.colors[currentColor].name);
    setSelectedSize('');
  }, [currentColor]);

  //reset số lượng khi đổi size
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto bg-white p4-8 sm:p-8  rounded-lg">
        <div className="flex flex-col md:grid md:grid-cols-12">
          {/* left */}
          <div className="flex flex-col sm:flex-row  md:col-span-8 lg:col-span-6">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col space-y-4 min-w-[60px] mr-5">
              {selectedProduct.colors[currentColor].images.map(
                (image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.altText || `Thumbnails ${index}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2
                  transition-all duration-550 ease-in
                  ${mainImage === index ? 'border-black' : 'border-gray-300'}`}
                    onClick={() => scrollTo(index)}
                  />
                )
              )}
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
                  {selectedProduct.colors[currentColor].images.map(
                    (image, index) => (
                      <CarouselItem key={index}>
                        <img
                          src={image.url}
                          alt="Main Product"
                          className={`w-full h-auto object-cover`}
                        />
                      </CarouselItem>
                    )
                  )}
                </CarouselContent>
                {/* <CarouselPrevious />
              <CarouselNext /> */}
              </Carousel>
            </div>

            {/* mobile thumbnail */}
            <div className="sm:hidden grid grid-cols-5 gap-2 mb-4">
              {selectedProduct.colors[currentColor].images.map(
                (image, index) => (
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
                )
              )}
            </div>
          </div>
          {/* Right Side*/}
          <div className="sm:mt-10 md:mt-0 md:ml-10 md:col-span-4 lg:col-span-6">
            {/* Tên giá mô tả */}
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              {selectedProduct.name} {'- '}
              {selectedProduct.colors[currentColor].name}
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
                    onClick={() => handleColor(index)}
                    key={color.name}
                    className={`rounded-full border w-8 h-8 transition-all duration-150 ease-in
                      ${
                        selectedColor === color.name
                          ? 'border-4 border-primary-600'
                          : 'border-gray-300'
                      }`}
                    style={{
                      backgroundColor: color.name.toLocaleLowerCase(),
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
                {selectedProduct.colors[currentColor].sizes.map((size) => (
                  <button
                    disabled={size.quantity === 0}
                    onClick={() => setSelectedSize(size.size)}
                    key={size.size}
                    className={`min-w-[45px] max-w-[47px] text-center py-2 rounded border select-none transition-all ease-in duration-150
                      ${
                        size.quantity === 0
                          ? 'bg-gray-200 text-gray-400 cursor-default opacity-60'
                          : 'hover:border-primary-300 hover:text-primary-300 active:border-primary active:text-primary cursor-pointer'
                      }
                      ${
                        selectedSize === size.size
                          ? 'bg-primary-400 text-white border-primary-400'
                          : ''
                      }
                    `}
                  >
                    {size.size}
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
                  onClick={() => handleQuantityChange('minus')}
                >
                  -
                </button>
                <span className="text-lg select-none">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('plus')}
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
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={`w-full text-white bg-primary-400 border-2 border-primary-400 py-3 rounded-lg font-semibold
              transition-all ease-in duration-150
              ${
                isButtonDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-white hover:text-primary-400 active:bg-primary-400 active:text-white '
              }`}
            >
              {isButtonDisabled ? 'Đang thêm vào giỏ...' : 'Thêm vào giỏ hàng'}
            </button>
            {/* Thông tin */}
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

        {/* sản phẩm liên quan */}
        <div className="mt-20">
          <h2 className="text-2xl text-center font-medium mb-4">
            Có thể bạn cũng thích
          </h2>
          <ProductGrid products={similarProducts} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
