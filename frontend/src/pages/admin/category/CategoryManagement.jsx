import AlertDialogDemo from '@/components/Common/AlertDialog';

// shadcn
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';

import { formatTime } from '@/lib/utils';
import {
  deleteCategoryThunk,
  fetchAllCategoriesAdmin,
  toggleActiveCategoryThunk,
} from '@/redux/admin/slices/adminCategoriesSlice';
import {
  ArrowRight,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Edit,
  EyeOff,
  Filter,
  Plus,
  Search,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { rowsPerPage, sortCollection } from '@/lib/data/data';

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceRef = useRef(null);
  const { categories, pagination, loading, error, activeLoading } = useSelector(
    (state) => state.admin.categories
  );

  // Lấy filter
  const getFilterParams = () => {
    const params = Object.fromEntries(searchParams);
    return {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      status: params.status || 'all',
      sort: params.sort || 'newest',
      search: params.search || '',
    };
  };

  // cập nhật params
  const updateFilterParams = (updates) => {
    const currentParams = Object.fromEntries(searchParams);
    let newParams = { ...currentParams, ...updates };

    // Reset về trang 1 khi filter thay đổi
    if (!updates.page) newParams.page = 1;

    // Xóa param nếu giá trị mặc định hoặc rỗng
    if (newParams.page === 1) delete newParams.page;
    if (newParams.limit === 10) delete newParams.limit;
    if (newParams.status === 'all' || newParams.status === '') delete newParams.status;
    if (newParams.sort === 'newest' || newParams.time === '') delete newParams.sort;
    if (newParams.search === '') delete newParams.search;

    // Cập nhật URL
    setSearchParams(newParams);
  };

  const handleFilterChange = (field, value) => {
    if (value === 'all' || value === '') {
      updateFilterParams({ [field]: '' });
    } else {
      updateFilterParams({ [field]: value });
    }
  };

  // tìm kiếm
  const handleSearchChange = (e) => {
    const value = e.target.value;

    // Clear timer cũ
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set timer mới (300ms debounce)
    debounceRef.current = setTimeout(() => {
      updateFilterParams({ search: value });
    }, 300);
  };

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

  useEffect(() => {
    const filterParams = getFilterParams();
    dispatch(fetchAllCategoriesAdmin(filterParams))
      .unwrap()
      .then((result) => {
        // toast.success(result.message);
      })
      .catch((error) => {
        toast.error(error);
        console.error(error);
      });
  }, [dispatch, searchParams]);
  const currentFilters = getFilterParams();

  ///
  const togglePublished = async (categoryId) => {
    const toastId = toast.loading('Đang xử lý...', { duration: Infinity });
    try {
      const response = await dispatch(toggleActiveCategoryThunk({ categoryId })).unwrap();
      toast.dismiss(toastId);

      toast.success(response.message);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error);
      console.error(error);
    }
  };

  const handleDelete = async (categoryId) => {
    const toastId = toast.loading('Đang xử lý...', { duration: Infinity });
    try {
      const response = await dispatch(deleteCategoryThunk({ categoryId })).unwrap();
      toast.dismiss(toastId);
      toast.success(response.message);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error);
      console.error(error);
    }
  };

  return (
    <>
      {activeLoading && <div className="bg-black/20 fixed inset-0 z-50"></div>}
      <div className="max-w-7xl mx-auto p-6">
        {/* Trên */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold uppercase">Quản Lý Danh mục</h2>
        </div>

        {/* giữa */}
        <div className="mb-4 flex  items-end justify-between">
          {/* Thêm mới */}
          <Link to={`/admin/categories/add`} className="cursor-pointer">
            <Badge
              variant="success"
              className="py-2 px-4 text-shadow-md font-bold rounded-lg"
            >
              <Plus />
              Thêm danh mục
            </Badge>
          </Link>

          {/* Tìm kiếm */}
          <div className="col-start-2 relative flex items-center">
            <Search className="absolute left-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              defaultValue={currentFilters.search}
              onChange={handleSearchChange}
              className={
                'py-4 px-10 w-70 rounded-lg border border-gray-300' +
                'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
              }
            />
            <button className="absolute right-2.5 h-5 w-5 text-gray-400 -translate-y-0.5">
              <ArrowRight />
            </button>
          </div>

          {/* Lọc, sắp xếp, ẩn/hiện cột */}
          <div className="w-1/2 gap-3 flex justify-end">
            <div>
              <Select
                value={currentFilters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-50 py-4">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white w-50">
                  <SelectItem className={'hover:bg-gray-100'} key={0} value="all">
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem className={'hover:bg-gray-100'} key={1} value="isActive">
                    Đang hoạt động
                  </SelectItem>
                  <SelectItem className={'hover:bg-gray-100'} key={2} value="isInactive">
                    Đã ẩn
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={currentFilters.sort}
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger className="w-50 py-4">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="bg-white w-50">
                  {sortCollection.map((s) => (
                    <SelectItem
                      className={'hover:bg-gray-100'}
                      key={s.value}
                      value={s.value}
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Dữ liệu */}
        <div className="overflow-x-auto min-h-[512px] max-h-[512px] overflow-y-auto relative border border-gray-200 rounded-xl flex flex-col justify-between">
          {/* table */}
          <table className="min-w-full text-left text-gray-500 select-none">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700 sticky top-0 right-0 left-0 z-5">
              <tr>
                {/* <th className="py-3 px-4"></th> */}
                <th className="py-4 pl-20 pr-4">Tên danh mục</th>
                <th className="py-4 px-4 text-center">Số sản phẩm</th>
                <th className="py-4 px-4 text-center">Ngày tạo</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-4 text-center w-[140px]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    {error}
                  </td>
                </tr>
              ) : !loading ? (
                categories.length > 0 ? (
                  categories.map((category) => {
                    return (
                      <tr
                        key={category._id}
                        onClick={() =>
                          navigate(`/admin/products?category=${category._id}`)
                        }
                        className={`border-b border-gray-300 text-sm text-black/80  cursor-pointer
                      ${!category.isActive ? 'bg-black/15 opacity-70 hover:opacity-100 transition-all duration-200' : 'hover:bg-gray-50'}`}
                      >
                        {/* Mã đơn */}
                        <td className="py-3 flex pl-20 pr-4">
                          {/* <img
                          className="w-12 h-15 object-cover rounded mr-5"
                          src={mainImage}
                          alt={order.orderNumber}
                        /> */}
                          <div className="flex items-center">
                            <p className="">{category.name}</p>
                          </div>
                        </td>

                        {/* Số sản phẩm */}

                        <td className="py-3 px-4 text-center">
                          <Badge
                            className="h-7 min-w-7 rounded-full  font-semibold tabular-nums"
                            variant="secondary"
                          >
                            {category.totalProducts}
                          </Badge>
                        </td>

                        {/* Ngày tạo */}
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 -translate-y-[0.85px]" />
                            {formatTime(category?.createdAt)}
                          </Badge>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={category?.isActive ? 'success' : 'neutral'}
                            className="min-w-[93px]"
                          >
                            {category?.isActive ? <CheckCircle /> : <EyeOff />}

                            {category?.isActive ? 'Đang hoạt động' : 'Ẩn'}
                          </Badge>
                        </td>

                        {/* Hành động */}
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="py-3 px-1 min-w-[140px] cursor-default"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {/* Ẩn */}
                            <AlertDialogDemo
                              cb={togglePublished}
                              item={category}
                              action="toggleActive"
                              loading={loading}
                            />
                            {/* Chỉnh sửa */}
                            <Link
                              to={`/admin/categories/${category._id}/edit`}
                              className="p-1"
                            >
                              <Edit className="hover:text-orange-500 h-5 w-5" />
                            </Link>
                            {/* Xoá */}
                            <AlertDialogDemo
                              cb={handleDelete}
                              product={category}
                              action="delete"
                              loading={loading}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-gray-500">
                      Không tìm thấy danh mục.
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    Đang tìm danh mục...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-gray-100 text-xs px-4 py-3 text-gray-700 flex gap-2 sticky bottom-0 left-0 right-0 z-5">
            <div className="text-sm font-medium">Tổng số danh mục: </div>
            <div className="text-sm font-bold">{categories.length}</div>
          </div>
        </div>

        {/* Số dòng và phân trang */}
        <div className="mt-4 flex justify-between items-center">
          {/* Số dòng */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">Số dòng / trang: </p>
            <Select
              value={currentFilters.limit}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={currentFilters.limit} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {rowsPerPage.map((row) => (
                  <SelectItem
                    key={row.value}
                    className={'hover:bg-gray-100'}
                    value={row.value}
                  >
                    {row.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Phân trang */}
          <div>
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1) {
                        handleFilterChange('page', parseInt(pagination.currentPage - 1));
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
                        handleFilterChange('page', pageNum);
                      }}
                      isActive={pageNum === parseInt(pagination.currentPage)}
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
                        handleFilterChange('page', parseInt(pagination.currentPage + 1));
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

export default CategoryManagement;
