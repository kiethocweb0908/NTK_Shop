import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPasswordThunk } from '@/redux/slices/authSlice';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmaail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  const handleInfoChange = (value) => {
    setEmaail(value);
    setError('');
  };

  const validateInfo = () => {
    let newError;
    if (!email.trim()) {
      newError = 'Bạn phải nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newError = 'Email không đúng định dạng';
      }
    }

    setError(newError);
    return !newError;
  };

  const handleOnBlur = () => {
    validateInfo();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisable(true);
    if (!validateInfo()) {
      setIsButtonDisable(false);
      return toast.error('Thông tin không hợp lệ!');
    }

    try {
      const response = await dispatch(forgotPasswordThunk({ email })).unwrap();
      toast.success(response.message);
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
      <div className="flex flex-col justify-center items-center pb-11 pt-41 px-3 xl:px-0">
        <form
          className="w-full max-w-lg p-8
            rounded-b-xl border-x-[0.5px] border-b-[0.5px] border-white/50
            bg-white/5 backdrop-blur-md shadow-2xl
            "
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-shadow-md uppercase ">
            Quên mật khẩu
          </h2>
          <p className="text-center mb-6 text-shadow-sm">
            Hãy nhập email của tài khoản bạn đã quên mật khẩu
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
                value={email}
                onChange={(e) => handleInfoChange(e.target.value)}
                onBlur={() => handleOnBlur()}
                className="w-full py-5 px-10 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/70  text-sm"
                placeholder="Nhập email của bạn"
              />
              <Mail className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
            </div>
            {error && (
              <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </span>
            )}
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

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-blue-500 text-shadow-sm mt-6 text-center text-sm 
            flex items-center w-full justify-center
            hover:text-blue-400 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại trang trước
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
