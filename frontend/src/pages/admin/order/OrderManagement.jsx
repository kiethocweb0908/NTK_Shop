import {
  ArrowRight,
  ArrowUpDown,
  Clock,
  Columns,
  Filter,
  Hourglass,
  Search,
  Wallet,
  Banknote,
  CreditCard,
  Coins,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllOrdersAdmin,
  setAdminFilters,
  updateOrderStatusThunk,
} from '@/redux/admin/slices/adminOrdersSlice';
import { formatCurrency, formatTime, toWebp } from '@/lib/utils';
import {
  orderStatus,
  paymentMethods,
  paymentStatus,
  rowsPerPage,
  timeFilter,
} from '@/lib/data/data';
import AlertDialogDemo from '@/components/Common/AlertDialog';
import { toast } from 'sonner';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.adminOrders
  );
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    quantity: true,
    totalPrice: true,
    paymentMethod: false,
    paymentStatus: true,
    email: false,
    phone: false,
  });

  // Lấy filter
  const getFilterParams = () => {
    const params = Object.fromEntries(searchParams);
    return {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      status: params.status || 'all',
      paymentStatus: params.paymentStatus || 'all',
      paymentMethod: params.paymentMethod || 'all',
      time: params.time || 'all',
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
    if (newParams.paymentStatus === 'all' || newParams.paymentStatus === '')
      delete newParams.paymentStatus;
    if (newParams.paymentMethod === 'all' || newParams.paymentMethod === '')
      delete newParams.paymentMethod;
    if (newParams.time === 'all' || newParams.time === '') delete newParams.time;
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
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set timer mới (300ms debounce)
    const timer = setTimeout(() => {
      updateFilterParams({ search: value });
    }, 300);

    setDebounceTimer(timer);
  };

  // Toggle cột hiển thị
  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
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
    dispatch(fetchAllOrdersAdmin(filterParams)).unwrap();
    dispatch(setAdminFilters(filterParams));
  }, [dispatch, searchParams]);

  // Lấy filter params hiện tại
  const currentFilters = getFilterParams();

  // handle update status
  const handleUpdateStatus = async (orderId) => {
    if (!orderId) return toast.error('Không nhận được ID');

    try {
      const response = await dispatch(updateOrderStatusThunk({ orderId })).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Trên */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold uppercase">Quản Lý Đơn hàng</h2>

        {/* Lọc thanh toán*/}
        <div className="w-1/2 flex justify-end gap-3">
          {/* Phương thức thanh toán */}
          <div>
            <Select
              value={currentFilters.paymentMethod}
              onValueChange={(value) => handleFilterChange('paymentMethod', value)}
            >
              <SelectTrigger className="w-55 py-4">
                <Wallet className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái thanh toán" />
              </SelectTrigger>
              <SelectContent className="bg-white w-50">
                <SelectItem className={'hover:bg-gray-100'} key={1} value="all">
                  Tất cả phương thức
                </SelectItem>
                {paymentMethods.map((f, index) => (
                  <SelectItem
                    className={'hover:bg-gray-100'}
                    key={index + 1}
                    value={f.value}
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trạng thái thanh toán */}
          <div>
            <Select
              value={currentFilters.paymentStatus}
              onValueChange={(value) => handleFilterChange('paymentStatus', value)}
            >
              <SelectTrigger className="w-55 py-4">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái thanh toán" />
              </SelectTrigger>
              <SelectContent className="bg-white w-50">
                {paymentStatus.map((f, index) => (
                  <SelectItem className={'hover:bg-gray-100'} key={index} value={f.value}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* giữa */}
      <div className="mb-4 flex  items-end justify-between">
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
          {/* Lọc theo trạng thái */}
          <div>
            <Select
              value={currentFilters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-55 py-4">
                <Hourglass className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lọc theo trạng thái đơn hàng" />
              </SelectTrigger>
              <SelectContent className="bg-white w-50">
                {orderStatus.map((f, index) => (
                  <SelectItem className={'hover:bg-gray-100'} key={index} value={f.value}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thời gian */}
          <div>
            <Select
              value={currentFilters.time}
              onValueChange={(value) => handleFilterChange('time', value)}
            >
              <SelectTrigger className="w-50 py-4">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lọc theo thời gian" />
              </SelectTrigger>
              <SelectContent className="bg-white w-50">
                {timeFilter.map((f, index) => (
                  <SelectItem className={'hover:bg-gray-100'} key={index} value={f.value}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ẩn hiện cột */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-40">
                <Button variant="outline" className="flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  Cột hiển thị
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white w-40">
                {/* số lượng */}
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.quantity}
                      onCheckedChange={() => toggleColumn('quantity')}
                    />
                    <span>Số lượng</span>
                  </label>
                </div>
                {/* giá */}
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.totalPrice}
                      onCheckedChange={() => toggleColumn('totalPrice')}
                    />
                    <span>Giá tiền</span>
                  </label>
                </div>
                {/* phương thức */}
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.paymentMethod}
                      onCheckedChange={() => toggleColumn('paymentMethod')}
                    />
                    <span>Phương thức</span>
                  </label>
                </div>
                {/* Trạng thái thanh toán */}
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.paymentStatus}
                      onCheckedChange={() => toggleColumn('paymentStatus')}
                    />
                    <span>TT thanh toán</span>
                  </label>
                </div>

                {/* email */}
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.email}
                      onCheckedChange={() => toggleColumn('email')}
                    />
                    <span>email</span>
                  </label>
                </div>

                {/* phone */}
                <div className="px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={visibleColumns.phone}
                      onCheckedChange={() => toggleColumn('phone')}
                    />
                    <span>Điện thoại</span>
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
              <th className="py-4 pl-20 pr-4 min-w-[283px]">Mã đơn hàng</th>
              <th className="py-4 px-4 text-center">Ngày đặt</th>
              {visibleColumns.quantity && (
                <th className="py-4 px-4 text-center">Số sản phẩm</th>
              )}
              {visibleColumns.totalPrice && (
                <th className="py-4 px-4 text-center">Giá</th>
              )}
              {visibleColumns.paymentMethod && (
                <th className="py-4 px-4 text-center">Phương thức</th>
              )}
              {visibleColumns.paymentStatus && (
                <th className="py-4 px-4 text-center">TT thanh toán</th>
              )}
              <th className="py-4 px-4 text-center">TT đơn hàng</th>
              {visibleColumns.email && <th className="py-4 px-4 text-center">Email</th>}
              {visibleColumns.phone && (
                <th className="py-4 px-4 text-center">Điện thoại</th>
              )}
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
              orders.length > 0 ? (
                orders.map((order) => {
                  // const totalStock = getTotalStock(order);
                  const mainImage = toWebp(order.orderItems[0].image);
                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`${order._id}`)}
                      className={`border-b border-gray-300 text-sm text-black/80  cursor-pointer
                      hover:bg-gray-50`}
                    >
                      {/* Mã đơn */}
                      <td className="py-3 px-4 flex ">
                        <img
                          className="w-12 h-15 object-cover rounded mr-5"
                          src={mainImage}
                          alt={order.orderNumber}
                        />
                        <div className="flex items-center">
                          <p className="">{order.orderNumber}</p>
                        </div>
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 -translate-y-[0.85px]" />
                          {formatTime(order?.createdAt)}
                        </Badge>
                      </td>

                      {/* Số sản phẩm */}
                      {visibleColumns.quantity && (
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className="h-7 min-w-7 rounded-full  font-semibold tabular-nums"
                            variant="secondary"
                          >
                            {order.orderItems.length}
                          </Badge>
                        </td>
                      )}
                      {/* giá */}
                      {visibleColumns.totalPrice && (
                        <td className="py-3 px-4 text-center">
                          {/* <p
                          // className={`${product.discountPrice > 0 && 'line-through text-gray-400'}`}
                          ></p> */}
                          <Badge variant="outline" className="border-gray-300">
                            <Coins className="text-amber-500" />
                            {formatCurrency(order?.totalPrice)}
                          </Badge>
                        </td>
                      )}

                      {/* Phương thức thanh toán */}
                      {visibleColumns.paymentMethod && (
                        <td className="py-3 px-4 text-center space-y-2">
                          <Badge
                            variant={
                              order?.paymentMethod === 'cod'
                                ? 'success'
                                : order?.paymentMethod === 'paypal'
                                  ? 'male'
                                  : order?.paymentMethod === 'momo' && 'soldOut'
                            }
                            className="min-w-[83px]"
                          >
                            {order?.paymentMethod === 'cod' ? (
                              <Banknote className="h-4! w-4!" />
                            ) : (
                              <Wallet className="h-4! w-4!" />
                            )}
                            {order?.paymentMethod}
                          </Badge>
                        </td>
                      )}

                      {/* Trạng thái thanh toán */}
                      {visibleColumns.paymentStatus && (
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              (order?.paymentStatus === 'pending' && 'warning') ||
                              (order?.paymentStatus === 'paid' && 'success') ||
                              (order?.paymentStatus === 'failed' && 'soldOut') ||
                              (order?.paymentStatus === 'refunded' && 'neutral')
                            }
                            className="min-w-[97.66px]"
                          >
                            {order?.paymentStatus === 'pending' && 'Chờ thanh toán'}
                            {order?.paymentStatus === 'paid' && 'Đã thanh toán'}
                            {order?.paymentStatus === 'failed' && 'Thất bại'}
                            {order?.paymentStatus === 'refunded' && 'Hoàn tiền'}
                          </Badge>
                        </td>
                      )}

                      {/* Trạng thái đơn hàng */}
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            (order?.status === 'processing' && 'warning') ||
                            (order?.status === 'confirmed' && 'unisex') ||
                            (order?.status === 'shipping' && 'male') ||
                            (order?.status === 'delivered' && 'success') ||
                            (order?.status === 'completed' && 'success') ||
                            (order?.status === 'cancelled' && 'soldOut')
                          }
                          className="min-w-[96.13px]"
                        >
                          {order?.status === 'processing' && 'Chờ xác nhận'}
                          {order?.status === 'confirmed' && 'Đã xác nhận'}
                          {order?.status === 'shipping' && 'Vận chuyển'}
                          {order?.status === 'delivered' && 'Đã giao'}
                          {order?.status === 'completed' && 'Hoàn thành'}
                          {order?.status === 'cancelled' && 'Bị huỷ'}
                        </Badge>
                      </td>

                      {/* Email */}
                      {visibleColumns.email && (
                        <td className="py-3 px-4">{order?.email}</td>
                      )}

                      {/* Điện thoại */}
                      {visibleColumns.phone && (
                        <td className="py-3 px-4">{order?.phone}</td>
                      )}

                      {/* Hành động */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-3 px-1 min-w-[140px] cursor-default"
                      >
                        <div className="w-full">
                          {(order?.status === 'processing' ||
                            order?.status === 'confirmed') && (
                            <AlertDialogDemo
                              action="updateStatusOrder"
                              cb={handleUpdateStatus}
                              order={order}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    Không tìm thấy đơn hàng.
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  Đang tìm đơn hàng...
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="bg-gray-100 text-xs px-4 py-3 text-gray-700 flex gap-2 sticky bottom-0 left-0 right-0 z-5">
          <div className="text-sm font-medium">Tổng số đơn hàng: </div>
          <div className="text-sm font-bold"> {orders.length}</div>
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
  );
};

export default OrderManagement;
