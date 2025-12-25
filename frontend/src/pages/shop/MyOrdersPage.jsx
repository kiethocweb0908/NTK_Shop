import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, toWebp } from '@/lib/utils';
import { fetchMyOrders } from '@/redux/slices/orderSlice';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    orders,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      limit: 5,
    },
    loading,
    error,
  } = useSelector((state) => state.orders);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (user) {
      dispatch(
        fetchMyOrders({
          page,
          limit: pagination.limit,
        })
      )
        .unwrap()
        .then((result) => {
          toast.success(result.message || 'Lấy đơn hàng ...');
        })
        .catch((error) => {
          toast.error(error?.message || error);
        });
    }
  }, [dispatch, user, page]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      console.log('searchParam: ', searchParams);
      setSearchParams({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative flex justify-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="hidden absolute top-full -translate-y-full left-0
          lg:flex items-center
          rounded-full py-2 px-5 
          bg-white/5  backdrop-blur-md border-[0.5px] border-white/50 
          text-sm text-shadow-lg shadow-lg font-semibold
          hover:bg-white/10 hover:px-6!
          transition-all duration-300 ease-out"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Quay lại trang trước
        </button>
        <h2
          className="text-xl text-center md:text-lg font-semibold uppercase text-shadow-lg 
        py-3 px-5 border border-white/50 rounded-full
        bg-white/5 backdrop-blur-md shadow-lg"
        >
          Đơn hàng của tôi
        </h2>
      </div>
      <div
        className="shadow-lg overflow-auto rounded-xl bg-white/5 border-[1.5px] border-white/70
        backdrop-blur-md"
      >
        <table
          className="w-full 
        text-left text-sm text-black"
        >
          <thead
            className="bg-white/15 backdrop-blur-md 
            text-xs uppercase text-shadow-sm"
          >
            <tr>
              <th className="py-2 px-4 sm:py-4 text-center">Ảnh</th>
              <th className="py-2 px-4 sm:py-4 text-center">Mã đơn</th>
              <th className="py-2 px-4 sm:py-4 text-center">Ngày đặt</th>
              <th className="py-2 px-4 sm:py-4 text-center">Số sản phẩm</th>
              <th className="py-2 px-4 sm:py-4 text-center">Giá</th>
              <th className="py-2 px-4 sm:py-4 text-center">TT thanh toán</th>
              <th className="py-2 px-4 sm:py-4 text-center">TT đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.orderNumber}
                  onClick={() => handleRowClick(order._id)}
                  className="border-b last:border-b-0 border-black/15 cursor-pointer 
                  transition-all duration-150 ease-linear
                  hover:border-black/30 hover:bg-black/3 "
                >
                  <td className="py-3 px-2 sm:px-4 flex justify-center">
                    <img
                      src={toWebp(order.orderItems[0].image)}
                      alt={order.orderItems[0].name}
                      className="w-10 h-12 sm:min-w-12 sm:min-h-16 object-cover 
                      border border-white shadow-lg rounded-lg "
                    />
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-shadow-md font-semibold text-center whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="shadow-lg border-white backdrop-blur-xl bg-transparent py-2 px-2"
                    >
                      #{order.orderNumber}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold text-gray-600">
                    <Badge
                      variant="secondary"
                      className="shadow-lg border-white backdrop-blur-xl bg-transparent py-2 px-2"
                    >
                      {new Date(order.createdAt).toLocaleTimeString()}{' '}
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Badge>
                  </td>

                  <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                    <Badge
                      variant="secondary"
                      className="shadow-lg border-white backdrop-blur-xl bg-transparent py-2 px-2 rounded-2xl w-9 h-9"
                    >
                      {order.orderItems.length}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                    <Badge
                      variant="secondary"
                      className="shadow-lg border-white backdrop-blur-xl bg-transparent py-2 px-3 "
                    >
                      {formatCurrency(order.totalPrice)}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-shadow-md  ">
                    <Badge
                      variant="secondary"
                      className={`shadow-lg border-white backdrop-blur-xl bg-transparent py-2 px-3
                        ${order.isPaid ? 'text-green-700' : 'text-yellow-600/80'}`}
                    >
                      {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Badge>
                  </td>

                  {/* Trạng thái đơn */}
                  <td className="py-3 px-2 sm:px-4 text-center text-shadow-sm">
                    <Badge
                      variant="secondary"
                      className={`shadow-lg border-white backdrop-blur-xl bg-transparent py-2 px-3
                        ${order.status === 'processing' && 'text-orange-600/80'}
                      ${order.status === 'confirmed' && 'text-blue-600/80'}
                      ${order.status === 'shipping' && 'text-purple-600/80'}
                      ${order.status === 'delivered' && 'text-green-600/80'}
                      ${order.status === 'cancelled' && 'text-red-600/80'}`}
                    >
                      {order.status === 'processing' && 'Chờ xác nhận'}
                      {order.status === 'confirmed' && 'Đã xác nhận'}
                      {order.status === 'shipping' && 'Đang vận chuyển'}
                      {order.status === 'delivered' && 'Đã giao'}
                      {order.status === 'cancelled' && 'Đã huỷ'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                  Bạn chưa có đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  );
};

export default MyOrdersPage;
