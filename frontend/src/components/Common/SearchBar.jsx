import React, { useState } from 'react';
import { HiMagnifyingGlass, HiMiniXMark } from 'react-icons/hi2';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  //xử lý đóng / mở thanh search
  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
  };

  //xử lý search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('search term: ', searchTerm);
    setIsOpen(false);
  };

  //key
  const handleKey = (e) => {
    switch (e.key) {
      case 'Enter':
        handleSearch(e);
        break;
    }
  };

  return (
    <div
      className={`flex items-center justify-center w-full transition-all duration-300 
        ${isOpen ? 'absolute top-0 left-0 w-full bg-white h-31 z-50' : 'w-auto'}`}
    >
      {isOpen ? (
        <form onSubmit={handleSearch} className="relative flex items-center justify-center w-full">
          <div className="relative w-1/2">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 px-4 py-2 pl-2 pr-12 rounded-md focus:outline-none
              placeholder:text-gray-700"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 
              text-gray-600 hover:text-primary-300"
            >
              <HiMagnifyingGlass className="h-6 w-6" />
            </button>
          </div>
          {/* close */}
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2
            text-gray-600 hover:text-primary-300"
            onClick={handleSearchToggle}
          >
            <HiMiniXMark className="h-6 w-6" />
          </button>
        </form>
      ) : (
        <button
          onClick={handleSearchToggle}
          className="pl-3 pt-3 pb-3 m-0 cursor-pointer pr-3 md:pr-0"
        >
          <HiMagnifyingGlass className="h-6 w-6 hover:text-primary-300" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
