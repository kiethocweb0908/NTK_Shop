import AddressForm from '@/components/Common/AddressForm';
import { Input } from '@/components/ui/input';
import { Mail, Phone, User2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const MyInfo = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const [addressError, setAddressError] = useState({});
  const [info, setInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [currentAddress, setCurrentAddress] = useState({
    fullAddress: user ? user?.address?.fullAddress : '',
    province: user ? user?.address?.city : '',
    district: user ? user?.address?.district : '',
    ward: user ? user?.address?.ward : '',
  });
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (user) {
      setInfo({
        name: user.name ? user.name : '',
        email: user.email ? user.email : '',
        phone: user.phone ? user.phone : '',
      });

      setCurrentAddress({
        fullAddress: user ? user?.address?.fullAddress : '',
        province: user ? user?.address?.city : '',
        district: user ? user?.address?.district : '',
        ward: user ? user?.address?.ward : '',
      });
    }
  }, [user]);

  const handleNewAddressChange = () => {};
  const validateAddress = () => {};

  if (loading) {
    <div>Đang tải thông tin...</div>;
  }

  return (
    <>
      <h2 className="text-xl md:text-lg font-bold mb-4 uppercase text-center">
        Thông tin tài khoản
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-shadow-sm">Họ tên</label>
        <div className="relative">
          <Input
            disabled={isDisabled}
            type="text"
            autoComplete="name"
            value={info.name}
            // onChange={(e) => handleInfoChange('email', e.target.value)}
            // onBlur={() => handleOnBlur('email')}
            className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
            placeholder="Nhập email của bạn"
          />
          <User2 className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-shadow-sm">Email</label>
        <div className="relative">
          <Input
            disabled={isDisabled}
            type="email"
            autoComplete="email"
            value={info.email}
            // onChange={(e) => handleInfoChange('email', e.target.value)}
            // onBlur={() => handleOnBlur('email')}
            className="w-full py-5 pl-10 pr-5 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
            placeholder="Nhập email của bạn"
          />
          <Mail className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
        </div>
      </div>

      {/* phone */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-shadow-sm">
          Số điện thoại
        </label>
        <div className="relative">
          <Input
            disabled={isDisabled}
            type="phone"
            value={info.phone}
            autoComplete="phone"
            // onChange={(e) => handleInfoChange('password', e.target.value)}
            // onBlur={() => handleOnBlur('password')}
            className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70   text-sm"
            placeholder="Nhập mật khẩu của bạn"
          />
          <Phone className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
        </div>
      </div>

      {Object.values(currentAddress).every((field) => field && field.trim() !== '') ||
      !isDisabled ? (
        <AddressForm
          onAddressChange={handleNewAddressChange}
          initialAddress={currentAddress}
          validate={validateAddress}
          error={addressError}
          setError={setAddressError}
          className="grid! grid-cols-1!"
          disabled={isDisabled}
        />
      ) : (
        <p className="pt-2 pb-6 text-center text-shadow-sm opacity-80">
          "Bạn chưa thêm địa chỉ vào tài khoản này!"
        </p>
      )}
    </>
  );
};

export default MyInfo;
