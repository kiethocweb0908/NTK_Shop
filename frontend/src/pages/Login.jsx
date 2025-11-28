import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import login from '@/assets/login.webp';
import { loginUser } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import Result_ from 'postcss/lib/result';
import { toast } from 'sonner';
import { fetchCart } from '@/redux/slices/cartSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const from = location.state?.from?.pathname || '/';

  // Tự động chuyển hướng khi đã login
  useEffect(() => {
    if (user) {
      navigate(from || '/', { replace: true });

      dispatch(fetchCart())
        .unwrap()
        .then((result) => {
          setTimeout(() => {
            toast.success(result?.message || 'cart');
          }, 1000);
        })
        .catch((error) => {
          toast.error(error?.message || 'lỗi');
        });
    }
  }, [user, navigate, from, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Vui lòng nhập email và password');
      return;
    }
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      toast.success(`Đăng nhập thành công. Chào mừng ${result.user.name}!`);
    } catch (error) {
      toast.error(error?.message || 'Đăng nhập thất bại');
    }

    // Không cần navigate ở đây vì useEffect sẽ xử lý

    // dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex flex-row container mx-auto px-4 lg:px-0">
      {/* form login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center pt-8 pb-8 md:pt-12 md:pb-12">
        <form className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">Rabbit</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Hey there</h2>
          <p className="text-center mb-6">Enter your username and password to login</p>
          {/* email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập email của bạn"
            />
          </div>
          {/* password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              autoComplete="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>
          {/* button */}
          {/* <button type='submit' className='w-full bg-black text-white p-2 rounded-lg font-semibold
          hover:bg-pri'></button> */}
          <Button
            variant="primary"
            size="full"
            type="submit"
            className=""
            onClick={(e) => handleSubmit(e)}
          >
            Đăng nhập
          </Button>
          <p className="mt-6 text-center text-sm">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-500">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden lg:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img src={login} alt="Login" className="h-[750px] w-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Login;
