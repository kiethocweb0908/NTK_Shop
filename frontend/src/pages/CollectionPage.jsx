import FilterSidebar from '@/components/Products/FilterSidebar';
import ProductGrid from '@/components/Products/ProductGrid';
import SortOptions from '@/components/Products/SortOptions';
import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from 'react-icons/fa';

const CollectionPage = () => {
  const [products, setProducts] = useState([]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    //Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    //clear event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const fetchedProducts = [
        {
          _id: 1,
          name: 'product 1',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=10' }],
        },
        {
          _id: 2,
          name: 'product 2',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=11' }],
        },
        {
          _id: 3,
          name: 'product 3',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=12' }],
        },
        {
          _id: 4,
          name: 'product 4',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=13' }],
        },
        {
          _id: 5,
          name: 'product 5',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=14' }],
        },
        {
          _id: 6,
          name: 'product 6',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=15' }],
        },
        {
          _id: 7,
          name: 'product 7',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=16' }],
        },
        {
          _id: 8,
          name: 'product 8',
          price: 250000,
          images: [{ url: 'https://picsum.photos/500?random=17' }],
        },
      ];
      setProducts(fetchedProducts);
    }, 1000);
  }, []);
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-5 container mx-auto">
      {/* mobile filter button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden border p-2 flex justify-center items-center"
      >
        <FaFilter className="mr-2" />
      </button>

      {/* filter sidebar */}
      <div
        ref={sidebarRef}
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 z-10 lg:z-0 left-0 w-64 bg-white overflow-y-auto transition-transform 
        duration-300 lg:static lg:translate-x-0 col-span-1 pl-6 pr-6 lg:pl-0 lg:pr-8`}
      >
        <FilterSidebar />
      </div>

      <div className="col-span-4 p-4 lg:p-0">
        <h2 className="text-2xl uppercase mb-4">Tất cả sản phẩm</h2>
        {/* sort options */}
        <SortOptions />

        {/* product grid */}
        <ProductGrid products={products} />
      </div>
    </div>
  );
};

export default CollectionPage;
