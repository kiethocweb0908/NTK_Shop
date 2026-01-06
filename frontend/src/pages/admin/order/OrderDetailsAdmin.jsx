import AlertDialogDemo from '@/components/Common/AlertDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTime, toWebp } from '@/lib/utils';
import {
  clearSelectedOrder,
  fetchOrderDetailsAdmin,
} from '@/redux/admin/slices/adminOrdersSlice';
import {
  ArrowLeft,
  Building2,
  Clock,
  Home,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Tag,
  User2,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

const OrderDetailsAdmin = () => {
  const { selectedOrder, loading, error } = useSelector(
    (state) => state.admin.adminOrders
  );
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log(orderId);

  useEffect(() => {
    dispatch(fetchOrderDetailsAdmin({ orderId })).unwrap();

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch]);

  if (loading) {
    <p>Đang tải sản phẩm...</p>;
  }

  return (
    <div className="relative z-10 max-w-5xl mx-auto p-6">
      <h2 className="text-2xl text-center font-semibold uppercase mb-6">
        Chi tiết đơn hàng
      </h2>

      <div className="p-4 rounded-xl border border-gray-200 shadow-md space-y-6">
        {/* mã đơn */}
        <div className="text-lg md:text-xl font-semibold text-shadow-sm flex gap-3 items-center">
          <Tag className="h-7 w-7 text-amber-600/50" />
          {selectedOrder?.orderNumber}
        </div>

        {/* thông tin */}
        <h2 className="font-semibold mb-4">Thông tin khách hàng</h2>
        <div className="flex justify-around gap-4">
          {/* họ tên */}
          <div className="flex gap-2">
            <User2 className="h-5 w-5 text-blue-500" />
            <p className="font-medium">{selectedOrder?.name}</p>
          </div>
          {/* email */}
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-red-400" />
            <p className="font-medium">{selectedOrder?.email}</p>
          </div>
          {/* phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-amber-500" />
            <p className="font-medium">{selectedOrder?.phone}</p>
          </div>
        </div>

        {/* địa chỉ */}
        <h2 className="font-semibold mb-4">Địa chỉ giao hàng</h2>
        <div className="flex justify-around gap-4">
          {/* tỉnh/tp */}
          <div className="flex gap-2 items-start">
            <Building2 className="h-5 w-5 text-blue-500" />
            <p className="font-medium">{selectedOrder?.shippingAddress?.province}</p>
          </div>
          {/* Quận huyện */}
          <div className="flex gap-2 items-start">
            <Landmark className="h-5 w-5 text-green-500" />
            <p className="font-medium">{selectedOrder?.shippingAddress?.district}</p>
          </div>
          {/* xã */}
          <div className="flex gap-2 items-start">
            <Home className="h-5 w-5 text-amber-500" />
            <p className="font-medium">{selectedOrder?.shippingAddress?.ward}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <MapPin className="h-5 w-5 text-red-400" />
          <p className="font-medium">{selectedOrder?.shippingAddress?.fullAddress}</p>
        </div>

        {/* Thời gina */}
        <div>
          <h2 className="font-semibold mb-4">Thời gian</h2>
          {/* ngày đặt */}
          <div className="flex justify-around">
            <div>
              <p>Ngày đặt</p>
              <p>
                {selectedOrder?.createdAt
                  ? formatTime(selectedOrder?.createdAt)
                  : 'Chưa có'}
              </p>
            </div>
            <div>
              <p>Ngày đi đơn</p>
              <p>
                {selectedOrder?.shippingAt
                  ? formatTime(selectedOrder?.shippingAt)
                  : 'Chưa có'}
              </p>
            </div>
            <div>
              <p>Ngày giao</p>
              <p>
                {selectedOrder?.deliveredAt
                  ? formatTime(selectedOrder?.deliveredAt)
                  : 'Chưa có'}
              </p>
            </div>
            <div>
              <p>Ngày hoàn thành</p>
              <p>
                {selectedOrder?.completedAt
                  ? formatTime(selectedOrder?.completedAt)
                  : 'Chưa có'}
              </p>
            </div>
          </div>
        </div>

        {/* Trạng thái */}
        <h2 className="font-semibold mb-4">Trạng thái</h2>
        <div className="flex justify-around">
          {/* phương thức */}
          <div>
            <p>Phương thức thanh toán</p>
            <p>{selectedOrder?.paymentMethod}</p>
          </div>

          {/* Trạng thái thanh toán */}
          <div>
            <p>Trạng thái thanh toán</p>
            <p>
              {selectedOrder?.paymentStatus === 'pending' && 'Chờ thanh toán'}
              {selectedOrder?.paymentStatus === 'paid' && 'Đã thanh toán'}
              {selectedOrder?.paymentStatus === 'failed' && 'Thất bại'}
              {selectedOrder?.paymentStatus === 'refunded' && 'Hoàn tiền'}
            </p>
          </div>

          {/* Trạng thái đơn */}
          <div>
            <p>Trạng thái thanh toán</p>
            <p>
              {selectedOrder?.status === 'processing' && 'Chờ xác nhận'}
              {selectedOrder?.status === 'confirmed' && 'Đã xác nhận'}
              {selectedOrder?.status === 'shipping' && 'Đang vận chuyển'}
              {selectedOrder?.status === 'delivered' && 'Đã giao'}
              {selectedOrder?.status === 'completed' && 'Hoàn thành'}
              {selectedOrder?.status === 'cancelled' && 'Đã huỷ'}
            </p>
          </div>
        </div>
        {/* Product list */}
        <div className="overflow-x-auto">
          <div className="rounded-xl border border-black/5 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-sm text-black">
              <thead className="bg-black/10 backdrop-blur-md text-xs uppercase text-shadow-sm">
                <tr>
                  <th className="py-2 px-4 sm:py-4 text-center">Ảnh</th>
                  <th className="py-2 px-4 sm:py-4 text-center">Tên sản phẩm</th>
                  <th className="py-2 px-4 sm:py-4 text-center">Size</th>
                  <th className="py-2 px-4 sm:py-4 text-center">Giá</th>
                  <th className="py-2 px-4 sm:py-4 text-center">Số lượng</th>
                  <th className="py-2 px-4 sm:py-4 text-center">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder?.orderItems.length > 0 ? (
                  selectedOrder?.orderItems.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b last:border-b-0 border-black/15 cursor-pointer 
                                transition-all duration-150 ease-linear
                                hover:border-black/30 hover:bg-black/3 "
                    >
                      {/* ảnh */}
                      <td className="py-3 px-2 sm:px-4 flex justify-center">
                        <img
                          src={toWebp(item.image)}
                          alt={item.name}
                          className="w-10 h-12 sm:min-w-12 sm:min-h-16 object-cover 
                                    border border-white shadow-lg rounded-lg "
                        />
                      </td>
                      {/* Tên */}
                      <td
                        className="py-3 px-2 sm:px-4 text-shadow-md font-semibold text-center whitespace-nowrap
                          hover:text-blue-500"
                      >
                        <Link to={`/admin/products/${item.productId}`}>{item.name}</Link>
                      </td>
                      {/* size*/}
                      <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                        {item.size}
                      </td>
                      {/* Giá */}
                      <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold text-gray-600">
                        {formatCurrency(item.price)}
                      </td>
                      {/* Số lượng */}
                      <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                        {item.quantity}
                      </td>
                      {/* Thành tiền */}
                      <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                        {formatCurrency(item.quantity * item.price)}
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
        </div>
        {/* Tổng tiền và ship */}
        <div className="w-full flex  gap-6 items-center justify-end p-4 text-shadow-sm font-semibold">
          <p>
            Thành tiền:{' '}
            {formatCurrency(selectedOrder?.totalPrice - selectedOrder?.shippingPrice)}
          </p>
          <p>Phí ship: {formatCurrency(selectedOrder?.shippingPrice)}</p>
          <p>
            Tổng: {''}
            {formatCurrency(selectedOrder?.totalPrice)}
          </p>
        </div>
      </div>

      {/* back & submit */}
      <div className="flex flex-col gap-3 fixed bottom-7 right-5 z-10">
        <Button
          type="button"
          onClick={() => navigate(-1)}
          variant={'outline'}
          className="flex items-center gap-3 bg-white justify-start
                    underline text-blue-500
                    hover:text-blue-400 active:text-blue-500"
        >
          <ArrowLeft className="" /> Quay lại trang trước
        </Button>
      </div>
    </div>
  );
};

export default OrderDetailsAdmin;
