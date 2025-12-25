import { clearSelectedOrder, fetchOrderById } from '@/redux/slices/orderSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
// Icons
import {
  ArrowLeft,
  Hash,
  Mail,
  MapPin,
  Phone,
  User2,
  Building2,
  Landmark,
  Home,
  Tag,
  IdCard,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, toWebp } from '@/lib/utils';
import AlertDialogDemo from '@/components/Common/AlertDialog';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchOrderById({ id }))
      .unwrap()
      .then((result) => {
        console.log(result);
        toast.success(result.message);
        setOrderDetails(result.order);
      })
      .catch((error) => {
        toast.error(error);
      });

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)',
        }}
      />
      {/* Your Content/Components */}
      <div className="relative z-10 max-w-7xl mx-auto py-11 px-4">
        <div className="relative flex flex-col md:flex-row items-center justify-center mb-4 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="md:absolute md:top-[50%] md:-translate-y-[50%] md:left-0
          flex items-center
          rounded-xl md:rounded-full py-2 px-4 w-full md:w-auto text-center justify-center
          bg-white/5  backdrop-blur-md border-[0.5px] border-white/50 
          text-sm text-shadow-lg shadow-lg font-semibold
          hover:bg-white/10 hover:px-5
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
            Chi tiết đơn hàng
          </h2>
        </div>
        {!orderDetails ? (
          <p>Không tìm thấy chi tiết đơn hàng</p>
        ) : (
          <div
            className="p-4 sm:p-6 rounded-xl 
          border border-white/50 bg-white/5 backdrop-blur-md shadow-xl"
          >
            <div className=" mb-6 flex flex-col-reverse xl:flex-row items-center justify-between gap-4">
              {/* Mã đơn thời gian */}
              <div
                className="flex flex-col sm:flex-row  items-center justify-between p-4 
            rounded-2xl border border-white/50 backdrop-blur-xl shadow-lg 
            w-full
            xl:flex-1 xl:max-w-1/2"
              >
                <div
                  className="text-lg md:text-xl font-semibold text-shadow-sm
                flex gap-3 items-center"
                >
                  <Tag className="h-7 w-7 text-amber-600/50" />
                  {orderDetails.orderNumber}
                </div>
                <Badge
                  variant="secondary"
                  className="shadow-lg bg-white/5 border-white backdrop-blur-ml py-2 px-2"
                >
                  <Clock className="mr-1" />
                  {new Date(orderDetails.createdAt).toLocaleTimeString()}{' '}
                  {new Date(orderDetails.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Badge>
              </div>
              {/* Thông báo thanh toán */}
              {orderDetails.expiresAt &&
                orderDetails.paymentStatus === 'pending' &&
                orderDetails.status !== 'cancelled' && (
                  <div
                    className="p-4 w-full xl:w-auto xl:flex-1.5 flex flex-col sm:flex-row items-center justify-between gap-2
            rounded-2xl border border-white/50 backdrop-blur-xl shadow-lg
            text-red-500/80 font-semibold
            text-center sm:text-left"
                  >
                    Để không bị huỷ đơn, hãy tiến hành thanh toán trước
                    <Badge
                      variant="secondary"
                      className="shadow-lg bg-white/5 border-white backdrop-blur-ml py-2 px-2 text-black"
                    >
                      <Clock className="mr-1" />
                      {new Date(orderDetails.expiresAt).toLocaleTimeString()}{' '}
                      {new Date(orderDetails.expiresAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Badge>
                  </div>
                )}
            </div>
            {/* customer, Payment, Shipping Info */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 xl:mb-8 mb-4 lg:mb-0">
              {/* Thông tin */}
              <div className="flex-1 flex flex-col gap-2 p-4 border border-white/70 rounded-xl shadow-lg">
                <h4 className="text-lg font-semibold">Thông tin người đặt</h4>
                <div className="flex items-center text-shadow-md">
                  <User2 className="h-5 w-5 mr-2 text-blue-500/50" />
                  {orderDetails.name}
                </div>
                <div className="flex items-center text-shadow-md">
                  <Mail className="h-5 w-5 mr-2 text-red-500/50" />
                  {orderDetails.email}
                </div>
                <div className="flex items-center text-shadow-md">
                  <Phone className="h-5 w-5 mr-2 text-amber-500/50" />
                  {orderDetails.phone}
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="lg:hidden xl:flex flex-1.5 flex flex-col gap-2 p-4 border border-white/70 rounded-xl shadow-lg">
                <h4 className="text-lg font-semibold">Địa chỉ giao hàng</h4>
                <div className="flex items-start text-shadow-md">
                  <MapPin className="h-5 w-5 mr-2 translate-y-[3px] text-red-500/50" />
                  {orderDetails.shippingAddress.fullAddress}
                </div>
                <div className="flex items-center text-shadow-md">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600/50" />
                  {orderDetails.shippingAddress.province}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-shadow-md">
                    <Landmark className="h-5 w-5 mr-2 text-green-600/50" />
                    {orderDetails.shippingAddress.district},
                  </div>{' '}
                  <div className="flex items-center text-shadow-md">
                    <Home className="h-5 w-5 mr-2 text-amber-600/50" />
                    {orderDetails.shippingAddress.ward}
                  </div>
                </div>
              </div>

              {/* Trạng thái*/}
              <div className="flex-1 flex flex-col gap-2 p-4 border border-white/70 rounded-xl shadow-lg">
                <h4 className="text-lg font-semibold">Trạng thái đơn hàng</h4>
                <div className="flex items-center text-shadow-md gap-2">
                  <p>Phương thức thanh toán:</p>
                  <p
                    className={`py-1 px-3 rounded-full border border-white/80 backdrop-blur-2xl shadow-lg text-shadow-lg font-mono bg-transparent
                      ${orderDetails.paymentMethod === 'cod' && 'text-green-600/80'}
                      ${orderDetails.paymentMethod === 'paypal' && 'text-blue-600/80'}
                      ${orderDetails.paymentMethod === 'momo' && 'text-red-600/80'}`}
                  >
                    {orderDetails.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center text-shadow-md gap-2">
                  <p>Trạng thái thanh toán:</p>
                  <p
                    className={`py-1 px-3 rounded-full border border-white/90 backdrop-blur-2xl shadow-lg text-shadow-lg
                    ${orderDetails.paymentStatus === 'pending' && 'text-orange-600/80'}
                    ${orderDetails.paymentStatus === 'paid' && 'text-green-600/80'}
                    ${orderDetails.paymentStatus === 'failed' && 'text-red-600/80'}
                    ${orderDetails.paymentStatus === 'refunded' && 'text-gray-600/80'}`}
                  >
                    {orderDetails.paymentStatus === 'pending' && 'Chưa thanh toán'}
                    {orderDetails.paymentStatus === 'paid' && 'Đã thanh toán'}
                    {orderDetails.paymentStatus === 'failed' && 'Thất bại'}
                    {orderDetails.paymentStatus === 'refunded' && 'Hoàn tiền'}
                  </p>
                </div>
                <div className="flex items-center text-shadow-md gap-2">
                  <p>Trạng thái đơn hàng:</p>
                  <p
                    className={`py-1 px-3 rounded-full border border-white/90 backdrop-blur-2xl shadow-lg text-shadow-lg
                      ${orderDetails.status === 'processing' && 'text-orange-600/80'}
                      ${orderDetails.status === 'confirmed' && 'text-blue-600/80'}
                      ${orderDetails.status === 'shipping' && 'text-purple-600/80'}
                      ${orderDetails.status === 'delivered' && 'text-green-600/80'}
                      ${orderDetails.status === 'cancelled' && 'text-red-600/80'}`}
                  >
                    {orderDetails.status === 'processing' && 'Chờ xác nhận'}
                    {orderDetails.status === 'confirmed' && 'Đã xác nhận'}
                    {orderDetails.status === 'shipping' && 'Đang vận chuyển'}
                    {orderDetails.status === 'delivered' && 'Đã giao'}
                    {orderDetails.status === 'cancelled' && 'Đã huỷ'}
                  </p>
                </div>
              </div>
            </div>
            {/* Địa chỉ < xl*/}
            <div className="hidden lg:flex xl:hidden lg:flex-col gap-2 p-4 border border-white/70 rounded-xl shadow-lg my-4">
              <h4 className="text-lg font-semibold">Địa chỉ giao hàng</h4>
              <div className="flex items-start text-shadow-md">
                <MapPin className="h-5 w-5 mr-2 translate-y-[3px] text-red-500/50" />
                {orderDetails.shippingAddress.fullAddress}
              </div>
              <div className="flex items-center text-shadow-md">
                <Building2 className="h-5 w-5 mr-2 text-blue-600/50" />
                {orderDetails.shippingAddress.province}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-shadow-md">
                  <Landmark className="h-5 w-5 mr-2 text-green-600/50" />
                  {orderDetails.shippingAddress.district},
                </div>{' '}
                <div className="flex items-center text-shadow-md">
                  <Home className="h-5 w-5 mr-2 text-amber-600/50" />
                  {orderDetails.shippingAddress.ward}
                </div>
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
                      <th className="py-2 px-4 sm:py-4 text-center">Giá</th>
                      <th className="py-2 px-4 sm:py-4 text-center">Số lượng</th>
                      <th className="py-2 px-4 sm:py-4 text-center">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.orderItems.length > 0 ? (
                      orderDetails.orderItems.map((item) => (
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
                            <Link to={`/product/${item.productId}`}>{item.name}</Link>
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
                {formatCurrency(orderDetails.totalPrice - orderDetails.shippingPrice)}
              </p>
              <p>Phí ship: {formatCurrency(orderDetails.shippingPrice)}</p>
              <p>
                Tổng: {''}
                {formatCurrency(orderDetails.totalPrice)}
              </p>
            </div>
          </div>
        )}
        <div className="w-full flex justify-end mt-4 gap-6">
          {orderDetails?.status === 'processing' && (
            <AlertDialogDemo action="cancelOrder" product={orderDetails} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
