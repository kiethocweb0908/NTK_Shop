import React, { useEffect, useRef, useState } from 'react';

// Shadcn
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Icons
import { Save, ArrowLeft, AlertCircle, Plus } from 'lucide-react';
import { data, useNavigate, useParams } from 'react-router-dom';
import { Description } from '@radix-ui/react-alert-dialog';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedCollection,
  createCollectionThunk,
  editCollectionThunk,
  fetchColelctionDetailsThunk,
} from '@/redux/admin/slices/adminCollectionsSlice';
const EditCollectionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { collectionId } = useParams();

  const { collections, selectedCollection, loading, error } = useSelector(
    (state) => state.collections
  );

  const [info, setInfo] = useState({
    name: '',
    description: '',
    image: {},
  });
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  //
  useEffect(() => {
    dispatch(clearSelectedCollection());

    const fetchCollection = async () => {
      const response = await dispatch(
        fetchColelctionDetailsThunk({ collectionId })
      ).unwrap();
      setInfo({
        name: response.collection.name,
        description: response.collection.description,
        image: response.collection.image,
      });
    };
    fetchCollection();

    return () => {
      dispatch(clearSelectedCollection());
    };
  }, [dispatch]);

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
        if (!info.name.trim()) error = 'Bạn phải nhập tên bộ sưu tập';
        const exists = collections.some(
          (collection) =>
            collection.name === info.name && collection._id !== selectedCollection?._id
        );

        if (exists) error = 'Tên bộ sưu tập đã tồn tại';

        break;
      case 'description':
        if (!info.description.trim()) error = 'Bạn phải nhập mô tả cho bộ sưu tập';
        break;
      case 'image':
        if (!info.image?.url && !info.image?.file)
          error = 'Bạn phải chọn ảnh cho bộ sưu tập';
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
  const handleAddImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (info.image?.url) {
      URL.revokeObjectURL(info.image.url);
    }

    const newImage = {
      file,
      url: URL.createObjectURL(file),
    };
    console.log('a');
    setInfo((prev) => ({ ...prev, image: newImage }));
    setErrors((prev) => ({ ...prev, image: '' }));

    // e.target.value = '';
  };

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

    console.log(info);
    try {
      const response = await dispatch(
        editCollectionThunk({
          collectionId,
          data: info,
        })
      ).unwrap();

      toast.success(response.message);
      navigate(-1);
    } catch (error) {
      toast.error(error);
      console.error(error);
    } finally {
      setIsButtonDisable(false);
    }
  };

  if (!selectedCollection) {
    return <p>Đang tải thông tin...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-semibold uppercase mb-6 pt-7 px-7">
        Chỉnh sửa bộ sưu tập
      </h2>

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
          {/* text và button ảnh */}
          <div className="mb-4">
            <div className="flex items-center gap-4 ">
              <label className="block font-medium ">Thêm hình ảnh:</label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  handleAddImage(e);
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
            {!info.image?.url && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                Chưa có ảnh nào. Hãy thêm hình ảnh
              </span>
            )}

            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                handleAddImage(e);
              }}
              className="w-full h-full opacity-0 text-center px-3 cursor-pointer"
            />
            {/* ảnh và nút  */}
            {info.image?.url && (
              <img
                className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto border"
                src={info.image?.url}
                alt=""
              />
            )}
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
            {isButtonDisabled ? 'Đang xử lý...' : 'Lưu bộ sưu tập'}
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
  );
};

export default EditCollectionPage;
