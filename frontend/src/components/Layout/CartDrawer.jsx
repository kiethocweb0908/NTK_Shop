import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import CartContents from '../Cart/CartContents';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchCart } from '@/redux/slices/cartSlice';

const CART_VALIDATE_INTERVAL = 2 * 60 * 1000; // 2 phút

const CartDrawer = ({ cartDrawerOpen, tonggleCartDrawer }) => {
  const { cart, lastValidatedAt, loading, error } = useSelector(
    (state) => state.user.cart
  );
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const handleCheckout = () => {
    tonggleCartDrawer();
    if (cart && cart?.products.length > 0) {
      navigate('/checkout');
    } else {
      toast.warning('Không thể tới trang thanh toán khi giỏ hàng trống!');
    }
  };

  useEffect(() => {
    if (!cartDrawerOpen) return;

    const shouldValidate =
      !cart || !lastValidatedAt || Date.now() - lastValidatedAt > CART_VALIDATE_INTERVAL;

    if (shouldValidate) {
      dispatch(fetchCart());
    }
  }, [cartDrawerOpen, cart, lastValidatedAt, dispatch]);

  return (
    <div
      className={`fixed top-0 bottom-0 right-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-1/3 lg:min-w-[480px] h-full 
    bg-white shadow-lg 
        transform transition-transform duration-300 flex flex-col z-60
  ${cartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* close button */}
      <div className="flex justify-end p-4">
        <button onClick={tonggleCartDrawer} className="cursor-pointer">
          <IoMdClose className="h-6 w-6 text-gray-600 hover:text-primary-300" />
        </button>
      </div>

      {/* Nội dung giỏ hàng */}
      <div className="flex flex-col p-4 overflow-y-auto min-h-[526px]">
        <h2 className="font-semiboldbold text-xl mb-4">Giỏ hàng của bạn</h2>
        <CartContents />
      </div>

      {/* Thanh toán */}
      <div className="p-4 bg-white sticky right-0 left-0 bottom-0">
        <div className="flex justify-between mb-4">
          <p className="font-medium">Số lượng: {cart?.totalItems}</p>
          <p className="text-2xl leading-none font-medium">
            {cart?.totalPrice?.toLocaleString('vi-VN')}
          </p>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full text-white bg-primary-400 border-2 border-primary-400 py-3 rounded-lg font-semibold
          hover:bg-white hover:text-primary-400
          active:bg-primary-400 active:text-white 
          transition-all ease-in duration-150"
        >
          Mua hàng
        </button>
        <p className="text-sm tracking-tighter text-gray-500 mt-2 text-center">
          Chọn mua hàng để đi đến trang thanh toán
        </p>
      </div>
    </div>
  );
};

export default CartDrawer;
