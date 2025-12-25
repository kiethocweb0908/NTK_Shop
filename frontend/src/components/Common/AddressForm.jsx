// components/AddressForm.jsx
import React, { useState, useEffect } from 'react';
import provincesData from '../../lib/data/vn-provinces.json';
import { Input } from '../ui/input';
import { AlertCircle, MapPin } from 'lucide-react';

// shadcn
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useSelector } from 'react-redux';

const AddressForm = ({
  onAddressChange,
  initialAddress = {},
  disabled = false,
  validate,
  error,
  setError,
  className,
}) => {
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
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,

        province: provinceName,
        district: districtName,
        ward: wardName,
        fullAddress,
      });
    }
  }, [selectedProvince, selectedDistrict, selectedWard, fullAddress]);

  // giá trị ban đầu
  useEffect(() => {
    // console.log(provinces);
    if (!initialAddress?.province || provinces.length === 0) return;

    const province = provinces.find(
      (p) => p.Name.trim() === initialAddress.province.trim()
    );

    // console.log(province);

    if (province) {
      setSelectedProvince(province.Id);
      setFullAddress(initialAddress.fullAddress || '');
      const district = districts.find(
        (d) => d.Name.trim() === initialAddress.district.trim()
      );

      if (district) {
        setSelectedDistrict(district.Id);
      }
    }
  }, [initialAddress, provinces]);

  useEffect(() => {
    if (!selectedProvince || !initialAddress?.district || districts.length === 0) return;

    const district = districts.find(
      (d) => d.Name.trim() === initialAddress.district.trim()
    );

    if (district) {
      setSelectedDistrict(district.Id);
    } else {
      setSelectedDistrict(undefined);
    }
  }, [selectedProvince, districts]);

  useEffect(() => {
    // console.log('wards: ', wards);
    if (!selectedDistrict || !initialAddress?.ward || wards.length === 0) return;

    const ward = wards.find((d) => d.Name.trim() === initialAddress.ward.trim());

    if (ward) {
      setSelectedWard(ward.Id);
    } else {
      setSelectedWard(undefined);
    }
  }, [selectedDistrict, wards]);

  return (
    <div className="space-y-4">
      {/* Địa chỉ đường */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-shadow-sm mb-2">
          Địa chỉ đầy đủ: *
        </label>
        <div className="relative">
          <Input
            type="text"
            value={fullAddress}
            onChange={(e) => {
              setFullAddress(e.target.value);
              if (error.fullAddress) {
                setError((prev) => ({
                  ...prev,
                  fullAddress: '',
                }));
              }
            }}
            onBlur={() => validate('fullAddress')}
            disabled={disabled}
            placeholder="VD: 123 Đường ABC"
            className="w-full py-5 pl-10 pr-5 border border-black/10 focus:ring-0! focus:border-black/30! rounded-md bg-white/45 text-sm text-shadow-sm"
          />
          <MapPin className="absolute top-[50%] -translate-y-[50%] left-3 w-4 h-4 text-black/60" />
        </div>
        {error.fullAddress && (
          <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error.fullAddress}
          </span>
        )}
      </div>

      {/* Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
      <div className={'md:grid grid-cols-3 gap-4' + className}>
        {/* Tỉnh/Thành phố */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-shadow-sm mb-2">
            Tỉnh/Thành phố: *
          </label>
          <Select
            value={selectedProvince}
            onValueChange={(value) => {
              setSelectedProvince(value);
              if (error.province) {
                setError((prev) => ({
                  ...prev,
                  province: '',
                }));
              }
            }}
            onOpenChange={(open) => {
              if (!open && !selectedProvince) {
                validate('province');
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-full p-5 border border-black/10 rounded-md bg-white/45 text-sm text-shadow-sm">
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50">
              {provinces.map((province) => (
                <SelectItem
                  className="hover:bg-gray-100"
                  key={province.Id}
                  value={province.Id}
                >
                  {province.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.province && (
            <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error.province}
            </span>
          )}
        </div>

        {/* Quận/Huyện */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-shadow-sm mb-2">
            Quận/Huyện: *
          </label>
          <Select
            value={selectedDistrict}
            onValueChange={(value) => {
              setSelectedDistrict(value);
              if (error.district) {
                setError((prev) => ({
                  ...prev,
                  district: '',
                }));
              }
            }}
            onOpenChange={(open) => {
              if (!open && !selectedDistrict) {
                validate('district');
              }
            }}
            disabled={!selectedProvince || disabled}
          >
            <SelectTrigger className="w-full p-5 border border-black/10 rounded-md bg-white/45 text-sm text-shadow-sm">
              <SelectValue placeholder="Chọn quận/huyện" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50">
              {districts.map((district) => (
                <SelectItem
                  className="hover:bg-gray-100"
                  key={district.Id}
                  value={district.Id}
                >
                  {district.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.district && (
            <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error.district}
            </span>
          )}
        </div>

        {/* Phường/Xã */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-shadow-sm mb-2">
            Phường/Xã: *
          </label>
          <Select
            value={selectedWard}
            onValueChange={(value) => {
              setSelectedWard(value);
              if (error.ward) {
                setError((prev) => ({
                  ...prev,
                  ward: '',
                }));
              }
            }}
            onOpenChange={(open) => {
              if (!open && !selectedWard) {
                validate('ward');
              }
            }}
            disabled={!selectedDistrict || !selectedProvince || disabled}
          >
            <SelectTrigger className="w-full p-5 border border-black/10 rounded-md bg-white/45 text-sm text-shadow-sm">
              <SelectValue placeholder="Chọn phường/xã" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50">
              {wards.map((ward) => (
                <SelectItem className="hover:bg-gray-100" key={ward.Id} value={ward.Id}>
                  {ward.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.ward && (
            <span className="text-red-500 text-sm flex items-center mt-2 text-shadow-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error.ward}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
