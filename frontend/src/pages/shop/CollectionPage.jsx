import FilterSidebar from '@/components/Products/FilterSidebar';
import ProductGrid from '@/components/Products/ProductGrid';
import SortOptions from '@/components/Products/SortOptions';
import { fetchProductsByFilters } from '@/redux/slices/productsSlice';
import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

// Shadcn
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, pagination, loading, error } = useSelector((state) => state.products);
  // const queryParams = Object.fromEntries([...searchParams]);

  // const [products, setProducts] = useState([]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageParams = () => {
    const params = Object.fromEntries(searchParams);
    return {
      page: parseInt(params.page) || 1,
    };
  };

  const updatePageParams = (updatedParams) => {
    const currentParams = Object.fromEntries(searchParams);
    let newParams = { ...currentParams, ...updatedParams };

    // Xóa các tham số không cần thiết
    if (newParams.page === 1 || newParams.page === '1' || newParams.page === undefined) {
      delete newParams.page;
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      updatePageParams({ page: page.toString() }); // Chuyển thành string
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    }
  };

  useEffect(() => {
    const page = getPageParams();
    dispatch(fetchProductsByFilters({ collection, ...Object.fromEntries(searchParams) }));
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

  // Tạo mảng pages cho pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblepages = 5;

    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblepages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblepages - 1);

    if (endPage - startPage + 1 < maxVisiblepages) {
      startPage = Math.max(1, endPage - maxVisiblepages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-start max-w-7xl mx-auto gap-3 xl:gap-6 py-9 mt-[106.4px]">
        {/* mobile filter button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden border p-2 flex justify-center items-center
          rounded-xl border-white/70 shadow-lg backdrop-blur-md
          font-semibold text-shadow-sm mx-3 mt-1"
        >
          <FaFilter className="mr-2" />
          Bộ lọc
        </button>

        {/* filter sidebar */}
        <div
          ref={sidebarRef}
          className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-[105%]'}
        inset-y-0 z-50 lg:z-0 left-0 lg:w-1/4 lg:min-w-[260px] xl:w-1/5 
         overflow-y-auto transition-all duration-300 
        fixed top-0 bottom-0 lg:sticky lg:top-30 lg:translate-x-0 
        p-4 min-h-143 
        lg:border 
        lg:rounded-xl  ml-0 lg:ml-3 xl:ml-0
        bg-white/85 shadow-lg backdrop-blur-3xl
        border-white/95`}
        >
          <FilterSidebar />
        </div>

        <div
          className="lg:w-3/4 xl:w-4/5 p-4 ml-3 lg:ml-0 mr-3 xl:mr-0
        border bg-white/85 shadow-lg backdrop-blur-3xl
        border-white/95
        rounded-xl min-h-133 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-shadow-sm uppercase ">Sản phẩm</h2>
            {/* sort options */}
            <SortOptions />
          </div>

          {/* product grid */}
          <ProductGrid products={products} loading={loading} error={error} />

          {/* Phân trang */}
          <div className="mt-6 mb-6 w-full">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1) {
                        handlePageChange(pagination.currentPage - 1);
                      }
                    }}
                    className={
                      pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }
                  />
                </PaginationItem>

                {/* Ellipsis for many pages */}
                {pagination.totalPages > 5 && pagination.currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      isActive={pageNum === pagination.currentPage}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Ellipsis for many pages */}
                {pagination.totalPages > 5 &&
                  pagination.currentPage < pagination.totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage < pagination.totalPages) {
                        handlePageChange(pagination.currentPage + 1);
                      }
                    }}
                    className={
                      pagination.currentPage === pagination.totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionPage;
