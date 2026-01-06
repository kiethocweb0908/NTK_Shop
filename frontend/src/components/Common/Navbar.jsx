import React, { useContext, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

// Icons
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

import { Check, ChevronDown, UserCheck2, LogOut } from 'lucide-react';
import Menu from './Menu';

import { LayoutContext } from '../Layout/UserLayout';
import { clearOrders } from '@/redux/slices/orderSlice';
import { toast } from 'sonner';
import { logoutUser } from '@/redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.user.cart);
  const { user } = useSelector((state) => state.auth);
  //active navbar
  const [navActive, setNavActive] = useState('');

  // đóng / mở giỏ hàng
  const { tonggleCartDrawer, tongglNavDrawer, toggleSearch } = useContext(LayoutContext);

  const location = useLocation();

  const handleLogout = async () => {
    // e.preventDefault();

    if (!user) return toast.error('Không thể đăng xuất khi chưa đăng nhập');

    try {
      dispatch(clearOrders());
      const result = await dispatch(logoutUser()).unwrap();
      toast.success(result?.message || result || 'aaaa', { duration: 2000 });
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error?.message || error || 'Lỗi khi đăng xuất', { duration: 2000 });
    }
  };

  return (
    <>
      <nav className="max-w-7xl mx-auto flex  gap-2 items-center justify-between al py-4 px-3 xl:px-0">
        {/* Logo */}
        <div
          onClick={() => setNavActive('')}
          className="border border-white/95 rounded-2xl
            bg-white/85 shadow-lg backdrop-blur-3xl
            text-shadow-lg 
            h-12 px-4 leading-12
            text-2xl font-black text-black hover:text-primary-300 "
        >
          <Link to="/">
            NTK
            <p className="hidden xl:inline">Clothing</p>
          </Link>
        </div>

        {/* Center */}
        <div
          className="hidden lg:flex space-x-1 items-center
        px-4 border
        border-white/95 bg-white/85 rounded-2xl 
        backdrop-blur-3xl shadow-lg text-shadow-lg"
        >
          <Menu />
        </div>

        {/* Right */}
        <div
          className="flex items-center space-x-4
        px-4 border 
        border-white/95 bg-white/85 rounded-2xl 
         shadow-lg text-shadow-lg select-none"
        >
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'viewer') && (
                <Link
                  to="/admin"
                  className="hidden md:block bg-black px-2 text-sm text-white"
                >
                  Admin
                </Link>
              )}

              {/* user */}
              <div className="relative group transition-all duration-300 ease-linear">
                <div
                  className={`leading-12 h-12 min-w-16
            flex items-center justify-center border-b-2 
            text-center text-sm font-bold
            group-hover:text-primary-300 group-hover:border-b-primary-300 
            transition-all duration-300 ease-in
            ${location.pathname === '/profile' ? 'border-b-primary-300 text-primary-300' : 'border-b-transparent'}`}
                >
                  <HiOutlineUser className="h-6 w-6" />
                  <ChevronDown className="h-4 w-4 " />
                </div>
                <ul
                  className="absolute left-1/2 -translate-x-1/2 top-full 
                  py-2 w-[180px]
                bg-white rounded-lg shadow-lg mt-px
                  invisible group-hover:visible
                  opacity-0 group-hover:opacity-100
                  transform
                  -translate-y-3 group-hover:translate-y-0
                  scale-80 group-hover:scale-100
                  transition-all duration-200 ease-linear
                  z-40"
                >
                  <li key={0}>
                    <NavLink to={`/profile`}>
                      {({ isActive }) => (
                        <div
                          className={`w-full px-5 py-2 hover:bg-gray-100/70 text-sm flex justify-between items-center ${isActive ? 'text-primary-300 bg-gray-50' : ''}`}
                        >
                          {' '}
                          <p>Thông tin tài khoản</p>{' '}
                          {isActive && <Check className="h-3 w-3" />}{' '}
                        </div>
                      )}
                    </NavLink>
                  </li>
                  {/* Đăng xuất */}
                  <li key={1}>
                    <button
                      type="button"
                      onClick={() => handleLogout()}
                      className="w-full px-5 py-2 hover:bg-gray-100/70 text-sm
                      hover:text-red-500
                      flex items-center gap-3"
                    >
                      <p>Đăng xuất</p>
                      <LogOut className="w-5 h-5 text-red-500/80" />
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <Link to="/login" className="p-3 hover:text-primary-300">
              Đăng nhập
            </Link>
          )}
          <button
            onClick={tonggleCartDrawer}
            className="p-3 relative hover:text-primary-300 cursor-pointer"
          >
            <HiOutlineShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1 bg-primary-300 text-white text-xs rounded-full px-2 py-0.5">
              {cart?.totalItems || 0}
            </span>
          </button>
          {/* Right-Search */}
          {/* <div className="overflow-hidden md:m-0">
            <SearchBar />
          </div> */}

          <button
            onClick={toggleSearch}
            className="relative hover:text-primary-300 md:m-0
            pl-3 pt-3 pb-3 m-0 cursor-pointer pr-3 md:pr-0"
          >
            <HiMagnifyingGlass className="h-6 w-6" />
          </button>

          <button className="md:hidden pl-3 pt-3 pb-3" onClick={tongglNavDrawer}>
            <HiBars3BottomRight className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
