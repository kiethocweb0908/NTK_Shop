import AddressForm from '@/components/Common/AddressForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validatePhone } from '@/lib/utils';
import { changeInfomrmationThunk } from '@/redux/slices/authSlice';
import { AlertCircle, Mail, Phone, User2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const MyInfo = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [info, setInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [currentAddress, setCurrentAddress] = useState({
    fullAddress: user?.address?.fullAddress ? user?.address?.fullAddress : '',
    province: user?.address?.city ? user?.address?.city : '',
    district: user?.address?.district ? user?.address?.district : '',
    ward: user?.address?.ward ? user?.address?.ward : '',
  });
  const [isButtonDisabled, setIsButtonDisable] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [errorInfo, setErrorInfo] = useState({});
  const [addressError, setAddressError] = useState({});

  useEffect(() => {
    if (user) {
      setInfo({
        name: user.name ? user.name : '',
        email: user.email ? user.email : '',
        phone: user.phone ? user.phone : '',
      });

      setCurrentAddress({
        fullAddress: user?.address?.fullAddress ? user?.address?.fullAddress : '',
        province: user?.address?.city ? user?.address?.city : '',
        district: user?.address?.district ? user?.address?.district : '',
        ward: user?.address?.ward ? user?.address?.ward : '',
      });
      console.log(user);
    }
  }, [user]);

  const handleInfoChange = (field, value) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    setErrorInfo((prev) => ({ ...prev, [field]: '' }));
  };

  const validateInfo = (field) => {
    let error;
    switch (field) {
      case 'name':
        if (!info.name.trim()) error = 'Bạn cần nhập họ tên';
        break;
      case 'phone':
        if (!info.phone.trim()) error = 'Bạn cần nhập số điện thoại';
        else if (!validatePhone(info.phone))
          error = 'Số điện thoại không đúng định dạng (phải bắt đầu bằng 0 và có 10 số)';
        break;
      default:
        break;
    }
    setErrorInfo((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleOnBlur = (field) => {
    validateInfo(field);
  };

  const handleNewAddressChange = (address) => {
    setCurrentAddress(address);
  };

  const validateAddress = (field) => {
    let error;
    switch (field) {
      case 'fullAddress':
        if (currentAddress?.fullAddress.trim() === '')
          error = 'Bạn phải nhập địa chỉ đầy đủ';
        break;
      case 'province':
        if (currentAddress.province === '') error = 'Bạn phải chọn tỉnh/ thành phố';
        break;
      case 'district':
        if (currentAddress.district.trim() === '') error = 'Bạn phải chọn quận/huyện';
        break;
      case 'ward':
        if (currentAddress.ward.trim() === '') error = 'Bạn phải chọn phường/xã';
        break;
      default:
        break;
    }
    setAddressError((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  const validateSubmit = () => {
    const infoFields = ['name', 'phone'];
    let isValid = true;

    infoFields.forEach((field) => {
      if (!validateInfo(field)) isValid = false;
    });

    // Validate địa chỉ

    const addressFields = ['fullAddress', 'province', 'district', 'ward'];
    addressFields.forEach((field) => {
      if (!validateAddress(field)) isValid = false;
    });

    if (!isValid) {
      toast.error('Thông tin không hợp lệ', { duration: 3000 });
      return false;
    }

    return true;
  };

  const onEdit = () => {
    setIsDisabled((prev) => !prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offEdit = () => {
    setErrorInfo({});
    setAddressError({});
    setInfo({
      name: user.name ? user.name : '',
      email: user.email ? user.email : '',
      phone: user.phone ? user.phone : '',
    });
    setCurrentAddress({
      fullAddress: user?.address?.fullAddress ? user?.address?.fullAddress : '',
      province: user?.address?.city ? user?.address?.city : '',
      district: user?.address?.district ? user?.address?.district : '',
      ward: user?.address?.ward ? user?.address?.ward : '',
    });
    setIsDisabled(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsButtonDisable(true);
    if (!validateSubmit()) {
      setIsButtonDisable(false);
      return;
    }

    const data = {
      ...info,
      address: {
        ...currentAddress,
      },
    };

    console.log(data);
    try {
      const response = await dispatch(changeInfomrmationThunk(data)).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setIsButtonDisable(false);
      setIsDisabled(true);
    }
  };

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
            onChange={(e) => handleInfoChange('name', e.target.value)}
            onBlur={() => handleOnBlur('name')}
            className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
            placeholder="Nhập email của bạn"
          />
          <User2 className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
        </div>
        {errorInfo.name && (
          <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errorInfo.name}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-shadow-sm">Email</label>
        <div className="relative">
          <Input
            disabled={true}
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
            onChange={(e) => handleInfoChange('phone', e.target.value)}
            onBlur={() => handleOnBlur('phone')}
            className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70   text-sm"
            placeholder="Nhập mật khẩu của bạn"
          />
          <Phone className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
        </div>
        {errorInfo.phone && (
          <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errorInfo.phone}
          </span>
        )}
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

      {!isDisabled ? (
        <div className="mt-6 grid gap-3 grid-cols-3">
          <Button
            variant={'outline'}
            size="full"
            onClick={() => offEdit()}
            className="col-span-1"
          >
            Huỷ
          </Button>
          <Button
            disabled={isButtonDisabled}
            onClick={() => handleSubmit()}
            variant="primary"
            size="full"
            className="col-span-2"
          >
            {isButtonDisabled ? 'Đang xử lý...' : 'Lưu thông tin'}
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="full" type="button" onClick={() => onEdit()}>
          Thay đổi thông tin
        </Button>
      )}
    </>
  );
};

export default MyInfo;
