import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, PackageCheck } from 'lucide-react';

const checkout = {
  _id: '123123',
  createdAt: new Date(),
  checkoutItems: [
    {
      productId: '1',
      name: 'Jacket',
      color: 'black',
      size: 'L',
      price: 350000,
      quantity: 1,
      image: 'https://picsum.photos/200?random=5',
    },
    {
      productId: '2',
      name: 'T-shirt',
      color: 'red',
      size: 'L',
      price: 250000,
      quantity: 2,
      image: 'https://picsum.photos/200?random=4',
    },
  ],
  shippingAddress: {
    address: '123 Fashion Street',
    city: 'New york',
  },
};

const OrderConfirmation = () => {
  const { selectedOrder } = useSelector((state) => state.user.orders);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedOrder) navigate('/');
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-[126.4px] flex flex-col items-center justify-center">
      {/* Container chính */}
      <div className="w-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 md:p-12 text-center transition-all">
        {/* Icon Success với màu primary đã cấu hình */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Cảm ơn bạn đã đặt hàng!
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
          Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi sẽ
          gửi email xác nhận cho bạn trong giây lát.
        </p>

        {/* Nhóm Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-600 text-white font-medium rounded-full transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Home size={18} />
            Về trang chủ
          </button>

          <button
            onClick={() => navigate(`/order/${selectedOrder._id}`)} // Hoặc path chi tiết đơn của bạn
            className="flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary hover:bg-primary/5 font-medium rounded-full transition-all cursor-pointer active:scale-95"
          >
            <PackageCheck size={18} />
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
