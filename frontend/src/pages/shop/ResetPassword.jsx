import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { validatePassword } from '@/lib/utils';
import { resetPasswordThunk } from '@/redux/slices/authSlice';
import { AlertCircle, Lock, LockOpen } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [info, setInfo] = useState({
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
    const allFields = ['password', 'confirmPassword'];

    let isValid = true;
    allFields.forEach((field) => {
      if (!validateInfo(field)) isValid = false;
    });
    if (!isValid || !token) {
      setIsButtonDisable(false);
      return toast.error('Thông tin không hợp lệ', { duration: 3000 });
    }

    const data = {
      token,
      password: info.password,
    };

    try {
      const response = await dispatch(resetPasswordThunk(data)).unwrap();
      toast.success(response.message);
      navigate('/login');
    } catch (error) {
      toast.error(error);
      console.error(error);
    } finally {
      setIsButtonDisable(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)',
        }}
      />
      {/* Your Content/Components */}
      <div className="w-full relative">
        {/* Radial Gradient Background from Bottom */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)',
          }}
        />
        {/* Your Content/Components */}
        <div className="flex flex-col justify-center items-center pb-11 pt-41 px-3 xl:px-0">
          <form
            className="w-full max-w-lg p-8
            rounded-b-xl border-x-[0.5px] border-b-[0.5px] border-white/50
            bg-white/5 backdrop-blur-md shadow-2xl
            "
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-shadow-md uppercase ">
              Tạo mật khẩu mới
            </h2>
            <p className="text-center mb-6 text-shadow-sm">
              Hãy nhập mật khẩu mới của bạn
            </p>
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

            <Button
              disabled={isButtonDisabled}
              variant="primary"
              size="full"
              type="submit"
              className="mt-8 disabled:opacity-50"
              onClick={(e) => handleSubmit(e)}
            >
              {isButtonDisabled ? 'Đang xử lý...' : 'Gửi'}
            </Button>
            <p className="mt-6 text-center text-sm">
              <Link to="/login" className="text-blue-500 text-shadow-sm">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
