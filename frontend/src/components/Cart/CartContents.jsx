import React, { useEffect, useState } from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
import QuantitySelector from '../Products/QuantitySelector ';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  removeFromCart,
  updateCartItemQuantity,
} from '@/redux/slices/cartSlice';
import { toast } from 'sonner';

const CartContents = () => {
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);

  // API -> cart
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Quantity
  const handleQuantityChange = async (productId, color, size, type) => {
    try {
      const item = cart.products.find(
        (p) =>
          p.productId.toString() === productId.toString() &&
          p.color === color &&
          p.size === size
      );
      if (!item) return;
      let newQty = item.quantity;
      // minus
      if (type === 'minus') {
        // if (newQty <= 1) {
        //   toast.warning('số lượng không thể nhỏ hơn 1!');
        //   return;
        // }
        newQty--;
      }
      // plus
      if (type === 'plus') {
        // // 1. Lấy product mới nhất từ API để có stock chính xác
        // const productResponse = await axiosInstance.get(`/api/products/${productId}`);
        // const currentProduct = productResponse.data;

        // // 2. Tìm variant và size tương ứng
        // const variant = currentProduct.variants.find((v) => v.colorName === color);
        // const sizeVariant = variant?.sizes.find((s) => s.name === size);

        // if (!sizeVariant) {
        //   toast.error('Không tìm thấy thông tin sản phẩm!');
        //   return;
        // }
        // if (newQty >= sizeVariant.countInStock) {
        //   toast.warning(
        //     `Đã đạt đến số lượng trong kho! Chỉ còn ${sizeVariant.countInStock} sản phẩm.`
        //   );
        //   return;
        // }
        newQty++;
      }

      if (newQty !== item.quantity) {
        dispatch(updateCartItemQuantity({ productId, color, size, quantity: newQty }))
          .unwrap()
          .then((result) =>
            toast.success(result.message, {
              duration: 2000, // 3 giây
            })
          )
          .catch((error) =>
            toast.error(error || 'Lỗi cập nhật số lượng', {
              duration: 2000, // 3 giây
            })
          );
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sản phẩm:', error);
      toast.error('Không thể kiểm tra số lượng tồn kho');
    }
  };

  // Xoá sản phẩm cart
  const handleRemove = (productId, color, size) => {
    toast(
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <RiDeleteBin3Line className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Xóa sản phẩm?</h3>
          <p className="text-gray-600 mt-2">
            Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 px-6 py-3 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              dispatch(removeFromCart({ productId, color, size }))
                .unwrap()
                .then((result) => toast.success(result.message || 'Xoá thành công'))
                .catch((error) => toast.error(error.message || 'Lỗi khi xóa sản phẩm'));
            }}
            className="flex-1 px-6 py-3 font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
          >
            Xóa ngay
          </button>
        </div>
      </div>,
      {
        duration: 10000,

        style: {
          // top: '50%',
          // left: '50%',
          // transform: 'translate(-50%, -50%)',
          margin: 0,
          padding: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          maxWidth: '90vw',
        },
        // QUAN TRỌNG NHẤT: TẮT ANIMATION MẶC ĐỊNH CỦA SONNER
        className: 'sonner-center-fix', // thêm class tùy chỉnh
      }
    );
  };

  // if (loading) return <p className="text-center py-10">Đang tải giỏ hàng...</p>;
  if (error) return <p className="text-red-500 text-center">Lỗi: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p className="text-center py-10 text-gray-500">Giỏ hàng trống</p>;
  }

  return (
    <div className="max-h-[450px]">
      {cart.products.map((product, index) => (
        <div className="flex items-start justify-between py-4 border-b" key={index}>
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-24 object-cover mr-4 rounded"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between h-23">
            <h3>{product.name}</h3>
            <p className="text-sm text-gray-500">
              {product.size} | {product.color}
            </p>
            <div className="flex items-center">
              {/* <button
                className="border rounded h-6 w-6 leading-[22px] text-xl font-medium
              cursor-pointer hover:border-primary-400 hover:text-primary-400"
              >
                -
              </button>
              <span className="mx-4">{product.quantity}</span>
              <button
                className="border rounded h-6 w-6 leading-[22px] text-xl font-medium
              cursor-pointer hover:border-primary-400 hover:text-primary-400"
              >
                +
              </button> */}
              <QuantitySelector
                className="mb-0"
                size="small"
                textShow={false}
                handleQuantityChange={(type) =>
                  handleQuantityChange(
                    product.productId.toString(),
                    product.color,
                    product.size,
                    type
                  )
                }
                quantity={product.quantity}
              />
            </div>
          </div>

          {/* nút xoá và giá */}
          <div className="flex flex-col items-end justify-between h-23">
            <p>{product.price.toLocaleString('vi-VN')} vnđ</p>
            <button
              className="cursor-pointer"
              onClick={() =>
                handleRemove(product.productId.toString(), product.color, product.size)
              }
            >
              <RiDeleteBin3Line className="h-6 w-6 mt-2 text-end hover:text-primary-300" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
