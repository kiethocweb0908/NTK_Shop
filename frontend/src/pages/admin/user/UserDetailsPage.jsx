import React, { useEffect } from 'react';
import {
  User2,
  Phone,
  Mail,
  Shield,
  Eye,
  User,
  Building2,
  Landmark,
  Home,
  MapPin,
  Clock,
  Coins,
  ArrowLeft,
} from 'lucide-react';
import { formatCurrency, formatTime, toWebp } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearselectedUser,
  fetchUserDetailsAdmin,
} from '@/redux/admin/slices/adminUserSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispacth = useDispatch();
  const { selectedUser, loading, error } = useSelector((state) => state.admin.adminUsers);

  useEffect(() => {
    dispacth(clearselectedUser());
    dispacth(fetchUserDetailsAdmin({ userId }))
      .unwrap()
      .catch((error) => {
        toast.error(error);
        console.error(error);
      });
  }, [dispacth]);

  if (loading) {
    return <p className="text-center">Đang tải thông tin...</p>;
  }

  if (error) {
    return <p>Có lỗi: {error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl text-center font-semibold uppercase mb-6">
        Chi tiết người dùng
      </h2>
      <div className="flex flex-col justify-between gap-4 p-6 border border-gray-300 rounded-xl shadow-md">
        {/* Thông tin tài khoản */}
        <h2 className="font-semibold">Thông tin người dùng</h2>
        <div className="flex justify-between gap-4">
          {/* họ tên */}
          <div className="flex gap-2">
            <User2 className="h-5 w-5 text-blue-500" />
            <p className="font-medium">{selectedUser?.user.name}</p>
          </div>
          {/* email */}
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-red-400" />
            <p className="font-medium">{selectedUser?.user.email}</p>
          </div>
          {/* phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-amber-500" />
            <p className="font-medium">{selectedUser?.user.phone}</p>
          </div>
          {/* role */}
          <div className="flex items-center gap-2">
            {selectedUser?.user.role === 'admin' && (
              <Shield className="h-5 w-5 text-green-500" />
            )}
            {selectedUser?.user.role === 'viewer' && (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
            {selectedUser?.user.role === 'customer' && (
              <User className="h-5 w-5 text-blue-500" />
            )}

            <p className="font-medium">
              {selectedUser?.user.role === 'admin' && 'Quản trị viên'}
              {selectedUser?.user.role === 'viewer' && 'Người tham quan'}
              {selectedUser?.user.role === 'customer' && 'Khách hàng'}
            </p>
          </div>
        </div>

        {/* Địa chỉ */}
        <h2 className="font-semibold mt-2">Địa chỉ</h2>
        {selectedUser?.user?.address &&
        Object.keys(selectedUser.user?.address).length > 0 ? (
          <>
            <div className="flex gap-6">
              {/* tỉnh/tp */}
              <div className="flex gap-2 items-start">
                <Building2 className="h-5 w-5 text-blue-500" />
                <p className="font-medium">{selectedUser?.user?.address?.city}</p>
              </div>
              {/* Quận huyện */}
              <div className="flex gap-2 items-start">
                <Landmark className="h-5 w-5 text-green-500" />
                <p className="font-medium">{selectedUser?.user?.address?.district}</p>
              </div>
              {/* xã */}
              <div className="flex gap-2 items-start">
                <Home className="h-5 w-5 text-amber-500" />
                <p className="font-medium">{selectedUser?.user?.address?.ward}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin className="h-5 w-5 text-red-400" />
              <p className="font-medium">{selectedUser?.user?.address?.fullAddress}</p>
            </div>
          </>
        ) : (
          <p className="py-5 text-center">Người dùng này chưa thêm địa chỉ</p>
        )}

        {/* Đơn hàng */}
        <h2 className="font-semibold mt-2">Danh sách đơn hàng</h2>
        <div className="rounded-xl border border-black/5 overflow-x-auto overflow-y-auto max-h-[504px]">
          <table className="w-full text-left text-sm text-black">
            <thead className="bg-black/10 backdrop-blur-md text-xs uppercase text-shadow-sm">
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
              {selectedUser?.orders.length > 0 ? (
                selectedUser.orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className='className="border-b last:border-b-0 border-black/15 cursor-pointer 
                        transition-all duration-150 ease-linear
                        hover:border-black/30 hover:bg-black/3 "'
                  >
                    <td className="py-3 px-2 sm:px-4 flex justify-center">
                      <img
                        src={toWebp(order.orderItems[0].image)}
                        alt={order.orderItems[0].name}
                        className="w-10 h-12 sm:min-w-12 sm:min-h-16 object-cover 
                                    border border-white shadow-lg rounded-lg "
                      />
                    </td>
                    {/* mã đơn */}
                    <td
                      className="py-3 px-2 sm:px-4 text-shadow-md font-semibold text-center whitespace-nowrap
                          hover:text-blue-500"
                    >
                      {order.orderNumber}
                    </td>
                    {/* ngày đặt*/}
                    <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 -translate-y-[0.85px]" />
                        {formatTime(order?.createdAt)}
                      </Badge>
                    </td>
                    {/* số sản phẩm */}
                    <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold text-gray-600">
                      <Badge
                        className="h-7 min-w-7 rounded-full  font-semibold tabular-nums"
                        variant="secondary"
                      >
                        {order.orderItems.length}
                      </Badge>
                    </td>
                    {/* giá */}
                    <td className="py-3 px-2 sm:px-4 text-center text-shadow-md font-semibold">
                      <Badge variant="outline" className="border-gray-300">
                        <Coins className="text-amber-500" />
                        {formatCurrency(order?.totalPrice)}
                      </Badge>
                    </td>
                    {/* tt thanh toán */}
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
                    {/* Tt đơn hàng */}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td>Người dùng này chưa có đơn hàng</td>
                </tr>
              )}
            </tbody>
          </table>
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

export default UserDetailsPage;
