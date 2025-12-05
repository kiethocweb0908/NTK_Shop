import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '@/components/Cart/PayPalButton';
import { useSelector } from 'react-redux';
import AddressForm from '@/components/Common/AddressForm';

// Shadcn
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { formatCurrency } from '@/lib/utils';

const cart = {
  products: [
    {
      name: 'Jacket',
      size: 'L',
      color: 'Black',
      price: '350000',
      image: 'https://picsum.photos/200?random=1',
    },
    {
      name: 'T-shirt',
      size: 'L',
      color: 'Black',
      price: '350000',
      image: 'https://picsum.photos/200?random=2',
    },
  ],
  totalPrice: 700000,
};

const Checkout = () => {
  const { user } = useSelector((state) => state.auth);
  const { cart, loading, error } = useSelector((state) => state.cart);
  const product = cart.products;
  const navigate = useNavigate();

  const [checkoutId, setCheckoutId] = useState(null);
  const [activeTab, setActiveTab] = useState(user ? 'addres' : 'addressOther');
  // State cho thông tin liên hệ
  const [contactInfo, setContactInfo] = useState({
    fullName: user ? user.name : '',
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

  const [newAddress, setNewAddress] = useState({});

  const handleCreateCheckout = (e) => {
    e.preventDefault();

    // Lấy địa chỉ dựa trên tab đang active
    const selectedAddress = activeTab === 'address' ? currentAddress : newAddress;

    // Dữ liệu gửi đi
    const checkoutData = {
      contactInfo,
      shippingAddress: selectedAddress,
      cart: cart.products,
      total: cart.totalPrice,
    };

    console.log('Checkout Data:', checkoutData);
  };

  const handlePaymentSuccess = (details) => {
    console.log('Payment successful', details);
    navigate('/oder-comfirmation');
  };

  const handleContactInfoChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewAddressChange = (address) => {
    setNewAddress(address);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* left section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6 font-semibold">Thanh Toán</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4 font-semibold">Thông tin liên hệ</h3>
          {/* name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              value={contactInfo.fullName}
              onChange={(e) => handleContactInfoChange('fullName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* email & phone */}
          <div className="mb-4 md:grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleContactInfoChange('fullName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={user ? true : false}
              />
            </div>
          </div>
          {/* Địa chỉ */}
          <h3 className="text-lg mb-4 font-semibold">Thông tin địa chỉ *</h3>
          <div className="mb-4">
            <Tabs
              defaultValue={user ? 'address' : 'addressOther'}
              // value={activeTab}
              onValueChange={setActiveTab}
            >
              {user && (
                <>
                  <TabsList>
                    <TabsTrigger className={'mb-4 p-4'} value="address">
                      Địa chỉ hiện tại của bạn
                    </TabsTrigger>

                    <TabsTrigger className={'mb-4 p-4'} value="addressOther">
                      Địa chỉ khác
                    </TabsTrigger>
                  </TabsList>
                </>
              )}
              {user && (
                <TabsContent value="address">
                  {user?.address ? (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ đầy đủ: *
                        </label>
                        <input
                          type="text"
                          value={currentAddress.fullAddress}
                          className="w-full p-2 border border-gray-300 rounded"
                          disabled
                        />
                      </div>
                      <div className="md:grid grid-cols-3 gap-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tỉnh/Thành phố: *
                          </label>
                          <input
                            type="text"
                            value={currentAddress.province}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quận/Huyện: *
                          </label>
                          <input
                            type="text"
                            value={currentAddress.district}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phường/Xã: *
                          </label>
                          <input
                            type="text"
                            value={currentAddress.ward}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>
                      Bạn chưa thêm địa chỉ vào tài khoản! Hãy nhập địa chỉ bên mục "Địa
                      chỉ khác"
                    </p>
                  )}
                </TabsContent>
              )}
              <TabsContent value="addressOther">
                <AddressForm
                  onAddressChange={handleNewAddressChange}
                  initialAddress={{}}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6">
            {!checkoutId ? (
              // <button type="submit" className="w-full bg-black text-white py-3 rounded">
              //   Tiếp tục thanh toán
              // </button>
              <Button variant="primary" size="full">
                Tiếp tục thanh toán
              </Button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Thanh toán với Paypal</h3>
                {/* Paypal component*/}
                <PayPalButton
                  amount={100}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => alert('Payment faled. Try again')}
                />
              </div>
            )}
          </div>
        </form>
      </div>
      {/* Right section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Sumary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div key={index} className="flex items-start justify-between py-2 border-b">
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4 rounded-lg"
                />
                <div>
                  <h3 className="text-md">{product.name}</h3>
                  <p className="text-gray-500 ">Size: {product.size}</p>
                  <p className="text-gray-500 ">Color: {product.color}</p>
                </div>
              </div>
              <p className="text-lg">{formatCurrency(Number(product.price))}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Tổng sản phẩm</p>
          <p className="font-semibold">{formatCurrency(cart.totalPrice)}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p>Phí vận chuyển</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Thành tiền</p>
          <p>{formatCurrency(cart.totalPrice)}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
