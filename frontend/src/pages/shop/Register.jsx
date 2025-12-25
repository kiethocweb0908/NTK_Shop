import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import register from '@/assets/register.webp';
import { Button } from '@/components/ui/button';
import { requestRegisterOTPThunk } from '@/redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import AddressForm from '@/components/Common/AddressForm';
import { AlertCircle, Lock, LockOpen, Mail, Phone, User2 } from 'lucide-react';
import { validatePassword, validatePhone } from '@/lib/utils';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [info, setInfo] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  const handleInfoChange = (field, value) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    setError((prev) => ({ ...prev, [field]: '' }));
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
      case 'email':
        if (!info.email.trim()) {
          error = 'Bạn cần phải nhập email';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(info.email)) {
            error = 'Email không đúng định dạng';
          }
        }
        break;
      case 'password':
        if (!info.password.trim()) {
          error = 'Bạn cần phải nhập mật khẩu';
        } else if (!validatePassword(info.password)) {
          error =
            'Mật khẩu phải có ít nhất 1 chữ in hoa, 1 số, 1 ký tự đặc biệt và dài 8-50 ký tự';
        }

        break;
      case 'confirmPassword':
        if (info.password !== info.confirmPassword)
          error = 'Mật khẩu xác nhận không trùng khớp';
        break;
      default:
        break;
    }
    setError((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleOnBlur = (field) => {
    validateInfo(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisable(true);
    const allFields = ['name', 'phone', 'email', 'password', 'confirmPassword'];
    let isValid = true;
    allFields.forEach((field) => {
      if (!validateInfo(field)) isValid = false;
    });
    if (!isValid) {
      setIsButtonDisable(false);
      return toast.error('Thông tin không hợp lệ', { duration: 3000 });
    }

    try {
      const response = await dispatch(
        requestRegisterOTPThunk({
          name: info.name,
          phone: info.phone,
          email: info.email,
          password: info.password,
        })
      ).unwrap();

      toast.success(response);
      setIsButtonDisable(false);
      navigate('/otp', {
        state: { email: info.email },
      });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        error ||
        'Request OTP thất bại';
      toast.error(msg);
      setIsButtonDisable(false);
    }

    // dispatch(registerUser({ name, email, password, confirmPassword }));
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
      <div className="flex flex-col justify-center items-center py-11">
        <div
          className="w-full max-w-lg grid grid-cols-2 
        text-center bg-white/5 
        text-black text-shadow-sm
        border-t-[0.75px] border-x-[0.75px] border-white/35
        rounded-t-xl
        overflow-hidden z-10
        transition-all duration-300 ease-initial"
        >
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive
                ? 'bg-white/15 backdrop-blur-md p-4 rounded-t-xl rounded-br-xl border-[0.75px] border-white/50 font-semibold'
                : 'bg-bg-white/5 backdrop-blur-md text-center p-4 font-semibold'
            }
          >
            Đăng nhập
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive
                ? 'bg-white/15 backdrop-blur-md p-4 rounded-t-xl rounded-bl-xl border-[0.75px] border-white/50 font-semibold'
                : 'bg-bg-white/5 backdrop-blur-md text-center p-4 font-semibold'
            }
          >
            Đăng ký
          </NavLink>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg p-8
            rounded-b-xl border-x-[0.5px] border-b-[0.5px] border-white/50
            bg-white/5 backdrop-blur-md shadow-2xl
            "
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-shadow-md uppercase ">
            Đăng ký
          </h2>
          <p className="text-center mb-6 text-shadow-sm">
            Hãy nhập thông tin vào bên dưới để tiến hành đăng ký
          </p>
          {/* Họ và tên */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-shadow-sm">
              Họ và tên
            </label>
            <div className="relative">
              <Input
                type="name"
                autoComplete="name"
                value={info.name}
                onChange={(e) => handleInfoChange('name', e.target.value)}
                onBlur={() => handleOnBlur('name')}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
                placeholder="Nhập họ tên của bạn"
              />
              <User2 className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
            </div>
            {error.name && (
              <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error.name}
              </span>
            )}
          </div>

          {/* SĐT */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-shadow-sm">
              Số điện thoại
            </label>
            <div className="relative">
              <Input
                type="phone"
                autoComplete="phone"
                value={info.phone}
                onChange={(e) => handleInfoChange('phone', e.target.value)}
                onBlur={() => handleOnBlur('phone')}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
                placeholder="Nhập số điện thoại của bạn"
              />
              <Phone className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
            </div>
            {error.phone && (
              <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error.phone}
              </span>
            )}
          </div>

          {/* email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-shadow-sm">
              Email
            </label>
            <div className="relative">
              <Input
                type="email"
                autoComplete="email"
                value={info.email}
                onChange={(e) => handleInfoChange('email', e.target.value)}
                onBlur={() => handleOnBlur('email')}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
                placeholder="Nhập email của bạn"
              />
              <Mail className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
            </div>
            {error.email && (
              <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error.email}
              </span>
            )}
          </div>
          {/* password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-shadow-sm">
              Mật khẩu
            </label>
            <div className="relative">
              <Input
                type={!isChecked ? 'password' : 'text'}
                autoComplete="password"
                value={info.password}
                onChange={(e) => handleInfoChange('password', e.target.value)}
                onBlur={() => handleOnBlur('password')}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
                placeholder="Nhập mật khẩu của bạn"
              />
              {!isChecked ? (
                <Lock className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
              ) : (
                <LockOpen className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
              )}
            </div>
            {error.password && (
              <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error.password}
              </span>
            )}
          </div>

          {/* Nhập lại password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-shadow-sm">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Input
                type={!isChecked ? 'password' : 'text'}
                autoComplete="confirmPassword"
                value={info.confirmPassword}
                onChange={(e) => handleInfoChange('confirmPassword', e.target.value)}
                onBlur={() => handleOnBlur('confirmPassword')}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
                placeholder="Nhập lại mật khẩu của bạn"
              />
              {!isChecked ? (
                <Lock className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
              ) : (
                <LockOpen className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
              )}
            </div>
            {error.confirmPassword && (
              <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error.confirmPassword}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => setIsChecked((prev) => !prev)}
              className="border border-black/10! focus:ring-0! focus:border-black/30! ring-0!"
            />
            <label className="text-sm text-shadow-sm select-none">Hiện mật khẩu</label>
          </div>

          {/* Địa chỉ */}
          {/* <AddressForm /> */}
          <Button
            disabled={isButtonDisabled}
            variant="primary"
            size="full"
            type="submit"
            className="mt-8"
          >
            {isButtonDisabled ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
          <p className="mt-6 text-center text-sm">
            <Link to="/register" className="text-blue-500 text-shadow-sm">
              Quên mật khẩu?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
