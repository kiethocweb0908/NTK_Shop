import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from 'react-icons/hi2';
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';
import { navType } from '../../lib/data/data';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { cart } = useSelector((state) => state.cart);
  //active navbar
  const [navActive, setNavActive] = useState('');
  // đóng / mở giỏ hàng

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const tonggleCartDrawer = () => {
    setCartDrawerOpen(!cartDrawerOpen);
    setIsOverlayVisible(!isOverlayVisible);
  };

  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const tongglNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
    setIsOverlayVisible(!isOverlayVisible);
  };

  //tấm phủ
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const toggleOverlay = () => {
    if (navDrawerOpen) {
      tongglNavDrawer();
    }
    if (cartDrawerOpen) {
      tonggleCartDrawer();
    }
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between al py-4 px-4 md:px-0 ">
        {/* Logo */}
        <div onClick={() => setNavActive('')}>
          <Link to="/" className="text-2xl font-medium text-black hover:text-primary-300">
            NTK Clothing
          </Link>
        </div>

        {/* Center */}
        <div className="hidden md:flex space-x-4">
          {Object.keys(navType).map((type, index) => (
            <Link
              key={index}
              to="/shop"
              className={`block min-w-[72px] text-center h-full p-5 
                rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-lg
                text-sm font-bold border-2 border-white
                hover:text-white hover:bg-primary
                transition-all duration-200 ease-in
                ${navActive === type ? 'active-navbar' : ''}`}
              onClick={() => setNavActive(type)}
            >
              {navType[type]}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="block bg-black px-2 text-sm text-white">
            Admin
          </Link>
          <Link to="/profile" className="p-3 hover:text-primary-300">
            <HiOutlineUser className="h-6 w-6 mx-auto" />
          </Link>
          <button
            onClick={tonggleCartDrawer}
            className="p-3 relative hover:text-primary-300 cursor-pointer"
          >
            <HiOutlineShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1 bg-primary-300 text-white text-xs rounded-full px-2 py-0.5">
              {cart?.totalItems || 0}
            </span>
          </button>
          {/* Right-Search */}
          <div className="overflow-hidden md:m-0">
            <SearchBar />
          </div>

          <button
            className="md:hidden pl-3 pt-3 pb-3"
            onClick={() => {
              tongglNavDrawer();
            }}
          >
            <HiBars3BottomRight className="h-6 w-6" />
          </button>
        </div>
      </nav>
      <CartDrawer cartDrawerOpen={cartDrawerOpen} tonggleCartDrawer={tonggleCartDrawer} />
      {/* mobile */}
      <div
        className={`md:hidden fixed top-0 left-0 w-4/5 sm:w-2/3 md:w-1/2 h-full bg-white shadow-lg transform transition-transform duration-300 z-50
          ${navDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-end p-4">
          <button onClick={tongglNavDrawer} className="cursor-pointer">
            <IoMdClose className="h-6 w-6 text-gray-600 hover:text-primary-300" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            {Object.keys(navType).map((type, index) => (
              <Link
                key={index}
                to="/shop"
                onClick={tongglNavDrawer}
                className="block text-gray-600 hover:text-primary-300"
              >
                {navType[type]}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* tấm phủ */}
      <div
        onClick={toggleOverlay}
        className={`fixed top-0 left-0 w-full h-full bg-black/20 z-40
          transition-transform duration-300
        ${isOverlayVisible ? 'block' : 'hidden'}`}
      ></div>
    </>
  );
};

export default Navbar;
