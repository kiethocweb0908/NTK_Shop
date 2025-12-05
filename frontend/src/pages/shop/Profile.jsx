import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import MyOrdersPage from './MyOrdersPage';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { logoutUser } from '@/redux/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogout = async () => {
    // e.preventDefault();

    if (!user) return toast.error('Không thể đăng xuất khi chưa đăng nhập');

    try {
      const result = await dispatch(logoutUser()).unwrap();
      toast.success(result?.message || result || 'aaaa', { duration: 2000 });
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error?.message || error || 'Lỗi khi đăng xuất', { duration: 2000 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grow container mx-auto pt-4 pb-4 md:pt-6 md:pb-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left Section */}
          <div className="w-f md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">John Doe</h1>
            <p className="text-lg text-gray-600 mb-4">John@gmail.com</p>
            <Button variant="primary" size="full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          {/* Right */}
          <div className="w-full md:w-2/3 lg:w-3/4 ">
            <MyOrdersPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
