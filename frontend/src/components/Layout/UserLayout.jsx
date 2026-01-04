import React, { createContext, useState } from 'react';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import { Outlet } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import SearchBar from '../Common/SearchBar';
import NavDrawerMobile from '../Common/NavDrawerMobile';

export const LayoutContext = createContext();

const UserLayout = () => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [isSearhOpen, setIsSearchOpen] = useState(false);

  //xử lý đóng / mở thanh search
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setIsOverlayVisible((prev) => !prev);
  };

  // đóng/mở giỏ hàng
  const tonggleCartDrawer = () => {
    setCartDrawerOpen((prev) => !prev);
    setIsOverlayVisible((prev) => !prev);
  };

  const tongglNavDrawer = () => {
    setNavDrawerOpen((prev) => !prev);
    setIsOverlayVisible((prev) => !prev);
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

    if (isSearhOpen) {
      toggleSearch();
    }
  };
  return (
    <LayoutContext.Provider
      value={{
        tonggleCartDrawer,
        tongglNavDrawer,
        toggleSearch,
      }}
    >
      {/* Header */}
      <Header />

      {/* Giỏ hàng */}
      <CartDrawer cartDrawerOpen={cartDrawerOpen} tonggleCartDrawer={tonggleCartDrawer} />

      {/* Tìm kiếm */}
      <SearchBar isSearhOpen={isSearhOpen} toggleSearch={toggleSearch} />

      {/* mobile */}
      <NavDrawerMobile navDrawerOpen={navDrawerOpen} tongglNavDrawer={tongglNavDrawer} />

      <main className="bg-black/5 ">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* tấm phủ */}
      <div
        onClick={toggleOverlay}
        className={`fixed top-0 left-0 w-full h-full bg-black/15 z-30
          transition-transform duration-300
        ${isOverlayVisible ? 'block' : 'hidden'}`}
      ></div>
    </LayoutContext.Provider>
  );
};

export default UserLayout;
