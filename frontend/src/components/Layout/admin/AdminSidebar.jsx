import React from 'react';
import {
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaStore,
  FaUser,
} from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/login');
  };
  return (
    <div className="p-6 sticky top-0 bottom-0">
      <div className="mb-6">
        <Link to="/admin" className="text-2xl font-medium">
          NTK
        </Link>
      </div>
      <h2 className="text-xl font-medium mb-6 text-center">
        <Link to="/admin">Admin Dashboard</Link>
      </h2>
      <nav className="flex flex-col space-y-2">
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
          <span>User</span>
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
          <FaBoxOpen />
          <span>Products</span>
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
          <span>Orders</span>
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
          <span>Shop</span>
        </NavLink>
      </nav>
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
