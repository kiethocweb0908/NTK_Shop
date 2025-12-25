import React from 'react';
import Topbar from '../Layout/Topbar';
import Navbar from './Navbar';

const Header = () => {
  return (
    <header className="border bg-white border-gray-200 sticky top-0 left-0 right-0 z-50">
      {/* Topbar */}
      <Topbar />

      {/* Navbar */}
      <Navbar />

      {/* Cart Drawer */}
    </header>
  );
};

export default Header;
