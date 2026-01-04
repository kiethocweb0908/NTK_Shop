import React, { useContext, useEffect, useRef, useState } from 'react';
import { HiMagnifyingGlass, HiMiniXMark } from 'react-icons/hi2';
import { LayoutContext } from '../Layout/UserLayout';
import { formatCurrency } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ toggleSearch, isSearhOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  // const [debounceTimer, setDebounceTimer] = useState(null);
  const debounceRef = useRef(null);
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const isOrderCode = (q) => /^ORD-\d{13,}$/.test(q);

  useEffect(() => {
    if (!query || !query.trim()) {
      return;
    }

    // Chỉ search order khi nhập đủ mã
    if (query.startsWith('ORD') && query.startsWith('ord') && !isOrderCode(query)) {
      setData({
        type: 'orders',
        orders: [],
      });
      return;
    }

    const featchSearch = async () => {
      try {
        const response = await axiosInstance.get(`/api/search`, {
          params: { q: searchTerm },
        });
        setData(response.data);
      } catch (error) {
        toast.error(error?.response?.data);
      }
    };
    featchSearch();
  }, [query]);

  useEffect(() => {
    if (!isSearhOpen) {
      setSearchTerm('');
    } else {
      return;
    }
  }, [isSearhOpen]);

  //xử lý search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setQuery(value);
    }, 300);
  };

  const handleClick = (value) => {
    if (data.type === 'orders') {
      navigate(`/order/${value}`);
    } else if (data.type === 'products') {
      navigate(`/product/${value}`);
    }
    toggleSearch();
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full
    transition-transform duration-300
    bg-white  h-32 z-40
    ${isSearhOpen ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <form className="relative h-full flex items-center justify-center w-full z-50">
        <div className="relative w-3/4 lg:w-1/2">
          <input
            type="text"
            placeholder="Tìm kiếm 'sản phẩm' hoặc 'đơn hàng' (mã, sđt, email)..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-gray-100 py-2 px-8 focus:outline-none
              placeholder:text-gray-700 rounded-lg shadow-lg"
          />
          <button
            type="button"
            className="absolute right-7 top-1/2 transform -translate-y-1/2
              text-gray-600 hover:text-primary-300"
          >
            <HiMagnifyingGlass className="h-6 w-6" />
          </button>
          {isSearhOpen && searchTerm && (
            <div
              className="absolute top-full w-full bg-white  max-h-70 overflow-y-auto rounded-b-lg shadow-lg
            "
            >
              {/* <h3 className="sticky top-0 text-center font-medium  bg-gray-50 py-2 border-y border-gray-300">
                Sản phẩm
              </h3> */}
              <ul>
                {/* Đơn hàng */}
                {data.type === 'orders' &&
                  (data.orders.length > 0 ? (
                    data.orders.map((order) => (
                      <li
                        key={order._id}
                        onClick={() => handleClick(order._id)}
                        className="px-4 py-5 cursor-pointer 
                  flex items-center justify-between gap-2
                  border-b border-gray-300 last:border-b-0
                  hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 lg:gap-8">
                          <img
                            src={order.orderItems[0].image}
                            alt={order.orderNumber}
                            className="h-12 w-10 rounded-sm"
                          />
                          <p className="max-w-40 sm:max-w-[210px] lg:max-w-100 truncate">
                            {order.orderNumber}
                          </p>
                        </div>
                        <p>{formatCurrency(order.totalPrice)}</p>
                      </li>
                    ))
                  ) : (
                    <li className="py-10 w-full text-center">Không tìm thấy đơn hàng</li>
                  ))}
                {/* sản phẩm */}
                {data.type === 'products' &&
                  (data.products.length > 0 ? (
                    data.products.map((product) => (
                      <li
                        key={product._id}
                        onClick={() => handleClick(product._id)}
                        className="px-4 py-5 cursor-pointer 
                  flex items-center justify-between gap-2
                  border-b border-gray-300 last:border-b-0
                  hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 lg:gap-8">
                          <img
                            src={product.variants[0].images[0].url}
                            alt={product.variants[0].images[0].altText}
                            className="h-12 w-10 rounded-sm"
                          />
                          <p className="max-w-40 sm:max-w-[210px] lg:max-w-100 truncate">
                            {product.name}
                          </p>
                        </div>
                        <div>
                          {product?.discountPrice && (
                            <p className="text-red-500">
                              {formatCurrency(product.discountPrice)}
                            </p>
                          )}
                          <p className={`${product.discountPrice && 'line-through'}`}>
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-10 w-full text-center">Không tìm thấy sản phẩm</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
        {/* close */}
        <button
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2
            text-gray-600 hover:text-primary-300"
          onClick={toggleSearch}
        >
          <HiMiniXMark className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
