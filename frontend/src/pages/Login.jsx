import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import login from '@/assets/login.webp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-row container mx-auto px-4 lg:px-0">
      {/* form login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center pt-8 pb-8 md:pt-12 md:pb-12">
        <form className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">Rabbit</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Hey there</h2>
          <p className="text-center mb-6">
            Enter your username and password to login
          </p>
          {/* email */}
          <div className="mb-4">
            <lable className="block text-sm font-semibold mb-2">Email</lable>
            <input
              type="enmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập email của bạn"
            />
          </div>
          {/* password */}
          <div className="mb-4">
            <lable className="block text-sm font-semibold mb-2">Password</lable>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>
          {/* button */}
          {/* <button type='submit' className='w-full bg-black text-white p-2 rounded-lg font-semibold
          hover:bg-pri'></button> */}
          <Button variant="primary" size="full" type="submit" className="">
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
          <img
            src={login}
            alt="Login"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
