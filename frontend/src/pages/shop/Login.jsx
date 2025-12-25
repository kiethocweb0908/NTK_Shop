import { Button } from '@/components/ui/button';
import React, { use, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import login from '@/assets/login.webp';
import { loginUser } from '@/redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import Result_ from 'postcss/lib/result';
import { toast } from 'sonner';
import { fetchCart } from '@/redux/slices/cartSlice';
import { Input } from '@/components/ui/input';
import { AlertCircle, LockOpen } from 'lucide-react';

// shadcn
import { Checkbox } from '@/components/ui/checkbox';
// icons
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [info, setInfo] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState({});
  const [isChecked, setIsChecked] = useState(false);

  // Tự động chuyển hướng khi đã login
  useEffect(() => {
    if (user) {
      navigate(from || '/', { replace: true });
    }
  }, [user, navigate, from]);

  const handleInfoChange = (field, value) => {
    setInfo((prev) => ({ ...prev, [field]: value }));

    setError((prev) => ({ ...prev, [field]: '' }));
  };

  const validateInfo = (field) => {
    let error;
    switch (field) {
      case 'email':
        if (!info.email.trim()) {
          error = 'Bạn phải nhập email';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(info.email)) {
            error = 'Email không đúng định dạng';
          }
        }
        break;
      case 'password':
        if (!info.password.trim()) error = 'Bạn phải nhập mật khẩu';
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

    const allFields = ['email', 'password'];
    let isValid = true;
    allFields.forEach((field) => {
      if (!validateInfo(field)) {
        isValid = false;
      }
    });
    if (!isValid) return toast.error('Thông tin không hợp lệ', { duration: 3000 });

    try {
      const result = await dispatch(
        loginUser({ email: info.email, password: info.password })
      ).unwrap();
      toast.success(`Đăng nhập thành công. Chào mừng ${result.user.name}!`);
    } catch (error) {
      toast.error(error?.message || 'Đăng nhập thất bại');
    }

    // Không cần navigate ở đây vì useEffect sẽ xử lý

    // dispatch(loginUser({ email, password }));
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
          className="w-full max-w-lg p-8
            rounded-b-xl border-x-[0.5px] border-b-[0.5px] border-white/50
            bg-white/5 backdrop-blur-md shadow-2xl
            "
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-shadow-md uppercase ">
            Đăng nhập
          </h2>
          <p className="text-center mb-6 text-shadow-sm">
            Hãy nhập email và mật khẩu để đăng nhập
          </p>
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
                value={info.password}
                autoComplete="password"
                onChange={(e) => handleInfoChange('password', e.target.value)}
                onBlur={() => handleOnBlur('password')}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70   text-sm"
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

          <div className="flex gap-2 items-center">
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => setIsChecked((prev) => !prev)}
              className="border border-black/10! focus:ring-0! focus:border-black/30! ring-0!"
            />
            <label className="text-sm text-shadow-sm select-none">Hiện mật khẩu</label>
          </div>

          <Button
            variant="primary"
            size="full"
            type="submit"
            className="mt-8"
            onClick={(e) => handleSubmit(e)}
          >
            Đăng nhập
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

export default Login;
