import React, { useEffect, useRef, useState } from 'react';

// Shadcn
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Data
import { colors, genders } from '@/lib/data/data';
// Icons
import { XIcon, Trash2, Save, ArrowLeft, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Description } from '@radix-ui/react-alert-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { createCollectionThunk } from '@/redux/admin/slices/adminCollectionsSlice';
import { createCategoryThunk } from '@/redux/admin/slices/adminCategoriesSlice';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);

  const [info, setInfo] = useState({
    name: '',
    description: '',
    image: {
      imageSizeMen: {},
      imageSizeWomen: {},
    },
  });
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  // nhập
  const handleInfoChange = (field, value) => {
    setInfo((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // kiểm
  const validateInfo = (field) => {
    let error;
    switch (field) {
      case 'name':
        if (!info.name.trim()) error = 'Bạn phải nhập tên danh mục';
        const exists = categories.some(
          (category) =>
            category.name.trim().toLowerCase() === info.name.trim().toLowerCase()
        );

        if (exists) error = 'Tên danh mục đã tồn tại';

        break;
      case 'description':
        if (!info.description.trim()) error = 'Bạn phải nhập mô tả cho danh mục';
        break;
      case 'image':
        if (
          (!info.image?.imageSizeMen?.url || !info.image?.imageSizeMen?.file) &&
          (!info.image?.imageSizeWomen?.url || !info.image?.imageSizeWomen?.file)
        )
          error = 'Phải có ít nhất bảng size cho danh mục';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  // blur
  const handleOnBlur = (field) => {
    validateInfo(field);
  };

  // thêm ảnh
  const handleAddImage = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    switch (field) {
      case 'imageSizeMen':
        if (info.image.imageSizeMen?.url)
          URL.revokeObjectURL(info.image.imageSizeMen?.url);
        break;
      case 'imageSizeWomen':
        if (info.image.imageSizeWomen?.url)
          URL.revokeObjectURL(info.image.imageSizeWomen?.url);
        break;
    }

    const newImage = {
      file,
      url: URL.createObjectURL(file),
    };
    setInfo((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        [field]: newImage,
      },
    }));
    setErrors((prev) => ({ ...prev, image: '' }));

    e.target.value = '';
  };

  // xoá ảnh
  const handleRemoveImage = (field) => {
    switch (field) {
      case 'imageSizeMen':
        if (info.image.imageSizeMen?.url)
          URL.revokeObjectURL(info.image.imageSizeMen?.url);
        break;
      case 'imageSizeWomen':
        if (info.image.imageSizeWomen?.url)
          URL.revokeObjectURL(info.image.imageSizeWomen?.url);
        break;
    }

    setInfo((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        [field]: {},
      },
    }));
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisable(true);

    const allFields = ['name', 'description', 'image'];
    let isValid = true;
    allFields.forEach((field) => {
      if (!validateInfo(field)) {
        isValid = false;
      }
    });
    if (!isValid) {
      setIsButtonDisable(false);
      return toast.error('Thông tin không hợp lệ', { duration: 3000 });
    }

    const toastId = toast.loading('Đang xử lý...', { duration: Infinity });
    try {
      const response = await dispatch(createCategoryThunk({ data: info })).unwrap();
      toast.dismiss(toastId);
      toast.success(response.message);
      navigate(-1);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error);
      console.error(error);
    } finally {
      setIsButtonDisable(false);
    }
  };

  return (
    <>
      {isButtonDisabled && <div className="bg-black/20 fixed inset-0 z-50"></div>}
      <div className="max-w-4xl mx-auto">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-semibold uppercase mb-6 pt-7 px-7">Thêm danh mục</h2>

        {/* <UploadProgressModal /> */}

        {/* form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-1 p-7 shadow-md rounded-xl">
            {/* tên */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">Tên bộ sưu tập *</label>
              <Textarea
                name="name"
                value={info.name}
                onChange={(e) => handleInfoChange('name', e.target.value)}
                onBlur={() => handleOnBlur('name')}
                placeholder="Hãy nhập tên của bộ sưu tập..."
                rows={5}
                className={'overflow-y-auto max-h-16 mb-2'}
              />
              {errors.name && (
                <span className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </span>
              )}
            </div>
            {/* Mô tả */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">Mô tả bộ sưu tập *</label>
              <Textarea
                name="description"
                value={info.description}
                onChange={(e) => handleInfoChange('description', e.target.value)}
                onBlur={() => handleOnBlur('description')}
                placeholder="Hãy nhập mô tả sản phẩm..."
                rows={5}
                className={'overflow-y-auto max-h-[120px] mb-2'}
              />
              {errors.description && (
                <span className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </span>
              )}
            </div>
            {/* size nam */}
            <div className="mb-4">
              <div className="mb-4">
                <div className="flex items-center gap-4 ">
                  <label className="block font-medium ">Bảng size Nam/Unisex:</label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      handleAddImage(e, 'imageSizeMen');
                    }}
                    className="w-20 text-center px-3"
                  />
                  <p className="text-xs font-mono">(.jpeg .jpg .png .webp)</p>
                </div>
                {errors.image && (
                  <span className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.image}
                  </span>
                )}
              </div>
              {/* khung ảnh, ảnh, chọn ảnh */}
              <div
                className="relative min-h-[250px] rounded-xl 
          border-2 border-dashed text-gray-400 cursor-pointer"
              >
                {!info.image.imageSizeMen?.url && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                    Chưa có ảnh nào. Hãy thêm hình ảnh
                  </span>
                )}

                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    handleAddImage(e, 'imageSizeMen');
                  }}
                  className="absolute w-full h-full opacity-0 text-center px-3 cursor-pointer"
                />
                {/* ảnh và nút  */}
                {info.image.imageSizeMen?.url && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto border">
                    <img
                      className="h-full w-auto"
                      src={info.image.imageSizeMen?.url}
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('imageSizeMen')}
                      className="bg-red-500 p-1.5 rounded-full absolute -top-1.5 -right-2
                    hover:bg-red-600 active:bg-red-500"
                    >
                      <XIcon className="text-white h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* size nữ */}
            <div className="">
              <div className="mb-4">
                <div className="flex items-center gap-4 ">
                  <label className="block font-medium ">Bảng size Nữ:</label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      handleAddImage(e, 'imageSizeWomen');
                    }}
                    className="w-20 text-center px-3"
                  />
                  <p className="text-xs font-mono">(.jpeg .jpg .png .webp)</p>
                </div>
                {errors.image && (
                  <span className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.image}
                  </span>
                )}
              </div>
              {/* khung ảnh, ảnh, chọn ảnh */}
              <div
                className="relative min-h-[250px] rounded-xl 
          border-2 border-dashed text-gray-400 cursor-pointer"
              >
                {!info.image.imageSizeWomen?.url && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                    Chưa có ảnh nào. Hãy thêm hình ảnh
                  </span>
                )}

                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    handleAddImage(e, 'imageSizeWomen');
                  }}
                  className="absolute w-full h-full opacity-0 text-center px-3 cursor-pointer"
                />
                {/* ảnh và nút  */}
                {info.image.imageSizeWomen?.url && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto border">
                    <img
                      className="h-full w-auto"
                      src={info.image.imageSizeWomen?.url}
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('imageSizeWomen')}
                      className="bg-red-500 p-1.5 rounded-full absolute -top-1.5 -right-2
                    hover:bg-red-600 active:bg-red-500"
                    >
                      <XIcon className="text-white h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* back & submit */}
          <div className="flex flex-col gap-3 fixed bottom-7 right-5 z-10">
            <Button
              type="submit"
              variant={'outline'}
              disabled={isButtonDisabled}
              className="flex gap-3 items-center justify-start
                  border border-green-500 rounded-md bg-white 
                  underline text-green-600 py-2 px-3 text-sm 
                  hover:text-green-500 active:text-green-600"
            >
              <Save className="mr-2" />
              {isButtonDisabled ? 'Đang xử lý...' : 'Tạo bộ sưu tập'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant={'outline'}
              className="flex items-center gap-3 bg-white justify-start
                            underline text-blue-500
                            hover:text-blue-400 active:text-blue-500"
            >
              <ArrowLeft className="" /> Quay lại trang trước
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddCategoryPage;
