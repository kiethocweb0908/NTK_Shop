import React, { useEffect, useState } from 'react';

// shadcn
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';

import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  fetchCurrentUser,
  resendRegisterOTPThunk,
  verifyRegisterOTPThunk,
} from '@/redux/slices/authSlice';
import { toast } from 'sonner';

const Otp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const { state } = useLocation();

  const email = state?.email;

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  const handleResend = async () => {
    try {
      const response = await dispatch(resendRegisterOTPThunk({ email })).unwrap();
      toast.success(response, { duration: 3000 });
    } catch (error) {
      toast.error(error, { duration: 3000 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) return toast.error('Vui lòng nhập đủ 6 số OTP');

    try {
      const response = await dispatch(
        verifyRegisterOTPThunk({
          email,
          otp,
        })
      ).unwrap();
      sessionStorage.removeItem('registerData');
      if (response) {
        toast.success(response.message, { duration: 3000 });
        await dispatch(fetchCurrentUser()).unwrap();
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.message || error);
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
      <div className="flex flex-col justify-center items-center py-11">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-12
            rounded-xl border-x-[0.5px] border-b-[0.5px] border-white/50
            bg-white/5 backdrop-blur-md shadow-2xl
            flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-shadow-md uppercase ">
            mã Xác nhận
          </h2>
          <p className="mb-6 text-center text-gray-700 text-shadow-sm">
            Mã xác nhận đã được gửi qua mail của bạn
          </p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            className="w-full"
          >
            <InputOTPGroup className="shadow-md">
              <InputOTPSlot
                index={0}
                className="text-lg h-14 w-14 bg-white/3 backdrop-blur-md 
                border border-black/20 ring-0 
                data-[active=true]:border-white data-[active=true]:ring-1
                data-[active=true]:ring-white/50 data-[active=true]:caret-black caret-black"
              />
              <InputOTPSlot
                index={1}
                className="text-lg h-14 w-14 bg-white/3 backdrop-blur-md 
                border border-black/20 ring-0 
                data-[active=true]:border-white data-[active=true]:ring-1
                data-[active=true]:ring-white/50 data-[active=true]:caret-black caret-black"
              />
              <InputOTPSlot
                index={2}
                className="text-lg h-14 w-14 bg-white/3 backdrop-blur-md 
                border border-black/20 ring-0 
                data-[active=true]:border-white data-[active=true]:ring-1
                data-[active=true]:ring-white/50 data-[active=true]:caret-black caret-black"
              />
            </InputOTPGroup>
            {/* <InputOTPSeparator className="text-shadow-sm" /> */}
            <InputOTPGroup className="shadow-md">
              <InputOTPSlot
                index={3}
                className="text-lg h-14 w-14 bg-white/3 backdrop-blur-md 
                border border-black/20 ring-0 
                data-[active=true]:border-white data-[active=true]:ring-1
                data-[active=true]:ring-white/50 data-[active=true]:caret-black caret-black"
              />
              <InputOTPSlot
                index={4}
                className="text-lg h-14 w-14 bg-white/3 backdrop-blur-md 
                border border-black/20 ring-0 
                data-[active=true]:border-white data-[active=true]:ring-1
                data-[active=true]:ring-white/50 data-[active=true]:caret-black caret-black"
              />
              <InputOTPSlot
                index={5}
                className="text-lg h-14 w-14 bg-white/3 backdrop-blur-md 
                border border-black/20 ring-0 
                data-[active=true]:border-white data-[active=true]:ring-1
                data-[active=true]:ring-white/50 data-[active=true]:caret-black caret-black"
              />
            </InputOTPGroup>
          </InputOTP>
          <div className="w-full mt-4 flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-shadow-sm underline flex items-center text-blue-500 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </button>
            <Button
              onClick={() => handleResend()}
              type="button"
              variant="a"
              className="cursor-pointer text-blue-500"
            >
              Gửi lại mã
            </Button>
          </div>
          <Button type="submit" size="full" variant="primary" className="mt-4">
            Xác Nhận
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Otp;
