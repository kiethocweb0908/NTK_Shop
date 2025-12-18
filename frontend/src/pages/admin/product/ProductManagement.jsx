import {
  deleteProductThunk,
  fetchAdminProducts,
  setAdminFilters,
  toggleProductFeaturedThunk,
  toggleProductPublished,
} from '@/redux/admin/slices/adminProductsSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// utils & Data
import { formatCurrency, formatTime, toWebp } from '@/lib/utils';
import { sort, filter, rowsPerPage, genders } from '@/lib/data/data';
// Shadcn
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Icons
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  EyeOff,
  Eye,
  Package,
  Trash2,
  Edit,
  Star,
  Plus,
  Search,
  ArrowRight,
  Columns,
  Filter,
  ArrowUpDown,
  User2,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import AlertDialogDemo from '@/components/Common/AlertDialog';

const ProductManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, pagination, loading, error, filters } = useSelector(
    (state) => state.adminProducts
  );
  const { categories } = useSelector((state) => state.categories);

  // Sử dụng useSearchParams
  const [searchParams, setSearchParams] = useSearchParams();
  //
  const [localSearch, setLocalSearch] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);
  // State các cột hiện / ẩn
  const [visibleColumns, setVisibleColumns] = useState({
    category: true,
    collection: false,
    gender: true,
    createdAt: true,
  });

  // Lấy filter params từ URL
  const getFilterParams = () => {
    const params = Object.fromEntries(searchParams);
    return {
      gender: params.gender || 'allGender',
      category: params.category || 'allCategories',
      status: params.status || 'all',
      sort: params.sort || 'newest',
      search: params.search || '',
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
    };
  };

  // Cập nhật URL params
  const updateFilterParams = (updates) => {
    const currentParams = Object.fromEntries(searchParams);
    let newParams = { ...currentParams, ...updates };

    // Reset về trang 1 khi filter thay đổi
    if (!updates.page) newParams.page = 1;

    // Xóa param nếu giá trị mặc định hoặc rỗng
    if (newParams.gender === 'allGender') delete newParams.gender;
    if (newParams.category === 'allCategories' || '') delete newParams.category;
    if (newParams.status === 'all') delete newParams.status;
    if (!newParams.search) delete newParams.search;
    if (newParams.sort === 'newest') delete newParams.sort;
    if (newParams.page === 1) delete newParams.page;
    if (newParams.limit === 10) delete newParams.limit;

    // Cập nhật URL
    setSearchParams(newParams);
  };

  // Fetch product
  useEffect(() => {
    const filterParams = getFilterParams();
    dispatch(fetchAdminProducts(filterParams));
    dispatch(setAdminFilters(filterParams));
  }, [dispatch, searchParams]);

  // Xử lý search với debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    // Clear timer cũ
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set timer mới (300ms debounce)
    const timer = setTimeout(() => {
      updateFilterParams({ search: value });
    }, 300);

    setDebounceTimer(timer);
  };

  // Xử lý filter changes
  const handleGenderChange = (value) => {
    updateFilterParams({ gender: value });
  };

  const handleCategoryChange = (value) => {
    console.log(value);

    if (value === 'allCategories') {
      updateFilterParams({ category: '' });
    } else {
      updateFilterParams({ category: value });
    }
  };

  const handleStatusChange = (value) => {
    updateFilterParams({ status: value });
  };

  const handleSortChange = (value) => {
    updateFilterParams({ sort: value });
  };

  const handleLimitChange = (value) => {
    updateFilterParams({ limit: parseInt(value) });
  };

  const handlePageChange = (page) => {
    updateFilterParams({ page });
  };

  // Toggle cột hiển thị
  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Hàm tính tổng tồn kho
  const getTotalStock = (product) => {
    return (
      product.variants?.reduce((total, variant) => {
        return total + variant.sizes?.reduce((sum, size) => sum + size.countInStock, 0);
      }, 0) || 0
    );
  };

  // Lấy filter params hiện tại
  const currentFilters = getFilterParams();

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

  // Trạng thái Ẩn hiện
  const togglePublished = async (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return toast.error('Không tìm thấy sản phẩm từ id', { duration: 3000 });

    try {
      const response = await dispatch(
        toggleProductPublished({ _id: productId })
      ).unwrap();
      toast.success(response?.message || 'Thành công!');
    } catch (error) {
      toast.error(error?.message || error || 'Lỗi');
    }
  };

  // Thêm/bỏ nổi bật
  const toggleFeatured = async (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return toast.error('Không tìm thấy sản phẩm từ id', { duration: 3000 });

    try {
      const response = await dispatch(
        toggleProductFeaturedThunk({ id: productId })
      ).unwrap();
      toast.success(response?.message || 'Thành công!');
    } catch (error) {
      toast.error(error || 'Lỗi');
    }
  };

  // Xoá sản phẩm
  const handleDelete = async (productId) => {
    if (!productId) return toast.error('Không nhận được id sản phẩm', { duration: 3000 });
    const product = products.find((p) => p._id.toString() === productId);
    if (!product) return toast.error('Không tìm thấy sản phẩm từ id', { duration: 3000 });

    const toastId = toast.loading('Đang xoá sản phẩm...', { duration: Infinity });
    try {
      const response = await dispatch(deleteProductThunk({ productId })).unwrap();
      toast.success(response?.message || 'Xoá thành công!');
    } catch (error) {
      toast.error(error || 'Lỗi', { id: toastId, duration: 3000 });
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tiêu đề và tìm kiếm */}
      <div className="flex justify-between items-center mb-6">
        {/* tiêu đề */}
        <h2 className="text-2xl font-semibold uppercase ">Quản Lý Sản Phẩm</h2>
        {/* giới tính, danh muc, bộ sưu tập */}
        <div className="max-w-[572px] flex justify-between relative gap-4">
          {/* Giới tính */}
          <div>
            <Select value={currentFilters.gender} onValueChange={handleGenderChange}>
              <SelectTrigger className="w-45 py-4">
                <User2 className="mr-1 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white w-45">
                <SelectItem className={'hover:bg-gray-100'} key={0} value="allGender">
                  Tất cả giới tính
                </SelectItem>

                <SelectItem className={'hover:bg-gray-100'} key={1} value="Men">
                  Nam
                </SelectItem>
                <SelectItem className={'hover:bg-gray-100'} key={2} value="Women">
                  Nữ
                </SelectItem>
                <SelectItem className={'hover:bg-gray-100'} key={3} value="Unisex">
                  Unisex
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Danh mục*/}
          <div>
            <Select value={currentFilters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-45 py-4">
                <Layers className="mr-1 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white w-45">
                <SelectItem
                  className={'hover:bg-gray-100'}
                  key="all"
                  value="allCategories"
                >
                  Tất cả danh mục
                </SelectItem>
                {categories.map((category, index) => (
                  <SelectItem
                    key={index}
                    value={category._id}
                    className={'hover:bg-gray-100'}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Bộ sưu tập */}
          <div>
            <Select value={currentFilters.gender} onValueChange={handleGenderChange}>
              <SelectTrigger className="w-45 py-4">
                <User2 className="mr-1 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white w-45">
                <SelectItem className={'hover:bg-gray-100'} key={0} value="allGender">
                  Tất cả giới tính
                </SelectItem>

                <SelectItem className={'hover:bg-gray-100'} key={1} value="Men">
                  Nam
                </SelectItem>
                <SelectItem className={'hover:bg-gray-100'} key={2} value="Women">
                  Nữ
                </SelectItem>
                <SelectItem className={'hover:bg-gray-100'} key={3} value="Unisex">
                  Unisex
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Trên */}
      <div className="my-4 flex  items-end justify-between">
        {/* Thêm mới */}
        <Link to={`/admin/products/add`} className="cursor-pointer">
          <Badge
            variant="success"
            className="py-2 px-4 text-shadow-md font-bold rounded-lg"
          >
            <Plus />
            Thêm sản phẩm mới
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
              'py-4 px-10 w-70 shadow-md rounded-lg border border-gray-300' +
              'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            }
          />
          <button className="absolute right-2.5 h-5 w-5 text-gray-400 -translate-y-0.5">
            <ArrowRight />
          </button>
        </div>
        {/* Lọc, sắp xếp, ẩn/hiện cột */}
        <div className="min-w-[572px] max-w-[572px] flex justify-between">
          {/* Lọc */}
          <div>
            <Select value={currentFilters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-50 py-4">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white w-50">
                {filter.map((f, index) => (
                  <SelectItem className={'hover:bg-gray-100'} key={index} value={f.value}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sắp xếp */}
          <div className="">
            <Select value={currentFilters.sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40 py-4">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent className="bg-white w-40">
                {sort.map((s) => (
                  <SelectItem
                    key={s.value}
                    className={'hover:bg-gray-100'}
                    value={s.value}
                  >
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ẩn hiện cột */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  Cột hiển thị
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.category}
                      onCheckedChange={() => toggleColumn('category')}
                    />
                    <span>Danh mục</span>
                  </label>
                </div>
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.collection}
                      onCheckedChange={() => toggleColumn('collection')}
                    />
                    <span>Bộ sưu tập</span>
                  </label>
                </div>
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.gender}
                      onCheckedChange={() => toggleColumn('gender')}
                    />
                    <span>Giới tính</span>
                  </label>
                </div>
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.createdAt}
                      onCheckedChange={() => toggleColumn('createdAt')}
                    />
                    <span>Ngày tạo</span>
                  </label>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <th className="py-4 pl-20 pr-4">Tên</th>
              <th className="py-4 px-4 text-center">Tồn kho</th>
              <th className="py-4 px-4 text-center">Giá</th>
              {visibleColumns.category && <th className="py-4 px-4">Danh mục</th>}
              {visibleColumns.collection && <th className="py-4 px-4">Bộ sưu tập</th>}
              {visibleColumns.gender && (
                <th className="py-4 px-4 text-center">Giới tính</th>
              )}
              <th className="py-4 px-4 text-center">Trạng thái</th>
              {visibleColumns.createdAt && (
                <th className="py-4 px-4 text-center">NGày tạo</th>
              )}
              <th className="py-4 px-4 text-center w-[140px]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => {
                const totalStock = getTotalStock(product);
                const mainImage = toWebp(product?.variants[0]?.images[0]?.url);
                return (
                  <tr
                    key={product._id}
                    onClick={() => navigate(`${product._id}`)}
                    className={`border-b border-gray-300 text-sm text-black/80  cursor-pointer
                      ${!product.isPublished ? 'bg-black/15 opacity-70 hover:opacity-100 transition-all duration-200' : 'hover:bg-gray-50'}`}
                  >
                    {/* Tên */}
                    <td className="py-3 px-4 flex ">
                      <img
                        className="w-12 h-15 object-cover rounded mr-5"
                        src={mainImage}
                        alt={product?.variants[0]?.images[0]?.altText}
                      />
                      <div className="flex items-center">
                        <p className="">{product.name}</p>
                      </div>
                    </td>
                    {/* Tồn kho */}
                    <td className="py-3 px-4 text-center">
                      <Badge
                        className="h-7 min-w-7 rounded-full  font-semibold tabular-nums"
                        variant="secondary"
                      >
                        {totalStock}
                      </Badge>
                    </td>
                    {/* giá */}
                    <td className="py-3 px-4 text-center">
                      <p
                        className={`${product.discountPrice > 0 && 'line-through text-gray-400'}`}
                      >
                        {formatCurrency(product?.price)}
                      </p>
                      {product?.discountPrice && (
                        <p className="text-red-500">
                          {formatCurrency(product?.discountPrice)}
                        </p>
                      )}
                    </td>
                    {/* Danh mục */}
                    {visibleColumns.category && (
                      <td className="py-3 px-4">{product?.category?.name}</td>
                    )}
                    {/* Bộ sưu tập */}
                    {visibleColumns.collection && (
                      <td className="py-3 px-4">
                        {product?.productCollection?.name || ''}
                      </td>
                    )}
                    {/* Giới tính */}
                    {visibleColumns.gender && (
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            product?.gender === 'Men'
                              ? 'male'
                              : product?.gender === 'Women'
                                ? 'female'
                                : 'unisex'
                          }
                          className="min-w-[50px]"
                        >
                          {product?.gender === 'Men'
                            ? 'Nam'
                            : product?.gender === 'Women'
                              ? 'Nữ'
                              : 'unisex'}
                        </Badge>
                      </td>
                    )}
                    {/* Trạng thái */}
                    <td className="py-3 px-4 text-center space-y-2">
                      {/* Hiện ẩn */}
                      <div>
                        <Badge
                          variant={product?.isPublished ? 'success' : 'neutral'}
                          className="min-w-[93px]"
                        >
                          {product?.isPublished ? <CheckCircle /> : <EyeOff />}

                          {product?.isPublished ? 'Đang bán' : 'Ẩn'}
                        </Badge>
                      </div>
                      {/* Số lượng ít & hết hàng */}
                      {totalStock <= 10 && (
                        <div>
                          <Badge
                            variant={
                              totalStock === 0
                                ? 'soldOut'
                                : totalStock <= 10
                                  ? 'warning'
                                  : ''
                            }
                            className="min-w-[93px]"
                          >
                            {totalStock === 0 ? (
                              <XCircle />
                            ) : totalStock <= 20 ? (
                              <AlertTriangle />
                            ) : (
                              ''
                            )}

                            {totalStock === 0
                              ? 'Hết hàng'
                              : totalStock <= 20
                                ? 'Số lượng ít'
                                : ''}
                          </Badge>
                        </div>
                      )}
                    </td>
                    {/* Ngày tạo */}
                    {visibleColumns.createdAt && (
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">
                          {formatTime(product?.createdAt)}
                        </Badge>
                      </td>
                    )}

                    {/* Hành động */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-3 px-4 w-[140px] cursor-default"
                    >
                      <div className="grid grid-cols-4 gap-3">
                        {/* Ẩn */}
                        <AlertDialogDemo
                          cb={togglePublished}
                          product={product}
                          action="published"
                          loading={loading}
                        />
                        {/* Nổi Bật */}
                        <AlertDialogDemo
                          cb={toggleFeatured}
                          product={product}
                          action="featured"
                          loading={loading}
                        />
                        {/* Chỉnh sửa */}
                        <Link to={`/admin/products/${product._id}/edit`} className="p-1">
                          <Edit className="hover:text-orange-500 h-5 w-5" />
                        </Link>
                        {/* Xoá */}
                        <AlertDialogDemo
                          cb={handleDelete}
                          product={product}
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
                  Không tìm thấy sản phẩm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="bg-gray-100 text-xs px-4 py-3 text-gray-700 flex gap-2 sticky bottom-0 z-5">
          <div className="text-sm font-medium">Tổng số sản phẩm: </div>
          <div className="text-sm font-bold"> {pagination.total}</div>
        </div>
      </div>

      {/* Số dòng và phân trang */}
      <div className="mt-4 flex justify-between items-center">
        {/* Số dòng */}
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold">Số dòng / trang: </p>
          <Select value={currentFilters.limit} onValueChange={handleLimitChange}>
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
  );
};

export default ProductManagement;
