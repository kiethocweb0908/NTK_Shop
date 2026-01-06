import { logoutUser } from '@/redux/slices/authSlice';
import { clearOrders } from '@/redux/slices/orderSlice';
import React from 'react';
import {
  FaBoxOpen,
  FaChartBar,
  FaChartPie,
  FaClipboardList,
  FaList,
  FaSignOutAlt,
  FaStore,
  FaTachometerAlt,
  FaTags,
  FaThLarge,
  FaTshirt,
  FaUser,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    // e.preventDefault();

    // if (!user) return toast.error('Không thể đăng xuất khi chưa đăng nhập');

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
    <div className="p-6 sticky top-0 bottom-0">
      <div className="mb-12 flex justify-center">
        <Link to="/admin" className="text-2xl font-bold">
          NTK Shop
        </Link>
      </div>
      {/* <h2 className="text-xl font-medium mb-6 text-center">
        <Link to="/admin">Trang quản trị</Link>
      </h2> */}
      <nav className="flex flex-col space-y-2">
        <NavLink
          to="/admin?"
          end
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaChartBar />
          <span>Tổng quan</span>
        </NavLink>

        {/* categories */}
        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaTags />
          <span>Danh mục</span>
        </NavLink>

        {/* Collections */}
        <NavLink
          to="/admin/collections"
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaThLarge />
          <span>Bộ sưu tập</span>
        </NavLink>

        {/* products */}
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaTshirt />
          <span>Sản phẩm</span>
        </NavLink>

        {/* orders */}
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaClipboardList />
          <span>Đơn hàng</span>
        </NavLink>

        {/* user */}
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaUser />
          <span>Người dùng</span>
        </NavLink>

        {/* shop */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
          }
        >
          <FaStore />
          <span>Cửa hàng</span>
        </NavLink>
      </nav>
      <div className="mt-12">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
        >
          <span>Đăng xuất</span>
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
