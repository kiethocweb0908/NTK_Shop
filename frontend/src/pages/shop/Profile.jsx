import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import MyOrdersPage from './MyOrdersPage';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { logoutUser } from '@/redux/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import MyInfo from './MyInfo';
import { clearOrders } from '@/redux/slices/orderSlice';
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // if (!user) {
  //   return navigate('/login');
  // }

  const handleLogout = async () => {
    // e.preventDefault();

    if (!user) return toast.error('Không thể đăng xuất khi chưa đăng nhập');

    try {
      await dispatch(clearOrders());
      const result = await dispatch(logoutUser()).unwrap();
      toast.success(result?.message || result || 'aaaa', { duration: 2000 });
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error?.message || error || 'Lỗi khi đăng xuất', { duration: 2000 });
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
      <div className="relative z-10 min-h-screen flex flex-col py-11 px-4">
        <div className="grow container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 md:space-y-0">
            <button
              onClick={() => navigate(-1)}
              className="lg:hidden mb-4
          flex items-center justify-center
          rounded-xl py-2 w-full
          bg-white/5  backdrop-blur-md border-[0.5px] border-white/50 
          text-sm text-shadow-lg shadow-lg font-semibold
          hover:bg-white/10
          transition-all duration-300 ease-out"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Quay lại trang trước
            </button>
            {/* Left Section */}
            <div
              className="w-full lg:min-w-[280.08px] lg:max-w-[300px] overflow-y-auto 
            shadow-md rounded-lg p-6 border border-white/50 bg-white/5 backdrop-blur-md"
            >
              <MyInfo />
              <Button variant="primary" size="full" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
            {/* Right */}
            <div className="w-full  lg:min-w-[732px]">
              <MyOrdersPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
