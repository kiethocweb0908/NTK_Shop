import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      const mockOders = [
        {
          _id: '12345',
          createdAt: new Date(),
          shippingAddress: { city: 'Cần Thơ', county: 'Việt Nam' },
          orderItems: [
            {
              name: 'Product 1',
              image: 'https://picsum.photos/500?random=1',
            },
          ],
          totalPrice: 350000,
          isPaid: true,
        },
        {
          _id: '56245',
          createdAt: new Date(),
          shippingAddress: { city: 'Cần Thơ', county: 'Việt Nam' },
          orderItems: [
            {
              name: 'Product 2',
              image: 'https://picsum.photos/500?random=2',
            },
            {
              name: 'Product 1',
              image: 'https://picsum.photos/500?random=1',
            },
            {
              name: 'Product 3',
              image: 'https://picsum.photos/500?random=3',
            },
          ],
          totalPrice: 350000,
          isPaid: true,
        },
        {
          _id: '73457',
          createdAt: new Date(),
          shippingAddress: { city: 'Cần Thơ', county: 'Việt Nam' },
          orderItems: [
            {
              name: 'Product 4',
              image: 'https://picsum.photos/500?random=4',
            },
          ],
          totalPrice: 350000,
          isPaid: true,
        },
      ];

      setOrders(mockOders);
    }, 1000);
  }, []);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto pt-4 md:pt-6 md:pl-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
      <div className="relative shadow-md sm:rounded-lg overflow-hidden">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text text-gray-700">
            <tr>
              <th className="py-2 px-4 sm:py-3">Ảnh</th>
              <th className="py-2 px-4 sm:py-3">Mã đơn</th>
              <th className="py-2 px-4 sm:py-3">Ngày đặt</th>
              <th className="py-2 px-4 sm:py-3">Địa chỉ</th>
              <th className="py-2 px-4 sm:py-3">Sản phẩm</th>
              <th className="py-2 px-4 sm:py-3">Giá</th>
              <th className="py-2 px-4 sm:py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="border-b border-gray-300 cursor-pointer transition-all duration-150 ease-in
                  hover:border-gray-100 hover:opacity-80"
                >
                  <td className="py-2 px-2 sm:py4 sm:px-4">
                    <img
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order._id}
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    {order.shippingAddress
                      ? `${order.shippingAddress.city}, ${order.shippingAddress.county}`
                      : `N/A`}
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    {order.orderItems.map((item, key) => (
                      <p>{item.name}</p>
                    ))}
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    {order.totalPrice.toLocaleString('vi-VN')} vnđ
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    <span
                      className={`${
                        order.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      } px-2 py-1 rounded-full text-xs sm:text-sm font-medium`}
                    >
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
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
  );
};

export default MyOrdersPage;
