import { Button } from '@/components/ui/button';
import React from 'react';
import MyOrdersPage from './MyOrdersPage';

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="grow container mx-auto pt-4 pb-4 md:pt-6 md:pb-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left Section */}
          <div className="w-f md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">John Doe</h1>
            <p className="text-lg text-gray-600 mb-4">John@gmail.com</p>
            <Button variant="primary" size="full">
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
