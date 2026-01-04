import { genders, navType } from '@/lib/data/data';
import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';

// Shadcn
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { clearOrders } from '@/redux/slices/orderSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import { toast } from 'sonner';

const NavDrawerMobile = ({ tongglNavDrawer, navDrawerOpen }) => {
  const { categories } = useSelector((state) => state.categories);
  const { collections } = useSelector((state) => state.collections);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // e.preventDefault();

    if (!user) return toast.error('Không thể đăng xuất khi chưa đăng nhập');

    try {
      dispatch(clearOrders());
      const result = await dispatch(logoutUser()).unwrap();
      toast.success(result?.message || result || 'aaaa', { duration: 2000 });
      tongglNavDrawer();
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error?.message || error || 'Lỗi khi đăng xuất', { duration: 2000 });
    }
  };
  return (
    <div
      className={`md:hidden fixed top-0 left-0 w-4/5 sm:w-2/3 md:w-1/2 h-full bg-white shadow-lg transform transition-transform duration-300 z-55
          ${navDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex justify-end p-4">
        <button onClick={tongglNavDrawer} className="cursor-pointer">
          <IoMdClose className="h-6 w-6 text-gray-600 hover:text-primary-300" />
        </button>
      </div>
      <div className="py-4 px-12">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <nav className="">
          <div>
            <Link
              key={0}
              to="/shop"
              onClick={tongglNavDrawer}
              className="block text-black font-medium hover:text-primary-300 py-7 text-sm border-t "
            >
              Tất cả
            </Link>
            <Accordion type="single" collapsible>
              <AccordionItem value="gender">
                <AccordionTrigger className={'border-t rounded-none py-7'}>
                  Giới tính
                </AccordionTrigger>
                <AccordionContent>
                  {genders.map((gender) => (
                    <Link
                      to={`/shop?gender=${gender.value}`}
                      onClick={tongglNavDrawer}
                      key={gender.value}
                      className="block w-full px-3 py-5 border-b border-b-gray-300 last:border-b-0"
                    >
                      {gender.name}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="category">
                <AccordionTrigger className={'rounded-none py-7'}>
                  Danh mục
                </AccordionTrigger>
                <AccordionContent>
                  {categories.map((category) => (
                    <Link
                      to={`/shop?category=${category._id}`}
                      onClick={tongglNavDrawer}
                      key={category._id}
                      className="block w-full px-3 py-5 border-b border-b-gray-300 last:border-b-0"
                    >
                      {category.name}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="collection">
                <AccordionTrigger className={'rounded-none py-7'}>
                  Bộ sưu tập
                </AccordionTrigger>
                <AccordionContent>
                  {collections.map((collection) => (
                    <Link
                      to={`/shop?collection=${collection._id}`}
                      onClick={tongglNavDrawer}
                      key={collection._id}
                      className="block w-full px-3 py-5 border-b border-b-gray-300 last:border-b-0"
                    >
                      {collection.name}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </nav>
        {/* user */}
        {user && (user.role === 'admin' || user.role === 'viewer') && (
          <Link to="/admin" className="blok bg-black w-full px-2 text-sm text-white mt-8">
            Admin
          </Link>
        )}
        {user && (
          <Button
            variant="primary"
            size="full"
            type="button"
            className={'mt-8'}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavDrawerMobile;
