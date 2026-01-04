import React from 'react';
import Topbar from '../Layout/Topbar';
import Navbar from './Navbar';

const Header = () => {
  return (
    <header
      className="border-b-[0.5px]  border-white/5 shadow-sm ovx
    fixed bg-black/3 top-0 left-0 right-0 z-20"
    >
      <div className="backdrop-blur-sm">
        {/* Topbar */}
        <Topbar />

        {/* Navbar */}
        <Navbar />

        {/* Cart Drawer */}
      </div>
    </header>
  );
};

export default Header;
