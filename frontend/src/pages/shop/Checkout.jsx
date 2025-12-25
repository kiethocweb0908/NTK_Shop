import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AddressForm from '@/components/Common/AddressForm';

// Shadcn
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// Format
import { formatCurrency, toWebp, validatePhone } from '@/lib/utils';
// Icons
import {
  ArrowBigLeft,
  Building2,
  Landmark,
  Mail,
  MapPin,
  Phone,
  User2,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { placeOrderThunk } from '@/redux/slices/orderSlice';
import PayPalButton from '@/components/payment/PayPalButton';
import PayPalButtonWrapper from '@/components/payment/PayPalButtonWrapper';

const Checkout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart, loading, error } = useSelector((state) => state.cart);
  // const product = cart.products;
  const navigate = useNavigate();

  const [checkoutId, setCheckoutId] = useState(null);
  const [activeTab, setActiveTab] = useState(user ? 'address' : 'addressOther');
  // State cho thông tin liên hệ
  const [contactInfo, setContactInfo] = useState({
    name: user ? user.name : '',
    phone: user ? user?.phone : '',
    email: user ? user?.email : '',
  });
  // State cho địa chỉ
  const [currentAddress, setCurrentAddress] = useState({
    fullAddress: user ? user?.address?.fullAddress : '',
    province: user ? user?.address?.city : '',
    district: user ? user?.address?.district : '',
    ward: user ? user?.address?.ward : '',
  });
  // địa chỉ khác
  const [newAddress, setNewAddress] = useState({});
  // phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('cod');
  // const ship price
  const [shippingPrice, setShippingPrice] = useState(30000);
  const [note, setNote] = useState('');
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  // error validate
  const [infoError, setInfoError] = useState({});
  const [addressError, setAddressError] = useState({});

  useEffect(() => {
    if (!cart) {
      return navigate(-1);
    }
  }, []);

  // lấy phí ship khi đổi phương thức
  useEffect(() => {
    setShippingPrice((prev) => {
      return paymentMethod !== 'cod' || cart?.totalPrice >= 1000000 ? 0 : 30000;
    });
  }, [paymentMethod, cart]);

  // lấy info khi có user
  useEffect(() => {
    if (user) {
      setContactInfo({
        name: user ? user.name : '',
        phone: user ? user?.phone : '',
        email: user ? user?.email : '',
      });
    }

    setCurrentAddress({
      fullAddress: user ? user?.address?.fullAddress : '',
      province: user ? user?.address?.city : '',
      district: user ? user?.address?.district : '',
      ward: user ? user?.address?.ward : '',
    });
  }, [user]);

  // reset lỗi khi đổi tab address
  useEffect(() => {
    setAddressError({});
  }, [activeTab]);

  // handle info change
  const handleContactInfoChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    setInfoError((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  // validate info
  const validateInfo = (field) => {
    let error;
    switch (field) {
      case 'name':
        if (!contactInfo.name.trim()) error = 'Bạn phải nhập họ tên và';
        break;
      case 'phone':
        if (!contactInfo?.phone.toString().trim()) error = 'Bạn cần nhập số điện thoại';
        else if (!validatePhone(contactInfo.phone.toString()))
          error = 'Số điện thoại không đúng định dạng (phải bắt đầu bằng 0 và có 10 số)';
        break;
      case 'email':
        if (!contactInfo.email.trim()) {
          error = 'Bạn phải nhập email';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(contactInfo.email)) {
            error = 'Email không đúng định dạng';
          }
        }
        break;

      default:
        break;
    }
    setInfoError((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateAddress = (field) => {
    let error;
    switch (field) {
      case 'fullAddress':
        if (newAddress.fullAddress.trim() === '') error = 'Bạn phải nhập địa chỉ đầy đủ';
        break;
      case 'province':
        if (newAddress.province === '') error = 'Bạn phải chọn tỉnh/ thành phố';
        break;
      case 'district':
        if (newAddress.district.trim() === '') error = 'Bạn phải chọn quận/huyện';
        break;
      case 'ward':
        if (newAddress.ward.trim() === '') error = 'Bạn phải chọn phường/xã';
      default:
        break;
    }
    setAddressError((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  const handleOnBlur = (field) => {
    validateInfo(field);
  };

  const validateCheckout = () => {
    // const selectedAddress = activeTab === 'address' ? currentAddress : newAddress;

    // Validate thông tin liên hệ
    const infoFields = ['name', 'phone', 'email'];
    let isValid = true;

    infoFields.forEach((field) => {
      if (!validateInfo(field)) isValid = false;
    });

    // Validate địa chỉ
    if (activeTab === 'addressOther') {
      const addressFields = ['fullAddress', 'province', 'district', 'ward'];
      addressFields.forEach((field) => {
        if (!validateAddress(field)) isValid = false;
      });
    }

    if (!isValid) {
      toast.error('Thông tin không hợp lệ', { duration: 3000 });
      return false;
    }

    if (
      activeTab === 'address' &&
      !Object.values(currentAddress).every((field) => field && field.trim() !== '')
    ) {
      toast.error('Bạn chưa nhập địa chỉ giao hàng', { duration: 3000 });
      return false;
    }

    return true;
  };

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    setIsButtonDisable(true);

    if (!validateCheckout()) {
      setIsButtonDisable(false);
      return;
    }
    const selectedAddress = activeTab === 'address' ? currentAddress : newAddress;

    // Dữ liệu gửi đi
    const checkoutData = {
      ...contactInfo,
      shippingAddress: selectedAddress,
      paymentMethod,
      shippingPrice,
      totalPrice: cart.totalPrice,
      total: cart.totalPrice + shippingPrice,
      totalItems: cart.totalItems,
      cart: cart.products,
      note,
    };

    try {
      const response = await dispatch(placeOrderThunk(checkoutData)).unwrap();
      toast.success(response.message || 'Tạo đơn thành công!', { duration: 3000 });
      setTimeout(() => {
        setIsButtonDisable(false);
        navigate('/order-confirmation');
      }, 500);
    } catch (error) {
      setIsButtonDisable(false);
      toast.error(error);
      console.error(error);
    }

    console.log('Checkout Data:', checkoutData);
  };

  const handlePaymentSuccess = (details) => {
    console.log('Payment successful', details);
    navigate('/order-confirmation');
  };

  const handleNewAddressChange = (address) => {
    setNewAddress(address);
  };

  return (
    <div className="w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)',
        }}
      />
      {/* Your Content/Components */}
      <div className="flex flex-col md:flex-row md:items-center relative max-w-7xl mx-auto py-10 px-6 tracking-tighter">
        <Button
          onClick={() => navigate(-1)}
          className=" md:absolute mb-4 md:mb-0
            bg-white/5  backdrop-blur-md border-[0.5px] border-white/50 px-5! text-sm text-shadow-sm
          hover:bg-white/10 hover:px-6!
          transition-all duration-300 ease-out"
        >
          <ArrowBigLeft />
          Quay lại trang trước
        </Button>
        <h2 className="mt-6 lg:mt-0 w-full text-center text-3xl uppercase font-semibold text-shadow-md">
          Thanh Toán
        </h2>
      </div>
      <div className="relative z-10 flex flex-col-reverse lg:flex-row gap-6 max-w-7xl mx-auto pb-10 px-6 tracking-tighter">
        {/* left section */}
        <div
          className="p-8 bg-white/10 backdrop-blur-md rounded-xl 
        border border-white/50 shadow-xl lg:min-h-[764px] 
        w-full lg:w-1/2 xl:w-3/5"
        >
          <form
            onSubmit={handleCreateCheckout}
            className="flex flex-col h-full justify-between"
          >
            <div>
              <h3 className="text-lg mb-4 font-semibold uppercase text-shadow-sm">
                Thông tin liên hệ
              </h3>
              {/* name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-shadow-sm mb-2">
                  Họ và tên *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={contactInfo.name}
                    onBlur={() => handleOnBlur('name')}
                    onChange={(e) => handleContactInfoChange('name', e.target.value)}
                    className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm"
                    placeholder="Nhập họ tên của bạn..."
                  />
                  <User2 className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                </div>
                {infoError.name && (
                  <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {infoError.name}
                  </span>
                )}
              </div>

              {/* email & phone */}
              <div className="mb-4 md:grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-shadow-sm mb-2">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={contactInfo.phone}
                      onBlur={() => handleOnBlur('phone')}
                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm"
                      placeholder="Nhập số điện thoại của bạn..."
                    />
                    <Phone className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                  </div>
                  {infoError.phone && (
                    <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {infoError.phone}
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-shadow-sm mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={contactInfo.email}
                      onBlur={() => handleOnBlur('email')}
                      onChange={(e) => handleContactInfoChange('email', e.target.value)}
                      className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm
                  disabled:opacity-100"
                      disabled={user ? true : false}
                      placeholder="Nhập email của bạn..."
                    />
                    <Mail className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                  </div>
                  {infoError.email && (
                    <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {infoError.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Địa chỉ */}
              <h3 className="text-lg mb-4 font-semibold uppercase text-shadow-sm">
                Thông tin địa chỉ
              </h3>
              <div className="mb-4">
                <Tabs
                  defaultValue={user ? 'address' : 'addressOther'}
                  // value={activeTab}
                  onValueChange={setActiveTab}
                >
                  {user && (
                    <>
                      <TabsList>
                        <TabsTrigger
                          className={
                            'mb-4 px-4 py-5! bg-black/3 backdrop-blur-xl border border-white duration-300 ease-linear'
                          }
                          value="address"
                        >
                          Địa chỉ hiện tại của bạn
                        </TabsTrigger>

                        <TabsTrigger
                          className={
                            'mb-4  px-4 py-5! bg-black/3 backdrop-blur-xl border border-white duration-300 ease-linear'
                          }
                          value="addressOther"
                        >
                          Địa chỉ khác
                        </TabsTrigger>
                      </TabsList>
                    </>
                  )}
                  {user && (
                    <TabsContent value="address">
                      {Object.values(currentAddress).every(
                        (field) => field && field.trim() !== ''
                      ) ? (
                        <>
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-shadow-sm mb-2">
                              Địa chỉ đầy đủ: *
                            </label>
                            <div className="relative">
                              <Input
                                type="text"
                                value={currentAddress.fullAddress}
                                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm
                  disabled:opacity-100"
                                disabled
                              />
                              <MapPin className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                            </div>
                          </div>
                          <div className="md:grid grid-cols-3 gap-4">
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-shadow-sm mb-2">
                                Tỉnh/Thành phố: *
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={currentAddress.province}
                                  className="w-full py-5 pl-10 pr-1 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm
                  disabled:opacity-100"
                                  disabled
                                />
                                <Building2 className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-shadow-sm mb-2">
                                Quận/Huyện: *
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={currentAddress.district}
                                  className="w-full py-5 pl-10 pr-1  border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm
                  disabled:opacity-100"
                                  disabled
                                />
                                <Landmark className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-shadow-sm mb-2">
                                Phường/Xã: *
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={currentAddress.ward}
                                  className="w-full py-5 pl-10 pr-1 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm
                  disabled:opacity-100"
                                  disabled
                                />
                                <Home className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="min-h-[100px] lg:min-h-[171.2px]  flex items-center justify-center text-center text-shadow-sm">
                          Bạn chưa thêm địa chỉ vào tài khoản! Hãy nhập địa chỉ bên mục
                          "Địa chỉ khác"
                        </p>
                      )}
                    </TabsContent>
                  )}
                  <TabsContent value="addressOther">
                    <AddressForm
                      onAddressChange={handleNewAddressChange}
                      initialAddress={{}}
                      validate={validateAddress}
                      error={addressError}
                      setError={setAddressError}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* phương thức thanh toán  */}
              <h3 className="text-lg mb-4 font-semibold uppercase text-shadow-sm">
                Phương thức thanh toán
              </h3>
              <div className="mb-4">
                <RadioGroup
                  name="payment"
                  defaultValue={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">Thanh toán với Paypal</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Button thanh toán */}
            <div className="mt-8 lg:mt-0">
              {paymentMethod === 'cod' && (
                <Button disabled={isButtonDisabled} variant="primary" size="full">
                  {isButtonDisabled ? 'Đang xử lý...' : 'Thanh toán COD'}
                </Button>
              )}
              {paymentMethod === 'paypal' && (
                // <PayPalButton
                //   checkoutData={{
                //     ...contactInfo,
                //     shippingAddress:
                //       activeTab === 'address' ? currentAddress : newAddress,
                //     shippingPrice,
                //     totalPrice: cart.totalPrice,
                //     total: cart.totalPrice + shippingPrice,
                //     totalItems: cart.totalItems,
                //     cart: cart.products,
                //     note,
                //   }}
                // />

                <PayPalButtonWrapper
                  checkoutData={{
                    ...contactInfo,
                    shippingAddress:
                      activeTab === 'address' ? currentAddress : newAddress,
                    shippingPrice,
                    totalPrice: cart.totalPrice,
                    total: cart.totalPrice + shippingPrice,
                    totalItems: cart.totalItems,
                    cart: cart.products,
                    note,
                  }}
                  validateCheckout={validateCheckout}
                />
              )}
            </div>
          </form>
        </div>
        {/* Right section */}
        <div
          className="col-span-1 p-8 bg-green-700/3 backdrop-blur-md rounded-xl 
        border border-white/50 shadow-2xl lg:min-h-[764px] 
        w-full lg:w-1/2 xl:w-2/5"
        >
          <h3 className="text-lg mb-4 font-semibold uppercase text-shadow-sm">
            Tóm tắt đơn hàng
          </h3>
          <div
            className="py-4 mb-4 lg:min-h-108 max-h-108 rounded-lg overflow-y-auto border-y border-t-white/30 border-b-black/10
            [scrollbar-gutter:stable] pr-2
            scrollbar-thin 
            scrollbar-thumb-gray-400/50
            scrollbar-track-white/20 
            scrollbar-thumb-rounded-full 
            scrollbar-track-rounded-full"
          >
            {cart?.products.map((product, index) => (
              <div
                key={index}
                className="flex  justify-between py-3 border-b last:border-b-0 border-black/10"
              >
                <div className="flex items-start gap-2">
                  <img
                    src={toWebp(product.image)}
                    alt={product.name}
                    className="w-18 h-22 object-cover mr-4 rounded-lg"
                  />
                  <div className="flex flex-col justify-between h-22">
                    <h3
                      className="text-md truncate text-shadow-sm
                      max-w-26 sm:max-w-75 md:max-w-110 lg:max-w-55 xl:max-w-50"
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-shadow-sm">Màu: {product.color}</p>
                    <p className="text-sm text-shadow-sm">Size: {product.size}</p>
                  </div>
                </div>
                <div className="min-h-full flex flex-col justify-between items-end">
                  <p className="text-lg text-shadow-sm">
                    {formatCurrency(Number(product.price))}
                  </p>
                  <p className="text-sm text-shadow-sm">Số lượng: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú cho đơn hàng..."
            className="overflow-y-auto max-h-16 mb-4 w-full p-3 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm"
          />
          <div className="flex justify-between items-center mb-4">
            <p className="text-shadow-sm">Tổng tiền sản phẩm</p>
            <p className="font-semibold text-shadow-sm">
              {formatCurrency(cart?.totalPrice)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-shadow-sm">Phí vận chuyển</p>
            <p className="text-shadow-sm">
              {shippingPrice > 0 ? formatCurrency(shippingPrice) : 'Miễn phí vận chuyển'}
            </p>
          </div>
          <div
            className="flex justify-between items-center mt-4 border-t border-black/15 pt-4
          text-lg text-shadow-sm uppercase font-semibold"
          >
            <p>Thành tiền</p>
            <p className="text-primary-400">
              {formatCurrency(cart?.totalPrice + shippingPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
