import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* mobile toggle button */}
      <div className="flex lg:hidden p-4 bg-gray-900 text-white z-20 sticky top-0 right-0 left-0">
        <button onClick={toggleSidebar}>
          <FaBars size={24} />
        </button>
        <h1 className="ml-4 text-xl font-medium">Admin Dashboard</h1>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* sidebar */}
      <div
        className={`bg-gray-900 w-64 min-h-screen text-white absolute top-0 bottom-0 lg:relative transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 lg:translate-x-0 lg:static lg:block z-20`}
      >
        {/* content sidebar*/}
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="grow p-6 overflow-auto transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
