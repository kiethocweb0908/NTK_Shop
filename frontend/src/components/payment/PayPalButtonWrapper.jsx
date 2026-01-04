// PayPalButtonWrapper.jsx
import { useEffect, useState } from 'react';
import PayPalButton from './PayPalButton';
import { Button } from '../ui/button';

const PayPalButtonWrapper = ({ checkoutData, validateCheckout, onValidationError }) => {
  const [showPayPal, setShowPayPal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setShowPayPal(false);
  }, [checkoutData.shippingAddress]);

  const handleClick = async () => {
    setIsValidating(true);

    // Gọi validate function
    if (validateCheckout && !validateCheckout()) {
      // Nếu có lỗi validation
      if (onValidationError) {
        onValidationError();
      }
      setIsValidating(false);
      return;
    }

    // Nếu validate thành công, hiển thị PayPal button
    setShowPayPal(true);
    setIsValidating(false);
    console.log(checkoutData);
  };

  return (
    <div className="paypal-wrapper">
      {!showPayPal ? (
        <Button
          type="button"
          variant="primary"
          size="full"
          onClick={handleClick}
          disabled={isValidating}
        >
          {isValidating ? 'Đang kiểm tra...' : 'Thanh toán với PayPal'}
        </Button>
      ) : (
        <div className="paypal-button-container">
          <PayPalButton mode="checkout" checkoutData={checkoutData} />
        </div>
      )}
    </div>
  );
};

export default PayPalButtonWrapper;
