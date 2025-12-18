import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import UploadProgressModal from './UploadProgressModal';

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

// format
import { formatCurrency } from '@/lib/utils';
// Data
import { colors, allSizes, genders } from '@/lib/data/data';
// Icons
import {
  AlertCircle,
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  XIcon,
  Sparkles,
  History,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedProduct,
  editProduct,
  fetchAdminProductDetails,
  updateBasicFieldsThunk,
} from '@/redux/admin/slices/adminProductsSlice';
import { Description } from '@radix-ui/react-alert-dialog';
import AlertDialogDemo from '@/components/Common/AlertDialog';

const EditProdcutPage = () => {
  // lấy sản phẩm
  const { productId } = useParams();
  const { selectedProduct } = useSelector((state) => state.adminProducts);
  const { categories } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // trường cơ bản sản phẩm
  const [basicFieldProduct, setBasicFieldProduct] = useState({});
  const [basicFieldErrors, setBasicFieldErrors] = useState({});

  const [variantsData, setVariantsData] = useState([]);
  const [variantsDataErrors, setVariantsDataErrors] = useState({});
  const [deletedImages, setDeletedImages] = useState([]);

  // Danh sách màu đã được chọn
  const [selectedColors, setSelectedColors] = useState([]);
  // để useEffect 1 lần cho lần đầu mount lấy selectedColors
  const [initialized, setInitialized] = useState(false);

  // loading dữ liệu và clear dữ liệu cũ
  useEffect(() => {
    dispatch(clearSelectedProduct());
    dispatch(fetchAdminProductDetails({ productId }));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch]);

  // truyền dữ liệu vào state
  useEffect(() => {
    if (selectedProduct && categories.length > 0) {
      setBasicFieldProduct({
        _id: selectedProduct._id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        description: selectedProduct.description,
        price: selectedProduct.price,
        discountPrice: selectedProduct.discountPrice || '',
        gender: selectedProduct.gender,
        category: selectedProduct.category?._id,
        productCollection: selectedProduct?.productCollection?._id || '',
      });

      setVariantsData(selectedProduct.variants);

      setIsLoading(false);
    }
  }, [selectedProduct, productId, categories]);

  // set lại selectedColors khi variantsData thay đổi
  useEffect(() => {
    if (!initialized && variantsData.length > 0) {
      const initialColors = variantsData.map((v) => v.colorHex).filter((hex) => !!hex); // bỏ qua null/undefined
      setSelectedColors(initialColors);
      setInitialized(true);
    }
  }, [variantsData, initialized]);

  // handle basic field product change
  const handleBasicFieldProductChange = (field, value) => {
    setBasicFieldProduct((prev) => ({
      ...prev,
      [field]: value ? value : null,
    }));

    setBasicFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // format price
  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'discountPrice') {
      const rawValue = value.replace(/\./g, '');
      if (!isNaN(rawValue)) {
        setProdcutData((prevData) => ({
          ...prevData,
          price: Number(rawValue),
          formattedPrice: new Intl.NumberFormat('vi-VN').format(rawValue),
        }));
      }
    } else {
      setProdcutData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // validate basic field
  const validateBasicField = (field) => {
    let error = '';
    switch (field) {
      // name
      case 'name':
        if (!basicFieldProduct.name?.trim()) {
          error = 'Tên sản phẩm là bắt buộc!';
        } else if (
          products.some(
            (p) =>
              p.name.trim() === basicFieldProduct.name.trim() &&
              p._id.toString() !== productId.toString()
          )
        ) {
          error = 'Tên sản phẩm đã tồn tại';
        }
        break;
      // sku
      case 'sku':
        if (!basicFieldProduct.sku?.trim()) {
          error = 'SKU sản phẩm là bắt buộc';
        } else if (
          products.some(
            (p) =>
              p.sku.trim() === basicFieldProduct.sku.trim() &&
              p._id.toString() !== productId.toString()
          )
        ) {
          error = 'SKU sản phẩm đã tồn tại';
        }
        break;
      // description
      case 'description':
        if (!basicFieldProduct.description?.trim()) {
          error = 'Mô tả sản phẩm là bắt buộc';
        }
        break;
      // price
      case 'price':
        if (!basicFieldProduct.price || parseFloat(basicFieldProduct.price) <= 0) {
          error = 'Giá sản phẩm bắt buộc lớn hơn 0';
        }
        break;
      // discountPrice
      case 'discountPrice':
        if (basicFieldProduct.discountPrice) {
          const price = parseFloat(basicFieldProduct.price) || 0;
          const discountPrice = parseFloat(basicFieldProduct.discountPrice) || 0;
          if (discountPrice > price) error = 'Giá khuyến mãi không được lớn hơn giá gốc';
          if (discountPrice < 0) error = 'Giá không được âm';
        }
        break;
      // category
      case 'category':
        if (!basicFieldProduct.category) {
          error = 'Danh mục là bắt buộc';
        }
        break;
      // default
      default:
        break;
    }
    setBasicFieldErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateVariant = () => {
    const newVariants = variantsData.filter((v) => v?.isNew);
    newVariants.forEach((v) => {
      if (v.colorHex === '' || v.images.length === 0 || v.sizes.length === 0) {
        setVariantsDataErrors((prev) => {
          const newErrors = { ...prev };
          if (v.colorHex === '' && v.colorName === '') {
            newErrors[v._id] = {
              ...newErrors[v._id],
              color: 'Chưa chọn màu sắc cho biến thể',
            };
          }
          if (v.sizes.length === 0) {
            newErrors[v._id] = {
              ...newErrors[v._id],
              size: 'Mỗi biến thể phải có ít nhất 1 size',
            };
          }
          if (v.images.length === 0) {
            newErrors[v._id] = {
              ...newErrors[v._id],
              image: 'Mỗi biến thể phải có ít nhất 1 ảnh',
            };
          }
          return newErrors;
        });
      }
    });
  };

  // validate khi blur khỏi input
  const handleInputBlur = (field) => {
    validateBasicField(field);
  };

  // Kiểm tra dữ liệu của trường cơ bản thay đổi
  const checkBasicFieldChange = (field, updateBasicField) => {
    if (field === 'category' || field === 'productCollection') {
      if (basicFieldProduct[field] !== selectedProduct[field]._id) {
        updateBasicField[field] = basicFieldProduct[field];
      }
    } else if (basicFieldProduct[field] !== selectedProduct[field]) {
      updateBasicField[field] = basicFieldProduct[field];
    }
    return updateBasicField;
  };

  //Xử lý chọn màu sắc
  const handleColorChange = (variantId, colorHex, colorName) => {
    const currentVariant = variantsData.find((v) => v._id === variantId);

    if (!currentVariant) return;

    // Kiểm tra màu đã được chọn chưa
    if (selectedColors.includes(colorHex) && currentVariant.colorHex !== colorHex) {
      return toast.warning('Màu này đã được chọn trong biến thể khác', {
        duration: 3000,
      });
    }

    // Cập nhật selected colors
    const newSelectedColors = [...selectedColors];
    const oldColor = currentVariant.colorHex;

    if (oldColor) {
      const oldIndex = newSelectedColors.indexOf(oldColor);
      if (oldIndex > -1) {
        newSelectedColors.splice(oldIndex, 1);
      }
    }

    if (colorHex) {
      newSelectedColors.push(colorHex);
    }

    setSelectedColors(newSelectedColors);

    // cập nhật variant
    const updatedCurrentVariant = {
      ...currentVariant,
      colorName: colorName || '',
      colorHex: colorHex || '',
    };

    const newVariantsData = variantsData.map((v) =>
      v._id === variantId ? updatedCurrentVariant : v
    );

    setVariantsData(newVariantsData);
    const variant = newVariantsData.find((v) => v._id === variantId);
    if (variantsDataErrors[variantId]?.color) {
      setVariantsDataErrors((prev) => {
        const newErrors = { ...prev };
        if (variant.colorHex && variant.colorHex !== '' && variant.colorHex !== null) {
          const { color, ...rest } = newErrors[variantId];
          newErrors[variantId] = rest;
        }
        return newErrors;
      });
    }
  };

  // Lấy danh sách màu có sẵn (chưa được chọn)
  const getAvailableColors = (currentVariantId) => {
    const currentVariant = variantsData.find((v) => v._id === currentVariantId);
    const currentColor = currentVariant?.colorHex;
    return colors.filter(
      (color) =>
        !selectedColors.includes(color.colorHex) || color.colorHex === currentColor
    );
  };

  const deleteValidateSize = (variantId, updated) => {
    const variant = updated.find((v) => v._id === variantId);

    setVariantsDataErrors((prev) => {
      const newErrors = { ...prev };
      if (variant.sizes.length === 0) {
        newErrors[variantId] = {
          ...newErrors[variantId],
          size: 'Mỗi biến thể phải có ít nhất 1 size',
        };
      } else {
        if (newErrors[variantId]) {
          const { size, ...rest } = newErrors[variantId];
          newErrors[variantId] = rest;
        }
      }
      return newErrors;
    });
  };

  // Xử lý chọn/bỏ size
  const handleSizeToggle = (variantId, sizeName, checked) => {
    const updated = variantsData.map((v) => {
      if (v._id !== variantId) return v;

      let newSizes = v.sizes;
      if (checked && !v.sizes.find((s) => s.name === sizeName)) {
        const variantDb = selectedProduct.variants.find((v) => v._id === variantId);
        const sizeDb = variantDb?.sizes.find((s) => s?.name === sizeName);
        if (sizeDb) {
          newSizes = [...v.sizes, { name: sizeName, countInStock: sizeDb.countInStock }];
        } else {
          newSizes = [...v.sizes, { name: sizeName, countInStock: 0 }];
        }
      }
      if (!checked) {
        newSizes = v.sizes.filter((s) => s.name !== sizeName);
      }
      return { ...v, sizes: newSizes };
    });

    setVariantsData(updated);

    deleteValidateSize(variantId, updated);
  };

  // bỏ check size đã có
  const handleUncheckOldSize = (variantId, sizeName) => {
    const updated = variantsData.map((v) => {
      if (v._id !== variantId) return v;

      const newSizes = v.sizes.filter((s) => s.name !== sizeName);
      return { ...v, sizes: newSizes };
    });
    setVariantsData(updated);
    deleteValidateSize(variantId, updated);
  };

  // xử lý số lượng
  const handleQuantityChange = (variantId, sizeName, quantity) => {
    setVariantsData((prev) =>
      prev.map((v) => {
        if (v._id !== variantId) return v;

        const newSizes = v.sizes.map((s) =>
          s.name === sizeName ? { ...s, countInStock: Number(quantity) } : s
        );
        return { ...v, sizes: newSizes };
      })
    );
  };

  // thêm ảnh
  const handleAddImage = async (variantId, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }

    const variant = variantsData.find((v) => v._id === variantId);
    const images = variant.images;

    const uniqueFiles = files.filter((file) => !isDuplicateFile(file, images));

    // Nếu có trùng
    const duplicateCount = files.length - uniqueFiles.length;
    if (duplicateCount > 0) {
      toast.warning(`Đã bỏ qua ${duplicateCount} ảnh trùng lặp`, {
        duration: 3000,
      });
    }

    // Nếu tất cả files đều trùng, không làm gì cả
    if (uniqueFiles.length === 0) {
      e.target.value = ''; // Reset input
      return;
    }

    // Kiểm tra số lượng ảnh
    if (uniqueFiles.length + images.length > 5) {
      toast.warning(`Vượt quá số lượng ảnh cho phép. Còn lại ${5 - images.length} ảnh`, {
        duration: 3000,
      });
      e.target.value = '';
      return;
    }

    const newImages = uniqueFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setVariantsData((prev) => {
      const updated = prev.map((v) =>
        v._id === variantId ? { ...v, images: [...v.images, ...newImages] } : v
      );
      const variant = updated.find((v) => v._id === variantId);
      setVariantsDataErrors((prev) => {
        const newErrors = { ...prev };
        if (variant.images.length > 0 && newErrors[variantId]) {
          const { image, ...rest } = newErrors[variantId];
          newErrors[variantId] = rest;
        }
        return newErrors;
      });
      return updated;
    });
    e.target.value = '';
  };
  // Kiểm tra và loại bỏ file trùng
  const isDuplicateFile = (file, existingFiles) => {
    return existingFiles.some(
      (existingFile) =>
        existingFile?.file?.name === file.name && existingFile?.file?.size === file.size
    );
  };

  // Xoá ảnh
  const handleRemoveImage = (variantId, imageIndex) => {
    setVariantsData((prev) => {
      const deleted = prev.map((v) => {
        if (v._id !== variantId) return v;

        const img = v.images[imageIndex];
        if (!img?.publicId) {
          URL.revokeObjectURL(img.url);
        }
        if (img?.publicId) {
          setDeletedImages((prev) => [...prev, { variantId, publicId: img.publicId }]);
        }

        const newImages = [...v.images];
        newImages.splice(imageIndex, 1);
        return { ...v, images: newImages };
      });

      const variant = deleted.find((v) => v._id === variantId);
      setVariantsDataErrors((prev) => {
        const newErrors = { ...prev };
        if (variant.images.length === 0) {
          newErrors[variantId] = {
            ...newErrors[variantId],
            image: 'Mỗi biến thể phải có ít nhất 1 ảnh',
          };
        }
        return newErrors;
      });
      return deleted;
    });
  };

  // xoá variant
  const handleRemoveVariant = (variantId, colorName) => {
    const updatedVariant = variantsData.filter((v) => v._id !== variantId);
    const deletedVariant = variantsData.find((v) => v._id === variantId);
    deletedVariant.images.forEach((img) => {
      if (!img?.publicId) {
        URL.revokeObjectURL(img.url);
      }
      if (img?.publicId) {
        setDeletedImages((prev) => [...prev, { variantId, publicId: img.publicId }]);
      }
    });

    const oldColor = selectedColors.indexOf(deletedVariant.colorHex);
    const newSelectedColors = [...selectedColors];
    if (oldColor > -1) {
      newSelectedColors.splice(oldColor, 1);
      setSelectedColors(newSelectedColors);
    }

    setVariantsData(updatedVariant);
    if (colorName) {
      toast.success(`Đã loại bỏ biến thể màu "${colorName}"`);
    }
  };

  const handleAddVariant = () => {
    const generateVariantId = () =>
      `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (variantsData.length >= 6) {
      return toast.warning('Đạt đến số lượng biến thể có thể tạo', { duration: 3000 });
    }

    setVariantsData((prev) => [
      ...prev,
      {
        _id: generateVariantId(),
        colorName: '',
        colorHex: '',
        sizes: [],
        images: [],
        isNew: true,
      },
    ]);
  };

  // lấy ra những ảnh mới
  const handleNewImages = () => {
    return variantsData
      .filter((v) => !String(v._id).includes('variant'))
      .map((v) => ({
        variantId: v._id,
        colorName: v.colorName,
        images: v.images.filter((i) => !i.publicId).map((i) => i.file),
      }))
      .filter((v) => v.images.length > 0);
  };

  // loại bỏ trùng lặp mảng deletedImages
  const handleDeletedImages = () => {
    const map = new Map();
    deletedImages.forEach(({ variantId, publicId }) => {
      if (!map.has(variantId)) {
        map.set(variantId, { variantId, publicIds: [] });
      }
      const obj = map.get(variantId);
      if (!obj.publicIds.includes(publicId)) {
        obj.publicIds.push(publicId);
      }
    });

    const result = Array.from(map.values());
    return result;
  };

  const handleValue = () => {
    const variants = variantsData.filter((v) => !v?.isNew);
    const variantMap = new Map(variants.map((v) => [v._id, v]));

    const result = selectedProduct.variants.reduce(
      (acc, selectedVariant) => {
        const existingVariant = variantMap.get(selectedVariant._id);

        if (!existingVariant) {
          acc.deletedVariants.push(selectedVariant._id);
          return acc;
        }

        if (selectedVariant.colorHex !== existingVariant.colorHex) {
          acc.updatedColor.push({
            variantId: selectedVariant._id,
            colorName: existingVariant.colorName,
            colorHex: existingVariant.colorHex,
          });
        }

        const selectedSizesMap = new Map(selectedVariant.sizes.map((s) => [s.name, s]));
        const existingSizesMap = new Map(existingVariant.sizes.map((s) => [s.name, s]));

        // Xử lý deletedSizes và updatedCountInStock
        selectedVariant.sizes.forEach((selectedSize) => {
          const existingSize = existingSizesMap.get(selectedSize.name);

          if (existingSize) {
            if (selectedSize.countInStock !== existingSize.countInStock) {
              const variantData = acc.updatedCountInStockMap.get(selectedVariant._id) || {
                sizes: [],
              };
              variantData.sizes.push({
                name: existingSize.name,
                countInStock: existingSize.countInStock,
              });
              acc.updatedCountInStockMap.set(selectedVariant._id, variantData);
            }
          } else {
            const variantData = acc.deletedSizesMap.get(selectedVariant._id) || {
              sizes: [],
            };
            variantData.sizes.push({ name: selectedSize.name });
            acc.deletedSizesMap.set(selectedVariant._id, variantData);
          }
        });

        // Xử lý newSizes
        existingVariant.sizes.forEach((existingSize) => {
          if (!selectedSizesMap.has(existingSize.name)) {
            const variantData = acc.newSizesMap.get(existingVariant._id) || { sizes: [] };
            variantData.sizes.push({
              name: existingSize.name,
              countInStock: existingSize.countInStock,
            });
            acc.newSizesMap.set(existingVariant._id, variantData);
          }
        });

        return acc;
      },
      {
        deletedVariants: [],
        updatedColor: [],
        updatedCountInStockMap: new Map(),
        deletedSizesMap: new Map(),
        newSizesMap: new Map(),
      }
    );

    // Chuyển Map thành mảng đã gom nhóm
    const formatMapToArray = (map) =>
      Array.from(map.entries()).map(([variantId, data]) => ({
        variantId,
        sizes: data.sizes,
      }));

    return {
      deletedVariants: result.deletedVariants,
      deletedSizes: formatMapToArray(result.deletedSizesMap),
      updatedCountInStock: formatMapToArray(result.updatedCountInStockMap),
      updatedColor: result.updatedColor,
      newSizes: formatMapToArray(result.newSizesMap),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('variantErrors: ', variantsDataErrors);

    // validate basic filed
    const allFields = [
      'name',
      'sku',
      'description',
      'price',
      'discountPrice',
      'category',
      'gender',
    ];
    let isValid = true;
    const updateBasicField = {};
    allFields.forEach((field) => {
      if (!validateBasicField(field)) {
        isValid = false;
      }
      checkBasicFieldChange(field, updateBasicField);
    });

    validateVariant();

    const notValidVariants = Object.entries(variantsDataErrors).filter(
      ([_, errors]) => Object.keys(errors).length > 0
    );

    if (!isValid || notValidVariants.length > 0)
      return toast.error('Thông tin không hợp lệ', { duration: 3000 });

    const { deletedVariants, deletedSizes, updatedCountInStock, updatedColor, newSizes } =
      handleValue();

    console.log('field basic: ', updateBasicField); // trường basic thay đổi
    // console.log('variantsData: ', variantsData);
    const deletedImages = handleDeletedImages();
    console.log('deletedImages đã lọc: ', deletedImages); // ảnh bị xoá
    console.log('deletedVariants: ', deletedVariants); // biến thể bị xoá
    console.log('updatedCountInStock: ', updatedCountInStock); // số lượng cập nhật
    console.log('deletedSizes: ', deletedSizes); // sizes bị xoá
    console.log('newSizes: ', newSizes); // size mới
    console.log('updatedColor: ', updatedColor); // màu cập nhật
    const newImages = handleNewImages();
    console.log('newImages: ', newImages); // ảnh mới
    const newVariants = variantsData
      .filter((v) => v?.isNew)
      .map((v) => {
        const imageFiles = v.images.map((img) => (img.file ? img.file : img));
        return { ...v, images: imageFiles };
      });
    console.log('newVariants: ', newVariants); // biến thể mới

    try {
      const response = await dispatch(
        editProduct({
          productId,
          basicField: updateBasicField,
          updatedCountInStock,
          newSizes,
          deletedSizes,
          updatedColor,
          newImages,
          deletedImages,
          newVariants,
          deletedVariants,
        })
      ).unwrap();
      toast.success(response?.message || 'Chỉnh sửa sản phẩm thành công');
      console.log(response);
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error) {
      toast.error(error?.message || 'Lỗi');
      console.log(error?.message || error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-7 text-center">
        <p className="text-gray-500">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  return (
    <>
      <UploadProgressModal action={'edit'} />
      <div className="relative">
        <div className="max-w-4xl mx-auto">
          {/* Tiêu đề */}
          <h2 className="text-2xl text-center font-semibold uppercase mb-6 pt-7 px-7">
            Chỉnh Sửa Sản Phẩm
          </h2>
          {/* <UploadProgressModal /> */}

          {/* form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6 p-7 shadow-md rounded-xl">
              {/* tên */}
              <div>
                <label className="block font-semibold mb-2">Tên sản phẩm *</label>
                <Input
                  type="text"
                  name="name"
                  value={basicFieldProduct?.name}
                  onChange={(e) => handleBasicFieldProductChange('name', e.target.value)}
                  onBlur={() => handleInputBlur('name')}
                  placeholder="Hãy nhập tên sản phẩm..."
                  className="w-full outline-0
              focus:ring-blue-500 focus:border-blue-500 mb-2"
                />
                {basicFieldErrors.name && (
                  <span className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {basicFieldErrors.name}
                  </span>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block font-semibold mb-2">SKU sản phẩm *</label>
                <Input
                  type="text"
                  name="sku"
                  value={basicFieldProduct.sku}
                  onChange={(e) => handleBasicFieldProductChange('sku', e.target.value)}
                  onBlur={() => handleInputBlur('sku')}
                  placeholder="Hãy nhập SKU sản phẩm..."
                  className="w-full outline-0
              focus:ring-blue-500 focus:border-blue-500 mb-2"
                />
                {basicFieldErrors.sku && (
                  <span className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {basicFieldErrors.sku}
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-2">Mô tả sản phẩm *</label>
                <Textarea
                  name="description"
                  value={basicFieldProduct.description}
                  onChange={(e) =>
                    handleBasicFieldProductChange('description', e.target.value)
                  }
                  onBlur={() => handleInputBlur('description')}
                  placeholder="Hãy nhập mô tả sản phẩm..."
                  rows={5}
                  className={'overflow-y-auto max-h-[120px] mb-2'}
                />
                {basicFieldErrors.description && (
                  <span className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {basicFieldErrors.description}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {/* giá gốc */}
                <div className="mb-2">
                  <div className="flex items-center justify-between gap-6 w-full">
                    <label className="block font-semibold">Giá sản phẩm: *</label>
                    <Input
                      type="number"
                      name="price"
                      min="0"
                      value={basicFieldProduct.price}
                      onChange={(e) =>
                        handleBasicFieldProductChange('price', e.target.value)
                      }
                      onBlur={() => handleInputBlur('price')}
                      placeholder="Hãy nhập giá sản phẩm..."
                      className="w-1/2 outline-0
              focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {basicFieldErrors.price && (
                    <span className="text-red-500 text-sm flex items-center justify-end text-right mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {basicFieldErrors.price}
                    </span>
                  )}
                </div>

                {/* giảm giá */}
                <div className="mb-2">
                  <div className="flex items-center justify-between gap-6 w-full">
                    <label className="block font-semibold">Giá khuyến mãi: </label>
                    <Input
                      type="number"
                      name="discountPrice"
                      min="0"
                      value={basicFieldProduct.discountPrice}
                      onChange={(e) =>
                        handleBasicFieldProductChange('discountPrice', e.target.value)
                      }
                      onBlur={() => handleInputBlur('discountPrice')}
                      placeholder="Hãy nhập giá sản phẩm..."
                      className="w-1/2 outline-0
              focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {basicFieldErrors.discountPrice && (
                    <span className="text-red-500 text-sm flex items-center justify-end mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {basicFieldErrors.discountPrice}
                    </span>
                  )}
                </div>

                {/* Màu sắc */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="block font-semibold">Biến thể màu sắc:</label>
                    <p>({variantsData.length}/6)</p>
                    <button
                      type="button"
                      onClick={() => handleAddVariant()}
                      className="py-2 px-3 flex items-center ml-2
                font-semibold text-sm text-white text-shadow-md
                rounded-lg bg-green-400  cursor-pointer
                active:opacity-100 hover:opacity-80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm
                    </button>
                    <label className="font-semibold">{/* ({variants.length}/6) */}</label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Danh mục */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold">Danh mục: *</label>
                    <Select
                      value={basicFieldProduct.category}
                      onValueChange={(value) =>
                        handleBasicFieldProductChange('category', value)
                      }
                    >
                      <SelectTrigger className="w-58">
                        <SelectValue placeholder="Hãy chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent className={'bg-white'}>
                        <SelectGroup>
                          <SelectLabel>Danh mục</SelectLabel>
                          {categories.map((category, index) => (
                            <SelectItem
                              key={index}
                              className={'hover:bg-gray-100'}
                              value={category._id}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {basicFieldErrors.category && (
                    <span className="text-red-500 text-sm flex w-full justify-end items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {basicFieldErrors.category}
                    </span>
                  )}
                </div>

                {/* Giới tính */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold">Giới tính: *</label>
                    <Select
                      value={basicFieldProduct.gender}
                      onValueChange={(value) =>
                        handleBasicFieldProductChange('gender', value)
                      }
                    >
                      <SelectTrigger className="w-58">
                        <SelectValue placeholder="Hãy chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent className={'bg-white'}>
                        <SelectGroup>
                          <SelectLabel>Danh mục</SelectLabel>
                          {genders.map((gender, index) => (
                            <SelectItem
                              key={index}
                              className={'hover:bg-gray-100'}
                              value={gender.value}
                            >
                              {gender.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {basicFieldErrors.category && (
                    <span className="text-red-500 text-sm flex w-full justify-end items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {basicFieldErrors.category}
                    </span>
                  )}
                </div>

                {/* Bộ sưu tập */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold">Bộ sưu tập: </label>
                    <Select
                      value={basicFieldProduct.productCollection}
                      onValueChange={(value) =>
                        handleBasicFieldProductChange('productCollection', value)
                      }
                    >
                      <SelectTrigger className="w-58">
                        <SelectValue placeholder="Hãy chọn bộ sưu tập" />
                      </SelectTrigger>
                      <SelectContent className={'bg-white'}>
                        <SelectGroup>
                          <SelectLabel>Danh mục</SelectLabel>
                          <SelectItem className={'hover:bg-gray-100'} value="summer">
                            Summer Collection
                          </SelectItem>
                          <SelectItem className={'hover:bg-gray-100'} value="winter">
                            Winter Collection
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="block w-full text-red-500 text-end"></span>
                </div>
              </div>
              {/* Màu sắc */}

              <div className="flex sm:hidden items-center justify-between mb-2">
                <label className="block font-semibold">Biến thể màu sắc:</label>
                <p>({variantsData.length}/6)</p>
                <button
                  type="button"
                  onClick={() => handleAddVariant()}
                  className="py-2 px-3 flex items-center ml-2
                font-semibold text-sm text-white text-shadow-md
                rounded-lg bg-green-400  cursor-pointer
                active:opacity-100 hover:opacity-80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm
                </button>
                <label className="font-semibold">{/* ({variants.length}/6) */}</label>
              </div>
            </div>

            {/* Các biến thể có trong db */}

            <div>
              {variantsData.map((variant, variantIndex) => {
                const availableColors = getAvailableColors(variantsData._id);
                const variantDb = selectedProduct?.variants?.find(
                  (v) => v._id === variant._id
                );
                const variantError = variantsDataErrors[variant._id];

                return (
                  <div
                    key={variant._id}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-7 shadow-md rounded-xl relative border-t border-gray-100"
                  >
                    {/* Hiển thị lỗi của variant */}
                    {variantError && Object.keys(variantError).length > 0 && (
                      <div className="md:col-span-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        {Object.entries(variantError)
                          .filter(([_, error]) => error)
                          .map(([field, error]) => (
                            <div
                              key={field}
                              className="text-red-600 text-sm flex items-center"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              {error}
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Left - Màu và Size */}
                    <div>
                      <label className="block font-semibold mb-4">
                        Biến thể {variantIndex + 1}
                      </label>
                      {/* màu */}
                      <div className="flex items-center gap-3 mb-4">
                        <label className="block font-medium">Màu sắc: *</label>
                        <div>
                          <Select
                            value={variant.colorHex}
                            onValueChange={(value) => {
                              const selectedColor = colors.find(
                                (c) => c.colorHex === value
                              );
                              handleColorChange(
                                variant._id,
                                value,
                                selectedColor?.colorName
                              );
                            }}
                            // onOpenChange={(open) => {
                            //   if (!open && !variant.colorHex) {
                            //     handleVariantBlur(variant.id, 'color');
                            //   }
                            // }}
                          >
                            <SelectTrigger className="w-[180px]">
                              {variant.colorHex ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-4 w-4 rounded-full border border-gray-300"
                                    style={{
                                      backgroundColor: variant.colorHex.toLowerCase(),
                                    }}
                                  />
                                  <span>{variant.colorName}</span>
                                </div>
                              ) : (
                                <span>Chọn màu</span>
                              )}
                            </SelectTrigger>
                            <SelectContent className={'bg-white'}>
                              <SelectGroup>
                                <SelectLabel>Màu sắc</SelectLabel>
                                {availableColors.map((color) => (
                                  <SelectItem
                                    key={color.colorHex}
                                    value={color.colorHex}
                                    className={'hover:bg-gray-100'}
                                  >
                                    <p
                                      style={{
                                        backgroundColor: color.colorHex.toLowerCase(),
                                      }}
                                      title={color.colorName}
                                      className="h-4 w-4 rounded-full border border-gray-300"
                                    ></p>
                                    <span>{color.colorName}</span>
                                    <span className="text-gray-400 text-xs">
                                      ({color.colorHex})
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* kích thước */}
                      <div className="mb-4">
                        <table className="min-w-full text-left text-gray-500">
                          <thead className="bg-gray-100 text-xs uppercase">
                            <tr>
                              <th className="py-3 px-4 w-8 text-right"></th>
                              <th className="py-3 px-4 text-center">Tên kích thước</th>
                              <th className="py-3 px-4 text-center">Số lượng</th>
                            </tr>
                          </thead>
                          <tbody className="text-black">
                            {allSizes.map((sizeName, sizeIndex) => {
                              const existingSize = variant.sizes.find(
                                (s) => s.name === sizeName
                              );
                              const sizeDb = variantDb?.sizes.find(
                                (s) => s.name === sizeName
                              );
                              return (
                                <tr key={sizeName} className="border-b border-gray-300">
                                  {/* checkbox */}
                                  <td className="py-2 px-4 text-right">
                                    {existingSize && sizeDb ? (
                                      <AlertDialogDemo
                                        action={'check'}
                                        sizeName={sizeName}
                                        cb={handleUncheckOldSize}
                                        id={variant._id}
                                      />
                                    ) : (
                                      <Checkbox
                                        checked={!!existingSize}
                                        onCheckedChange={(checked) =>
                                          handleSizeToggle(variant._id, sizeName, checked)
                                        }
                                        className="w-4 h-4 inline"
                                      />
                                    )}
                                  </td>
                                  <td className="py-2 px-4 text-center relative">
                                    <label className="font-semibold">{sizeName}</label>
                                    {existingSize && !sizeDb && (
                                      <div
                                        className="flex p-1 rounded-xl justify-center items-center 
                                bg-green-100 text-green-600
                                  text-sm font-mono
                                  absolute right-0 top-0 translate-y-[40%] translate-x-[-40%]"
                                      >
                                        <Sparkles className="h-4 w-4 mr-1 " />
                                        <p>Mới</p>
                                      </div>
                                    )}
                                    {sizeDb && (
                                      <div
                                        className={`flex p-1 justify-center items-center rounded-xl 
                                bg-amber-100 text-amber-600
                                  text-sm font-mono min-w-[51px]
                                  absolute right-0 top-0 translate-y-[40%] translate-x-[-40%]
                                  ${existingSize ? 'opacity-100' : 'opacity-50'}`}
                                      >
                                        <History className="h-4 w-4 mr-1 " />
                                        <p>Cũ</p>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 px-4 text-center">
                                    <Input
                                      disabled={!existingSize}
                                      type={'number'}
                                      min="0"
                                      value={
                                        existingSize ? existingSize.countInStock : ''
                                      }
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          variant._id,
                                          sizeName,
                                          e.target.value
                                        )
                                      }
                                      className="w-20 h-8 outline-0 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Right - hình ảnh */}
                    <div>
                      <label className="block font-semibold mb-4">
                        Hình ảnh * ({variant.images.length}/5)
                      </label>
                      <div>
                        <div className="flex items-center gap-4 mb-5">
                          <label className="block font-medium ">Thêm hình ảnh:</label>
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              handleAddImage(variant._id, e);
                            }}
                            className="w-20 text-center px-3"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:max-h-[392px] md:max-h-[284px]">
                          {variant.images.length > 0 ? (
                            variant.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative">
                                <img
                                  src={image.url}
                                  alt={`Variant ${variantIndex + 1} - ${imgIndex + 1}`}
                                  className="w-full h-[134px] sm:h-[188px] md:h-[134px] object-cover rounded-xl"
                                />
                                {image.publicId ? (
                                  <AlertDialogDemo
                                    action={'deleteImageVariant'}
                                    image={image}
                                    cb={handleRemoveImage}
                                    id={variant._id}
                                    index={imgIndex}
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveImage(variant._id, imgIndex)
                                    }
                                    className="bg-black p-1 rounded-full absolute -top-1 -right-1
                    hover:opacity-80 active:opacity-100"
                                  >
                                    <XIcon className="text-white h-4 w-4" />
                                  </button>
                                )}
                                {!image?.publicId ? (
                                  <div
                                    className="flex p-1 rounded-xl justify-center items-center
                                bg-green-100 text-green-600
                              text-sm font-mono
                              absolute -top-1"
                                  >
                                    <Sparkles className="h-4 w-4 mr-1 " />
                                    <p>Mới</p>
                                  </div>
                                ) : (
                                  <div
                                    className="flex p-1 rounded-xl justify-center items-center
                                bg-amber-100 text-amber-600
                              text-sm font-mono min-w-[51px]
                              absolute -top-1"
                                  >
                                    <History className="h-4 w-4 mr-1 " />
                                    <p>Cũ</p>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div
                              className="col-span-3 min-h-[152px] md:min-h-[274px] text-center
                      text-gray-400 border-2 border-dashed rounded-xl
                      relative"
                            >
                              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                                Chưa có ảnh nào
                              </span>
                              <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  handleAddImage(variant._id, e);
                                }}
                                className="w-full h-full opacity-0 text-center px-3 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* button delete */}

                    {variant?.isNew ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant._id)}
                        className="absolute -top-1.5 -right-1.5 p-4 bg-red-500 rounded-xl cursor-pointer
            hover:bg-red-400 active:bg-red-500"
                        title="Xoá biến thể"
                      >
                        <Trash2 className="text-white" />
                      </button>
                    ) : (
                      <AlertDialogDemo
                        action={'removeVariant'}
                        cb={handleRemoveVariant}
                        id={variant._id}
                        colorName={variant.colorName}
                      />
                    )}

                    {variant?.isNew ? (
                      <div
                        className="absolute -top-1.5 right-25 py-2 px-3 font-stretch-50%
                bg-green-200 text-green-600
                rounded-xl flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Mới
                      </div>
                    ) : (
                      <div
                        className="absolute -top-1.5 right-25 py-2 px-3 font-stretch-50%
                bg-amber-200 text-amber-600
                rounded-xl flex items-center"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Đã có
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* back & submit */}
            <div className="flex flex-col gap-3 fixed bottom-7 right-5 z-10">
              <Button
                type="submit"
                variant={'outline'}
                //   className="flex py-3 px-4 rounded-xl bg-green-400 text-shadow-md font-semibold text-white
                // hover:opacity-90 active:opacity-100"
                className="flex gap-3 items-center justify-start
          border border-green-500 rounded-md bg-white 
          underline text-green-600 py-2 px-3 text-sm 
          hover:text-green-500 active:text-green-600"
              >
                <Save className="mr-2" />
                Lưu sản phẩm
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
      </div>
    </>
  );
};

export default EditProdcutPage;
