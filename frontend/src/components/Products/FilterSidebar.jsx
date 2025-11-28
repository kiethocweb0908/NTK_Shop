import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '@/redux/slices/categorySlice';

import { colors, sizes, genders, materials } from '@/lib/data';
import { Slider } from '../ui/slider';
import { formatCurrency } from '@/lib/utils';

const FilterSidebar = () => {
  // api
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // url bộ lọc
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Bộ lọc
  const [filters, setFilters] = useState({
    category: [],
    gender: [],
    color: '',
    size: [],
    material: [],
    minPrice: 0,
    maxPrice: 1000000,
  });

  // Giá trị slider (đơn vị: VND)
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [isSliding, setIsSliding] = useState(false);
  // giá

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    const minPrice = params.minPrice ? parseInt(params.minPrice) : 0;
    const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : 1000000;

    setFilters({
      category: params.category ? params.category.split(',') : [],
      gender: params.gender ? params.gender.split(',') : [],
      color: params.color || '',
      size: params.size ? params.size.split(',') : [],
      // material: params.material ? params.material.split(',') : [],
      minPrice,
      maxPrice,
    });
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilters((prev) => {
      let newValue;
      // let newFilters = { ...filters };

      if (type === 'checkbox') {
        if (checked) {
          // Thêm value vào array
          newValue = [...prev[name], value];
          // newFilters[name] = [...(newFilters[name] || []), value];
        } else {
          newValue = prev[name].filter((item) => item !== value);
        }
      } else {
        newValue = value;
      }

      const newFilters = { ...prev, [name]: newValue };
      updateURLParams(newFilters);
      return newFilters;
    });
  };

  // Hàm xử lý multiple selection
  const handleColorChange = (colorValue) => {
    setFilters((prev) => {
      const currentColor = prev.color ? prev.color.split(',') : [];

      let newColors;

      if (currentColor.includes(colorValue)) {
        newColors = currentColor.filter((c) => c !== colorValue);
      } else {
        newColors = [...currentColor, colorValue];
      }

      const newFilters = {
        ...prev,
        color: newColors.join(','),
      };

      updateURLParams(newFilters);
      return newFilters;
    });
  };

  const updateURLParams = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();

      Object.keys(newFilters).forEach((key) => {
        const value = newFilters[key];

        // 🎯 KIỂM TRA VALUE CÓ RỖNG KHÔNG
        const isEmpty =
          (Array.isArray(value) && value.length === 0) || // [] → empty
          (typeof value === 'string' && value === '') || // "" → empty
          (typeof value === 'number' && value === 0); // 0 → empty

        if (!isEmpty) {
          if (Array.isArray(value)) {
            // 🎯 DÙNG set() thay vì append()
            params.set(key, value.join(','));
          } else {
            params.set(key, value.toString());
          }
        }

        // if (Array.isArray(newFilters[key]) && value.length > 0) {
        //   // chuyển arr thành string phân cách bằng ,
        //   params.set(key, value.join(','));
        // } else if (value && value !== '' && value !== 0) {
        //   params.set(key, value.toString());
        // } else {
        //   params.delete(key);
        // }
      });

      setSearchParams(params);
      navigate(`?${params.toString()}`, { replace: true });
    },
    [searchParams, navigate]
  );

  // Xử lý thay đổi slider
  const handlePriceChange = (newPrice) => {
    setPriceRange(newPrice);
    // const newFilters = { ...filters, minPrice: 0, maxPrice: newPrice };
    // // setFilters(filters);
    // setFilters(newFilters);
    // updateURLParams(newFilters);
    setIsSliding(true);
  };

  // Xử lý khi kéo xong (buông chuột)
  const handlePriceChangeEnd = (newValue) => {
    setIsSliding(false);

    const newFilters = {
      ...filters,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    };

    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  // Lấy tên category từ _id
  const getCategoryName = (categoryIds) => {
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0)
      return '';

    return categoryIds
      .map((categoryId) => {
        const category = categories.find(
          (c) => c._id.toString() === categoryId.toString()
        );
        return category ? category.name : '';
      })
      .filter((name) => name)
      .join(',');
  };

  return (
    <div className="pt-4 pb-4 lg:pr-6">
      <h3 className="text-xl font-medium text-gray-800 mb-6">Bộ lọc</h3>
      {/* gender filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Giới tính</label>
        <div className="flex gap-4">
          {genders.map((gender) => (
            <div key={gender} className="flex items-center mb-1">
              <input
                type="checkbox"
                name="gender"
                value={gender}
                onChange={handleFilterChange}
                checked={filters.gender.includes(gender)}
                className="mr-2 h-4 text-blue-500 focus:ring-blue-400 border-gray-300"
              />
              <span className="text-gray-700">{gender}</span>
            </div>
          ))}
        </div>
      </div>
      {/* catogory filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Danh mục</label>
        {categoriesLoading ? (
          <p>Đang tải danh mục...</p>
        ) : categories && categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="flex items-center mb-1">
              <input
                type="checkbox"
                name="category"
                value={category._id}
                onChange={handleFilterChange}
                checked={filters.category.includes(category._id)}
                className="mr-2 h-4 text-blue-500 focus:ring-blue-400 border-gray-300"
              />
              <span className="text-gray-700">{category.name}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Không có danh mục nào</p>
        )}
      </div>

      {/* size filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Kích thước</label>
        <div className="flex justify-between">
          {sizes.map((size) => (
            <div key={size} className="flex items-center mb-1">
              <input
                type="checkbox"
                name="size"
                value={size}
                onChange={handleFilterChange}
                checked={filters.size.includes(size)}
                className="mr-2 h-4 text-blue-500 focus:ring-blue-400 border-gray-300"
              />
              <span className="text-gray-700">{size}</span>
            </div>
          ))}
        </div>
      </div>
      {/* colors filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Màu sắc</label>
        <div className="flex flex-wrap gap-4 pl-0.5">
          {colors.map((color) => {
            const isSelected = filters.color
              ? filters.color.split(',').includes(color.colorHex)
              : false;
            return (
              <button
                key={color.colorHex}
                type="button"
                onClick={() => handleColorChange(color.colorHex)}
                className={`w-6 h-6 border border-gray-300 cursor-pointer transition rounded-full
                  hover:scale-105
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color.colorHex.toLowerCase() }}
                title={color.colorName}
              ></button>
            );
          })}
        </div>
      </div>

      {/* Material filter */}
      {/* <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Material</label>
        {materials.map((material) => (
          <div key={material} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="material"
              value={material}
              onChange={handleFilterChange}
              checked={filters.material.includes(material)}
              className="mr-2 h-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{material}</span>
          </div>
        ))}
      </div> */}

      {/* Price filter với Shadcn Slider */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-4">Khoảng giá</label>

        <div className="space-y-4">
          {/* Slider */}
          <Slider
            value={priceRange}
            min={0}
            max={1000000}
            step={50000}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            className="w-full"
          />

          {/* Hiển thị giá trị */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm font-medium text-gray-700">
              {formatCurrency(priceRange[0])}
            </div>
            <div className="text-sm text-gray-500">đến</div>
            <div className="text-sm font-medium text-gray-700">
              {formatCurrency(priceRange[1])}
            </div>
          </div>

          {/* Hiển thị trạng thái loading khi đang kéo */}
          {isSliding &&
            (filters.maxPrice !== priceRange[1] ||
              filters.minPrice !== priceRange[0]) && (
              <div className="text-xs text-gray-500 text-center animate-pulse">
                Đang chọn giá...
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
