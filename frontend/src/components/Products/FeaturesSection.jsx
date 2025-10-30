import React from 'react';
import {
  HiArrowPathRoundedSquare,
  HiOutlineCreditCard,
  HiShoppingBag,
} from 'react-icons/hi2';

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 lg:px-auto bg-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 text-center">
        {/* Feature 1 */}
        <div className="flex flex-col items-center ">
          <div className="p-4 rounded-full mb-4">
            <HiShoppingBag className="text-xl" />
          </div>
          <h4 className="tracking-tighter mb-2">Miễn phí vận chuyển</h4>
          <p className="text-gray-600 text-sm tracking-tighter">
            Cho tất cả đơn hàng trên 1.000.000 vnđ
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center ">
          <div className="p-4 rounded-full mb-4">
            <HiArrowPathRoundedSquare className="text-xl" />
          </div>
          <h4 className="tracking-tighter mb-2">15 ngày đổi trả</h4>
          <p className="text-gray-600 text-sm tracking-tighter">
            Đổi trả hàng nhanh chóng
          </p>
        </div>

        {/* Feature 3*/}
        <div className="flex flex-col items-center ">
          <div className="p-4 rounded-full mb-4">
            <HiOutlineCreditCard className="text-xl" />
          </div>
          <h4 className="tracking-tighter mb-2">Thanh toán an toàn</h4>
          <p className="text-gray-600 text-sm tracking-tighter">
            Quy trình thanh toán an toàn 100%
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
