import { useEffect, useRef, useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrderThunk } from '@/redux/slices/orderSlice';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const PayPalButton = ({ mode = 'checkout', checkoutData, order }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderIdRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [{ isPending, isRejected, isResolved }, paypalDispatch] =
    usePayPalScriptReducer();

  useEffect(() => {
    paypalDispatch({
      type: 'resetOptions',
      value: {
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      },
    });

    paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
  }, []);

  const createOrder = async () => {
    try {
      setLoading(true);

      let orderId = '';

      if (mode === 'checkout') {
        // tạo order trong db
        const response = await dispatch(
          placeOrderThunk({
            ...checkoutData,
            paymentMethod: 'paypal',
          })
        ).unwrap();
        orderId = response.createdOrder._id;
      }

      if (mode === 'existing') {
        orderId = order._id;
      }

      if (orderId) {
        orderIdRef.current = orderId;

        // tạo PayPal order
        const paypalResponse = await axiosInstance.post('/api/payments/paypal/create', {
          orderId,
        });

        const paypalOrderId = paypalResponse.data.paypalOrderId;
        return paypalOrderId;
      }
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
        orderId: orderIdRef.current,
      });

      toast.success('Thanh toán thành công!');
    } catch (error) {
      console.error('Lỗi khi thanh toán paypal: ', error);
      toast.error('Thanh toán thaats bại');
    } finally {
      setLoading(false);
      if (mode === 'checkout') {
        navigate('/order-confirmation');
      }
    }
  };

  const onCancel = () => {
    toast.info('Bạn đã huỷ thanh toán PayPal');
    if (mode === 'checkout') {
      navigate('/order-confirmation');
    }
  };

  const onError = (error) => {
    console.error('Paypal SDK error: ', error);
    toast.error('Paypal gặp lỗi');
  };

  // Chỉ render khi SDK đã sẵn sàng
  if (!isResolved) {
    return (
      <div className="flex justify-center p-4">
        <p className="text-sm text-gray-500">Đang tải PayPal...</p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex justify-center p-4">
        <p className="text-red-500">Không thể tải PayPal. Vui lòng thử lại sau.</p>
      </div>
    );
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
