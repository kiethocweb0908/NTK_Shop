import React from 'react';
// import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { genders } from '@/lib/data/data';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import { useSelector } from 'react-redux';

const Menu = () => {
  const { categories } = useSelector((state) => state.user.categories);
  const { collections } = useSelector((state) => state.user.collections);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const currentGender = searchParams.get('gender');
  const currentCategory = searchParams.get('category');
  const currentCollection = searchParams.get('collection');

  // Đếm số lượng filter đang active
  const filterCount = [
    currentGender ? 1 : 0,
    currentCategory ? 1 : 0,
    currentCollection ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Kiểm tra có duy nhất 1 filter không
  const hasSingleFilter = filterCount === 1;

  // Kiểm tra từng loại filter có nên active không
  const shouldHighlightGender = hasSingleFilter && currentGender;
  const shouldHighlightCategory = hasSingleFilter && currentCategory;
  const shouldHighlightCollection = hasSingleFilter && currentCollection;

  // Kiểm tra mục "Tất cả" - chỉ active khi không có filter nào
  const shouldHighlightAll = filterCount === 0 && location.pathname === '/shop';

  return (
    <>
      {/* Tất cả */}
      <NavLink
        to="/shop"
        end
        className={({ isActive }) =>
          `min-w-[104px] h-12 px-4 
                text-center text-sm font-bold leading-12
                hover:text-primary-300 hover:border-b-primary-300 
                transition-all duration-300 ease-in ` +
          (shouldHighlightAll
            ? 'border-b-2 border-b-primary-300 text-primary-300'
            : 'border-b-2 border-b-transparent')
        }
      >
        Tất cả
      </NavLink>

      {/* Giới tính */}
      <div className="relative group h-12 px-4 transition-all duration-300 ease-linear">
        <div
          className={`min-w-[104px]
            flex items-center justify-center
            text-center text-sm font-bold leading-12
            group-hover:text-primary-300 group-hover:border-b-primary-300 
            transition-all duration-300 ease-in  ${
              shouldHighlightGender
                ? 'border-b-2 border-b-primary-300 text-primary-300'
                : 'border-b-2 border-b-transparent'
            }`}
        >
          Giới tính
          <ChevronDown className="h-4 w-4 ml-1" />
        </div>
        <ul
          className="absolute left-1/2 -translate-x-1/2 top-full 
            py-2 w-[180px]
          bg-white
          mt-px
            text-shadow-lg
            rounded-lg shadow-lg
            invisible group-hover:visible
            opacity-0 group-hover:opacity-100
            transform
            -translate-y-3 group-hover:translate-y-0
            scale-80 group-hover:scale-100
            transition-all duration-200 ease-linear
            z-50"
        >
          {genders.map((gender) => (
            <li key={gender.value}>
              <Link
                to={`/shop?gender=${gender.value}`}
                className={`w-full px-5 py-2 hover:bg-gray-100/70 text-sm 
                flex justify-between items-center ${
                  currentGender === gender.value ? 'text-primary-300 bg-gray-50' : ''
                }`}
              >
                <p>{gender.name}</p>
                {currentGender === gender.value && <Check className="h-4 w-4" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Danh mục */}
      <div className="relative group h-12 px-4 transition-all duration-300 ease-linear">
        <div
          className={`min-w-[104px]
            flex items-center justify-center 
            text-center text-sm font-bold leading-12
            group-hover:text-primary-300 group-hover:border-b-primary-300 
            transition-all duration-300 ease-in  ${
              shouldHighlightCategory
                ? 'border-b-2 border-b-primary-300 text-primary-300'
                : 'border-b-2 border-b-transparent'
            }`}
        >
          Danh mục
          <ChevronDown className="h-4 w-4 ml-1" />
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
            z-50"
        >
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                to={`/shop?category=${category._id}`}
                className={`w-full px-5 py-2 hover:bg-gray-100/70 text-sm 
                flex justify-between items-center ${
                  currentCategory === category._id ? 'text-primary-300 bg-gray-50' : ''
                }`}
              >
                <p>{category.name}</p>
                {currentCategory === category._id && <Check className="h-4 w-4" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bộ sưu tập */}
      <div className="relative group h-12 px-4 transition-all duration-300 ease-linear">
        <div
          className={`min-w-[104px]
                flex items-center justify-center
                text-center text-sm font-bold leading-12
                group-hover:text-primary-300 group-hover:border-b-primary-300 
                transition-all duration-300 ease-in  ${
                  shouldHighlightCollection
                    ? 'border-b-2 border-b-primary-300 text-primary-300'
                    : 'border-b-2 border-b-transparent'
                }`}
        >
          Bộ sưu tập
          <ChevronDown className="h-4 w-4 ml-1" />
        </div>
        <ul
          className="absolute left-1/2 -translate-x-1/2 top-full 
            py-2 w-[220px]  mt-px
          bg-white rounded-lg shadow-lg
            invisible group-hover:visible
            opacity-0 group-hover:opacity-100
            transform
            -translate-y-3 group-hover:translate-y-0
            scale-80 group-hover:scale-100
            transition-all duration-200 ease-linear
            z-50"
        >
          {collections.length > 0 ? (
            collections.map((collection) => (
              <li key={collection._id}>
                <Link
                  to={`/shop?collection=${collection._id}`}
                  className={`w-full px-5 py-2 hover:bg-gray-100/70 text-sm 
                flex justify-between items-center ${
                  currentCollection === collection._id
                    ? 'text-primary-300 bg-gray-50'
                    : ''
                }`}
                >
                  <p>{collection.name}</p>
                  {currentCollection === collection._id && <Check className="h-4 w-4" />}
                </Link>
              </li>
            ))
          ) : (
            <li
              className="w-full px-5 py-2 hover:bg-gray-100/70 text-sm 
                flex justify-center"
            >
              Không có bộ sưu tập
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default Menu;
