import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    color: '',
    size: [],
    material: [],
    minPrice: 0,
    maxPrice: 5000000,
  });

  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const categories = ['Tops', 'Bottoms', 'Outerwears'];
  const colors = [
    'Red',
    'Blue',
    'Black',
    'Green',
    'Yellow',
    'Gray',
    'White',
    'Pink',
    'Beige',
    'Navy',
  ];
  const sizes = ['S', 'M', 'L', 'XL'];
  const materials = [
    'Cotton',
    'Wool',
    'Denim',
    'Polyester',
    'Silk',
    'Linen',
    'Viscose',
    'Fleece',
  ];
  const genders = ['Men', 'Women'];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    setFilters({
      category: params.category || '',
      gender: params.gender || '',
      color: params.color || '',
      size: params.size ? params.size.split(',') : [],
      material: params.material ? params.material.split(',') : [],
      minPrice: params.minPrice || 0,
      maxPrice: params.maxPrice || 5000000,
    });
    setPriceRange([0, params.maxPrice || 5000000]);
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...filters };

    if (type === 'checkbox') {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value];
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
      }
    } else {
      newFilters[name] = value;
    }
    setFilters(newFilters);
    // console.log(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
        params.append(key, newFilters[key].join(','));
      } else if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`);
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPriceRange([0, newPrice]);
    const newFilters = { ...filters, minPrice: 0, maxPrice: newPrice };
    // setFilters(filters);
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  return (
    <div className="pt-4 pb-4">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>
      {/* catogory filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-1">
            <input
              type="radio"
              name="category"
              value={category}
              onChange={handleFilterChange}
              checked={filters.category === category}
              className="mr-2 h-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{category}</span>
          </div>
        ))}
      </div>
      {/* gender filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Gender</label>
        <div className="flex gap-4">
          {genders.map((gender) => (
            <div key={gender} className="flex items-center mb-1">
              <input
                type="radio"
                name="gender"
                value={gender}
                onChange={handleFilterChange}
                checked={filters.gender === gender}
                className="mr-2 h-4 text-blue-500 focus:ring-blue-400 border-gray-300"
              />
              <span className="text-gray-700">{gender}</span>
            </div>
          ))}
        </div>
      </div>
      {/* colors filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Color</label>
        <div className="flex flex-wrap gap-4 pl-0.5">
          {colors.map((color) => (
            <button
              key={color}
              name="color"
              value={color}
              onClick={handleFilterChange}
              className={`w-8 h-8 border border-gray-300 cursor-pointer transition rounded-full
            hover:scale-105
            ${filters.color === color ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: color.toLowerCase() }}
            ></button>
          ))}
        </div>
      </div>
      {/* size filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Color</label>
        <div className="flex gap-6">
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
      {/* Material filter */}
      <div className="mb-6">
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
      </div>
      {/* Price filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">
          Price Range
        </label>
        <input
          type="range"
          name="priceRange"
          min={0}
          max={5000000}
          step={500000}
          defaultValue={5000000}
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full h-2 border border-gray-300 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-gray-600 mt-2">
          <span>
            {priceRange[0].toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </span>
          <span>
            {Number(priceRange[1]).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
