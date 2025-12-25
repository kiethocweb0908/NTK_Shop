import { useEffect, useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrderThunk } from '@/redux/slices/orderSlice';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const PayPalButton = ({ checkoutData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(null);
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  const createOrder = async () => {
    try {
      setLoading(true);

      // tạo order trong db
      const response = await dispatch(
        placeOrderThunk({
          ...checkoutData,
          paymentMethod: 'paypal',
        })
      ).unwrap();

      let paypalOrderId;
      if (response) {
        const createdOrderId = response.createdOrder._id;
        setOrderId(createdOrderId);

        // tạo PayPal order
        const paypalResponse = await axiosInstance.post('/api/payments/paypal/create', {
          orderId: createdOrderId,
        });

        paypalOrderId = paypalResponse.data.paypalOrderId;
      }
      return paypalOrderId;
    } catch (error) {
      console.error('Lỗi khi tạo Paypal order: ', error);
      toast.error(error?.message || 'Không thể khởi tạo thanh toán Paypal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data) => {
    try {
      setLoading(true);

      await axiosInstance.post('/api/payments/paypal/capture', {
        paypalOrderId: data.orderID,
        orderId,
      });

      toast.success('Thanh toán thành công!');
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Lỗi khi thanh toán paypal: ', error);
      toast.error('Thanh toán thaats bại');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    toast.info('Bạn đã huỷ thanh toán PayPal');
  };

  const onError = (error) => {
    console.error('Paypal SDK error: ', error);
    toast.error('Paypal gặp lỗi');
  };

  // Đợi PayPal SDK
  if (isPending) {
    return <p className="text-sm text-gray-500">Đang tải PayPal...</p>;
  }

  if (isRejected) {
    return <p className="text-red-500">Không thể tải PayPal</p>;
  }

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onCancel={onCancel}
      onError={onError}
      disabled={loading}
    />
  );
};

export default PayPalButton;
