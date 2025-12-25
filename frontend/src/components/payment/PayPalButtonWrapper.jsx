// PayPalButtonWrapper.jsx
import { useState } from 'react';
import PayPalButton from './PayPalButton';
import { Button } from '../ui/button';

const PayPalButtonWrapper = ({ checkoutData, validateCheckout, onValidationError }) => {
  const [showPayPal, setShowPayPal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

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
  };

  return (
    <div className="paypal-wrapper">
      {!showPayPal ? (
        <Button
          variant="primary"
          size="full"
          onClick={handleClick}
          disabled={isValidating}
        >
          {isValidating ? 'Đang kiểm tra...' : 'Thanh toán với PayPal'}
        </Button>
      ) : (
        <div className="paypal-button-container">
          <PayPalButton checkoutData={checkoutData} />
          {/* <button
            onClick={() => setShowPayPal(false)}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Quay lại
          </button> */}
        </div>
      )}
    </div>
  );
};

export default PayPalButtonWrapper;
