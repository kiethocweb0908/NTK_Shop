import React from 'react';
import { TbBrandMeta } from 'react-icons/tb';
import { IoLogoInstagram, IoMdPhonePortrait } from 'react-icons/io';
import { AiOutlineTikTok } from 'react-icons/ai';

const Topbar = () => {
  return (
    <div className="bg-primary text-white">
      <div className="container mx-auto flex justify-between items-center py-3">
        {/* nội dung container */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="#" className="hover:text-primary-100">
            <TbBrandMeta className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-primary-100">
            <IoLogoInstagram className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-primary-100">
            <AiOutlineTikTok className="h-5 w-5" />
          </a>
        </div>

        <div className="grow text-sm text-center hover:text-primary-100">
          <span>Trang web này sử dụng với mục đích học tập!</span>
        </div>

        <div className="hidden md:block text-sm">
          <a href="tel:+84986036424" className="flex items-center gap-1 hover:text-primary-100">
            <IoMdPhonePortrait />
            <p>0986 036 424</p>
          </a>
        </div>
        {/* kết thúc container */}
      </div>
    </div>
  );
};

export default Topbar;
