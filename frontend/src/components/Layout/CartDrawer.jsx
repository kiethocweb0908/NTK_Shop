import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import CartContents from '../Cart/CartContents';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ cartDrawerOpen, tonggleCartDrawer }) => {
  const navigate = useNavigate();
  const handleCheckout = () => {
    tonggleCartDrawer();
    navigate('/checkout');
  };

  return (
    <div
      className={`fixed top-0 right-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-1/3 lg:min-w-[480px] h-full 
    bg-white shadow-lg 
        transform transition-transform duration-300 flex flex-col z-50
  ${cartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* close button */}
      <div className="flex justify-end p-4">
        <button onClick={tonggleCartDrawer} className="cursor-pointer">
          <IoMdClose className="h-6 w-6 text-gray-600 hover:text-primary-300" />
        </button>
      </div>

      {/* Nội dung giỏ hàng */}
      <div className="flex flex-col p-4 overflow-y-auto">
        <h2 className="font-semiboldbold text-xl mb-4">Giỏ hàng của bạn</h2>
        <CartContents />
      </div>

      {/* Thanh toán */}
      <div className="p-4 bg-white sticky bottom-0">
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
