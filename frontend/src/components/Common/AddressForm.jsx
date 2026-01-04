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

  // KHỞI TẠO BAN ĐẦU - chỉ chạy một lần
  useEffect(() => {
    if (!provinces.length || !initialAddress?.province) return;

    const province = provinces.find(
      (p) => p.Name.trim() === initialAddress.province.trim()
    );

    if (province) {
      setSelectedProvince(province.Id);
      setFullAddress(initialAddress.fullAddress || '');
      setDistricts(province.Districts || []);

      // Tìm district
      if (initialAddress?.district) {
        const district = province.Districts?.find(
          (d) => d.Name.trim() === initialAddress.district.trim()
        );

        if (district) {
          setSelectedDistrict(district.Id);
          setWards(district.Wards || []);

          // Tìm ward
          if (initialAddress?.ward) {
            const ward = district.Wards?.find(
              (w) => w.Name.trim() === initialAddress.ward.trim()
            );

            if (ward) {
              setSelectedWard(ward.Id);
            }
          }
        }
      }
    }
  }, [provinces, disabled]); // CHỈ phụ thuộc vào provinces

  // Khi user chọn tỉnh mới
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find((p) => p.Id === selectedProvince);
      const newDistricts = province?.Districts || [];
      setDistricts(newDistricts);

      // Reset chỉ khi không tìm thấy district ban đầu trong districts mới
      const initialDistrict = initialAddress?.district
        ? newDistricts.find((d) => d.Name.trim() === initialAddress.district.trim())
        : null;

      if (!initialDistrict) {
        setSelectedDistrict('');
        setSelectedWard('');
        setWards([]);
      }
    }
  }, [selectedProvince, provinces]);

  // Khi user chọn quận mới
  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find((d) => d.Id === selectedDistrict);
      const newWards = district?.Wards || [];
      setWards(newWards);

      // Reset chỉ khi không tìm thấy ward ban đầu trong wards mới
      const initialWard = initialAddress?.ward
        ? newWards.find((w) => w.Name.trim() === initialAddress.ward.trim())
        : null;

      if (!initialWard) {
        setSelectedWard('');
      }
    }
  }, [selectedDistrict, districts]);

  // Gửi dữ liệu
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
      <div className={'md:grid grid-cols-3 gap-4 ' + className}>
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
