// components/AddressForm.jsx
import React, { useState, useEffect } from 'react';
import provincesData from '../../lib/data/vn-provinces.json';

const AddressForm = ({ onAddressChange, initialAddress = {}, disabled = false }) => {
  // Load provinces, districts, wards
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // seclected provinces, districts, wards
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  // Load provinces
  useEffect(() => {
    setProvinces(provincesData);
  }, []);

  // Load districts khi chọn province
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find((p) => p.Id === selectedProvince);
      setDistricts(province?.Districts || []);
      setSelectedDistrict('');
      setSelectedWard('');
    }
  }, [selectedProvince, provinces]);

  // Load wards khi chọn district
  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find((d) => d.Id === selectedDistrict);
      setWards(district?.Wards || []);
      setSelectedWard('');
    }
  }, [selectedDistrict, districts]);

  useEffect(() => {
    if (onAddressChange) {
      const provinceName = provinces.find((p) => p.Id === selectedProvince)?.Name || '';
      const districtName = districts.find((d) => d.Id === selectedDistrict)?.Name || '';
      const wardName = wards.find((w) => w.Id === selectedWard)?.Name || '';

      onAddressChange({
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,

        provinceName,
        districtName,
        wardName,
        fullAddress,
      });
    }
  }, [selectedProvince, selectedDistrict, selectedWard, fullAddress]);

  return (
    <div className="space-y-4">
      {/* Địa chỉ đường */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ đầy đủ: *
        </label>
        <input
          type="text"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          disabled={disabled}
          placeholder="VD: 123 Đường ABC"
          className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        />
      </div>

      {/* Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
      <div className="md:grid grid-cols-3 gap-4">
        {/* Tỉnh/Thành phố */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố: *
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option disabled value="">
              Chọn tỉnh/thành phố
            </option>
            {provinces.map((province) => (
              <option key={province.Id} value={province.Id}>
                {province.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Quận/Huyện */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện: *
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedProvince}
            className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          >
            <option disabled value="">
              Chọn quận/huyện
            </option>
            {districts.map((district) => (
              <option key={district.Id} value={district.Id}>
                {district.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Phường/Xã */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã: *
          </label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            disabled={!selectedDistrict || !selectedProvince}
            className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          >
            <option disabled value="">
              Chọn phường/xã
            </option>
            {wards.map((ward) => (
              <option key={ward.Id} value={ward.Id}>
                {ward.Name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
