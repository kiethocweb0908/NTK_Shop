import React from 'react';
import { Link } from 'react-router-dom';
import { navType } from '../../lib/data';
import { TbBrandMeta } from 'react-icons/tb';
import { IoLogoInstagram } from 'react-icons/io';
import { AiOutlineTikTok } from 'react-icons/ai';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-12 flex flex-col items-center">
      <div className="container md:grid md:grid-cols-4 gap-2 lg:gap-4 xl:gap-8 lg:px-0 px-4 md:px-0 ">
        {/* Bản tin */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Bản tin</h3>
          <p className="text-gray-500 mb-4">
            là người đầu tiên biết về các sản phẩm mới, độc quyền và trực tuyến
            khác
          </p>
          <p className="font-medium text-sm text-gray-600 mb-6">
            Đăng ký và được giảm giá 10% cho đơn hàng đầu tiên của bạn.
          </p>
          {/* form email */}
          <form className="flex">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 p-3 w-full text-sm border-t border-l border-b border-gray-300
              rounded-l-md 
              focus:outline-none  focus:ring-gray-500 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 
              active:bg-black transition-all"
            >
              Gửi
            </button>
          </form>
        </div>

        {/* Cửa hàng */}
        <div className="w-1/2 inline-block md:w-full md:block mt-6 md:mt-0 mb-6 md:mb-0">
          <h3 className="text-lg text-gray-800 mb-4 ">Cửa hàng</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="#" className="hover:text-primary-300">
                Thời trang nam
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary-300">
                Thời trang nữ
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary-300">
                Áo
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary-300">
                Quần
              </Link>
            </li>
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div className="w-1/2 inline-block md:w-full md:block mt-6 md:mt-0 mb-6 md:mb-0">
          <h3 className="text-lg text-gray-800 mb-4 ">Hỗ trợ</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="#" className="hover:text-primary-300">
                Liên hệ với chúng tôi
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary-300">
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary-300">
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary-300">
                Điểm nổi bật
              </Link>
            </li>
          </ul>
        </div>

        {/* Theo dõi */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Theo dõi chúng tôi</h3>
          <div className="flex items-center space-x-4 mb-6">
            <a
              href="https://www.facebook.com/SuperNTK0908/"
              target="_blank"
              rel=" noopener noreferrer"
              className="hover:text-primary-300"
            >
              <TbBrandMeta className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/SuperNTK0908/"
              target="_blank"
              rel=" noopener noreferrer"
              className="hover:text-primary-300"
            >
              <IoLogoInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/SuperNTK0908/"
              target="_blank"
              rel=" noopener noreferrer"
              className="hover:text-primary-300"
            >
              <AiOutlineTikTok className="h-5 w-5" />
            </a>
          </div>
          <div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62860.6228798734!2d105.71628460413856!3d10.034268918158308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0629f6de3edb7%3A0x527f09dbfb20b659!2zQ-G6p24gVGjGoSwgTmluaCBLaeG7gXUsIEPhuqduIFRoxqEsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1761552675802!5m2!1svi!2s"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg w-full md:max-w-[178px] lg:max-w-[244px] xl:max-w-[296px]"
            ></iframe>
          </div>
        </div>
      </div>
      {/* footer bottom */}
      <div className="w-full mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6">
        <p className="text-center text-gray-500 text-sm tracking-tighter hover:text-primary-300">
          2025.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
