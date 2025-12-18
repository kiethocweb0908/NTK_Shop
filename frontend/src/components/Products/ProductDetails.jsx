// React
import React, { useCallback, useEffect, useRef, useState } from 'react';
// Shadcn
import { toast } from 'sonner';
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

import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedProduct,
  fetchProductDetails,
  fetchSimilarProducts,
} from '@/redux/slices/productsSlice';
// Component
import ProductGrid from './ProductGrid';
import QuantitySelector from './QuantitySelector ';
import { addToCart } from '@/redux/slices/cartSlice';

// format
import { formatCurrency, toWebp } from '@/lib/utils';

//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  // const { userId, guestId } = useSelector((state) => state.auth);
  const productFetchId = productId || id;

  // Carousel shadcn
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const [mainImage, setMainImage] = useState(0);
  const [emblaApi, setEmblaApi] = useState(null); // Lưu api

  // Current color Index
  const [currentColorIndex, setcurrentColorIndex] = useState(0);
  // Selected color
  const [selectedColor, setSelectedColor] = useState(
    selectedProduct?.variants[currentColorIndex]?.colorName
  );
  // Selected size
  const [selectedSize, setSelectedSize] = useState('');
  // quantity
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  useEffect(() => {
    if (productFetchId) {
      // QUAN TRỌNG: Clear dữ liệu cũ TRƯỚC khi fetch mới
      dispatch(clearSelectedProduct());
      dispatch(fetchProductDetails({ id: productFetchId }));
      dispatch(fetchSimilarProducts({ id: productFetchId }));

      // Reset state khi thay đổi product
      setcurrentColorIndex(0);
      setSelectedSize('');
      setQuantity(1);
    }
  }, [productFetchId, dispatch]);

  //--------------------------------------------------------------------
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
  //--------------------------------------------------------------------

  //quantity - +
  const handleQuantityChange = useCallback(
    (action) => {
      if (action === 'minus') {
        if (quantity <= 1) {
          toast.warning('số lượng không thể nhỏ hơn 1!');
          return;
        }
        setQuantity((prev) => prev - 1);
      }

      if (action === 'plus') {
        const currentSize = selectedProduct.variants[currentColorIndex].sizes.find(
          (s) => s.name === selectedSize
        );

        if (!currentSize) {
          toast.warning('Vui lòng chọn size trước!');
          return;
        }

        if (quantity >= currentSize.countInStock) {
          toast.warning('đã đạt đến số lượng trong kho!');
          return;
        }
        setQuantity((prev) => prev + 1);
      }
    },
    [quantity, selectedProduct, currentColorIndex, selectedSize]
  );

  //reset số lượng khi đổi size
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  // Effect để cập nhật khi product load xong
  useEffect(() => {
    if (selectedProduct?.variants?.[currentColorIndex]) {
      setSelectedColor(selectedProduct.variants[currentColorIndex].colorName);
    }
  }, [selectedProduct, currentColorIndex, selectedColor]);

  //chạy lại khi thay đổi màu sắc, reset size
  useEffect(() => {
    setSelectedColor(selectedProduct?.variants[currentColorIndex]?.colorName);
    setSelectedSize('');
  }, [currentColorIndex]);

  //Add to cart
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Vui lòng chọn màu sắc và kích thước!', {
        duration: 1000,
      });
      return;
    }

    setIsButtonDisable(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
      })
    )
      .unwrap()
      .then((result) => {
        toast.success(result.message || 'Sản phẩm đã được thêm vào giỏ hàng!', {
          duration: 2000,
        });
      })
      .catch((error) => {
        // Hiển thị thông báo lỗi từ backend
        toast.error(error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
      })
      .finally(() => {
        setIsButtonDisable(false);
      });
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error}</p>;

  console.log('Product Details, curent Color: ', selectedColor);

  return (
    <div className="p-4">
      {selectedProduct && (
        <div className="max-w-6xl mx-auto bg-white p4-8 sm:p-8  rounded-lg">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-10 md:gap-0">
            {/* left */}
            <div className="flex flex-col sm:flex-row  md:col-span-8 lg:col-span-6">
              {/* Thumbnails */}
              <div className="hidden sm:flex flex-col space-y-4 min-w-[60px] mr-5">
                {selectedProduct?.variants[currentColorIndex].images.map(
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
              <div className="sm:col-span-6 max-h-[466px]">
                <Carousel
                  setApi={setEmblaApi} // Nhận api
                  plugins={[plugin.current]}
                  className="mb-4 sm:mb-0 rounded-xl overflow-hidden max-h-[488px] border border-gray-200"
                  // onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                >
                  <CarouselContent>
                    {selectedProduct?.variants[currentColorIndex].images.map(
                      (image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={toWebp(image.url)}
                            alt="Main Product"
                            className={`w-full h-full object-cover object-center`}
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
                {selectedProduct?.variants[currentColorIndex].images.map(
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
            <div className="sm:mt-10 md:mt-0 md:ml-10 md:col-span-4 lg:col-span-6 text-justify">
              {/* Tên giá mô tả */}
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                {selectedProduct?.name} {'- '}
                {selectedProduct?.variants[currentColorIndex].colorName}
              </h1>
              <p
                className={`text-xl text-gray-500 mb-1
                ${selectedProduct.discountPrice ? 'line-through' : ''}`}
              >
                {formatCurrency(selectedProduct?.price)}
              </p>
              {selectedProduct.discountPrice && (
                <div className="flex gap-5 items-center">
                  <p className="text-2xl text-primary-300">
                    {formatCurrency(selectedProduct?.discountPrice)}
                  </p>
                  <p className="p-2 rounded-full bg-primary-300 text-white font-medium text-">
                    {Math.floor(
                      ((selectedProduct.discountPrice - selectedProduct.price) /
                        selectedProduct.price) *
                        100
                    )}
                    %
                  </p>
                </div>
              )}
              <p className="text-gray-600 mb-4 mt-4">{selectedProduct?.description}</p>
              {/* màu sắc */}
              <div className="mb-4">
                <p className="text-gray-700"> Màu sắc:</p>
                <div className="flex gap-2 mt-2">
                  {selectedProduct?.variants.map((variant, index) => (
                    <button
                      onClick={() => setcurrentColorIndex(index)}
                      key={variant.colorName}
                      className={`rounded-full border w-8 h-8 transition-all duration-150 ease-in
                      ${
                        selectedColor === variant.colorName
                          ? 'border-4 border-primary-600'
                          : 'border-gray-300'
                      }`}
                      style={{
                        backgroundColor: variant.colorHex.toLocaleLowerCase(),
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
                  {selectedProduct?.variants[currentColorIndex].sizes.map(
                    (size, index) => (
                      <button
                        disabled={size.countInStock === 0}
                        onClick={() => setSelectedSize(size.name)}
                        key={index}
                        className={`min-w-[45px] max-w-[47px] text-center py-2 rounded border select-none transition-all ease-in duration-150
                      ${
                        size.countInStock === 0
                          ? 'bg-gray-200 text-gray-400 cursor-default opacity-60'
                          : 'hover:border-primary-300 hover:text-primary-300 active:border-primary active:text-primary cursor-pointer'
                      }
                      ${
                        selectedSize === size.name
                          ? 'bg-primary-400 text-white border-primary-400'
                          : ''
                      }`}
                      >
                        {size.name}
                      </button>
                    )
                  )}
                </div>
              </div>
              {/* số lượng */}
              <QuantitySelector
                className="mb-6"
                quantity={quantity}
                handleQuantityChange={handleQuantityChange}
              />

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
                      {/* <td className="py-1">Brand</td>
                    <td className="py-1">{selectedProduct.brand}</td> */}
                    </tr>
                    <tr>
                      <td className="py-1">Material</td>
                      <td className="py-1">{selectedProduct?.material}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* sản phẩm liên quan */}
          {similarProducts.length > 0 && (
            <>
              <div className="mt-20">
                <h2 className="text-2xl text-center font-medium mb-4">
                  Có thể bạn cũng thích
                </h2>
                <ProductGrid products={similarProducts} loading={loading} error={error} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
