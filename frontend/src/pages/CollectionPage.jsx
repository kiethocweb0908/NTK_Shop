import FilterSidebar from '@/components/Products/FilterSidebar';
import ProductGrid from '@/components/Products/ProductGrid';
import SortOptions from '@/components/Products/SortOptions';
import { fetchProductsByFilters } from '@/redux/slices/productsSlice';
import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const queryParams = Object.fromEntries([...searchParams]);

  // const [products, setProducts] = useState([]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsByFilters({ collection, ...queryParams }));
  }, [dispatch, collection, searchParams]);

  // Đóng mở filter
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

  return (
    <div className="flex flex-col lg:flex-row container mx-auto gap-6">
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
        fixed inset-y-0 z-10 lg:z-0 left-0 w-1/2 lg:w-1/5 
        bg-white overflow-y-auto transition-transform duration-300 
        lg:static lg:translate-x-0 
        pl-6 pr-6 lg:pl-0 lg:pr-0`}
      >
        <FilterSidebar />
      </div>

      <div className="lg:w-4/5 p-4 lg:p-0">
        <h2 className="text-2xl uppercase mb-4 pt-4">Tất cả sản phẩm</h2>
        {/* sort options */}
        <SortOptions />

        {/* product grid */}
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default CollectionPage;
