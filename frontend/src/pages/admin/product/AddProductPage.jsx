import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  createProductWithImages,
  resetOperationState,
  clearUploadProgress,
} from '@/redux/admin/slices/adminProductsSlice';

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
// Components
import UploadProgressModal from './UploadProgressModal';
import axiosInstance from '@/lib/axios';

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, operationLoading, uploadProgress, operationError } = useSelector(
    (state) => state.admin.adminProducts
  );

  const fileInputRefs = useRef({});
  const generateVariantId = () =>
    `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  // state product
  const [productData, setProductData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    productCollection: '',
    gender: '',
  });
  // state variants (ban đầu 1)
  const [variants, setVariants] = useState([
    {
      id: generateVariantId(),
      colorName: '',
      colorHex: '',
      sizes: [
        { name: 'XS', countInStock: 0, selected: false },
        { name: 'S', countInStock: 0, selected: false },
        { name: 'M', countInStock: 0, selected: false },
        { name: 'L', countInStock: 0, selected: false },
        { name: 'XL', countInStock: 0, selected: false },
      ],
      images: [], // Array of File objects
      imagePreviews: [], // Array of preview URLs
    },
  ]);
  //state lỗi
  const [errors, setErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  // Danh sách màu đã được chọn
  const [selectedColors, setSelectedColors] = useState([]);
  // state để track field nào đã được touched
  const [touchedFields, setTouchedFields] = useState({});
  const [variantTouched, setVariantTouched] = useState({});
  const [fileDialogOpened, setFileDialogOpened] = useState({});
  // Ref để biết component đã mount chưa
  const isInitialMount = useRef(true);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axiosInstance.get(`/api/admin/collections`, {
          params: { status: 'published' },
        });
        setCollections(res.data.collections);
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    };
    fetchCollections();

    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(`/api/admin/categories`, {
          params: { status: 'isActive', limit: 50 },
        });
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    };
    fetchCategories();
  }, []);

  //  Hàm đánh dấu field đã được touched
  const markFieldAsTouched = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const markVariantFieldAsTouched = (variantId, field) => {
    setVariantTouched((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: true },
    }));
  };

  // Xử lý thay đổi product data
  const handleProductDataChange = (field, value) => {
    setProductData((prev) => ({ ...prev, [field]: value }));

    // Đánh dấu đã chạm vào field
    markFieldAsTouched(field);

    // Clear error khi người dùng nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Thêm variant mới
  const handleAddVariant = () => {
    if (variants.length >= 6)
      return toast.warning('Tối đa 6 biến thể màu sắc', { duration: 3000 });

    const newVariant = {
      id: generateVariantId(),
      colorName: '',
      colorHex: '',
      sizes: [
        { name: 'XS', countInStock: 0, selected: false },
        { name: 'S', countInStock: 0, selected: false },
        { name: 'M', countInStock: 0, selected: false },
        { name: 'L', countInStock: 0, selected: false },
        { name: 'XL', countInStock: 0, selected: false },
      ],
      images: [],
      imagePreviews: [],
    };

    setVariants((prev) => [...prev, newVariant]);
  };

  // Xoá variant
  const handleRemoveVariant = (variantId) => {
    if (variants.length <= 1)
      return toast.warning('Phải có ít nhất 1 biến thể màu sắc', { duration: 3000 });

    const variantToRemove = variants.find((v) => v.id === variantId);
    if (variantToRemove?.colorHex) {
      setSelectedColors((prev) =>
        prev.filter((color) => color !== variantToRemove.colorHex)
      );
    }

    if (variantErrors[variantId]) {
      setVariantErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[variantId];
        return newErrors;
      });
    }

    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  //Xử lý chọn màu sắc
  const handleColorChange = (variantId, colorHex, colorName) => {
    const variantIndex = variants.findIndex((v) => v.id === variantId);

    if (variantIndex === -1) return;

    const colorObj = colors.find((c) => c.colorHex === colorHex);

    // Kiểm tra màu đã được chọn chưa
    if (
      selectedColors.includes(colorHex) &&
      variants[variantIndex].colorHex !== colorHex
    ) {
      return toast.warning('Màu này đã được chọn trong biến thể khác', {
        duration: 3000,
      });
    }

    // Cập nhật selected colors
    const newSelectedColors = [...selectedColors];
    const oldColor = variants[variantIndex].colorHex;

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

    // Cập nhật variant
    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      colorName: colorName || '',
      colorHex: colorHex || '',
    };
    setVariants(updatedVariants);
    markVariantFieldAsTouched(variantId, 'colorHex');
    validateTouchedFields();

    // Xoá lỗi màu sắc nếu đã chọn màu
    if (colorHex && variantErrors[variantId]) {
      setVariantErrors((prev) => {
        const newErrors = { ...prev[variantId] };
        if (newErrors.color) {
          delete newErrors.color;
        }

        // Nếu không còn lỗi nào, xoá variant khỏi errors
        if (Object.keys(newErrors).length === 0) {
          const updatedErrors = { ...prev };
          delete updatedErrors[variantId];
          return updatedErrors;
        }

        return { ...prev, [variantId]: newErrors };
      });
    }
  };

  // Xử lý checkbox size
  const handleSizeToggle = (variantId, sizeName) => {
    const variantIndex = variants.findIndex((v) => v.id === variantId);
    if (variantIndex === -1) return;

    const updatedVariants = [...variants];
    const sizeIndex = updatedVariants[variantIndex].sizes.findIndex(
      (s) => s.name === sizeName
    );

    if (sizeIndex > -1) {
      const newSelectedState = !updatedVariants[variantIndex].sizes[sizeIndex].selected;

      console.log(`🔘 Toggle size ${sizeName}: ${newSelectedState}`);

      updatedVariants[variantIndex].sizes[sizeIndex].selected = newSelectedState;

      // Reset quantity khi bỏ chọn
      if (!newSelectedState) {
        updatedVariants[variantIndex].sizes[sizeIndex].countInStock = 0;
        console.log(`   Reset stock to 0`);
      } else {
        // Khi chọn, đặt mặc định là 1 nếu chưa có
        if (updatedVariants[variantIndex].sizes[sizeIndex].countInStock === 0) {
          updatedVariants[variantIndex].sizes[sizeIndex].countInStock = 1;
          console.log(`   Set default stock to 1`);
        }
      }

      setVariants(updatedVariants);
      markVariantFieldAsTouched(variantId, 'size');
      validateTouchedFields();

      // Kiểm tra và xoá lỗi size nếu đã chọn size
      const hasSelectedSize = updatedVariants[variantIndex].sizes.some(
        (size) => size.selected && size.countInStock > 0
      );

      if (hasSelectedSize && variantErrors[variantId]?.size) {
        setVariantErrors((prev) => {
          const newErrors = { ...prev[variantId] };
          delete newErrors.size;

          if (Object.keys(newErrors).length === 0) {
            const updatedErrors = { ...prev };
            delete updatedErrors[variantId];
            return updatedErrors;
          }

          return { ...prev, [variantId]: newErrors };
        });
      }
    }
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (variantId, sizeName, quantity) => {
    const variantIndex = variants.findIndex((v) => v.id === variantId);
    if (variantIndex === -1) return;

    let qty = quantity;
    if (quantity.startsWith('0') && quantity.length > 1) {
      qty = quantity.replace(/^0+/, '');
    }

    qty = parseInt(quantity) || 0;

    console.log(`📦 Change quantity for ${sizeName}: ${qty}`);

    if (qty < 0) return toast.warning('Số lượng phải > 0', { duration: 3000 }); // Không cho nhập số âm

    const updatedVariants = [...variants];
    const sizeIndex = updatedVariants[variantIndex].sizes.findIndex(
      (s) => s.name === sizeName
    );

    if (sizeIndex > -1) {
      updatedVariants[variantIndex].sizes[sizeIndex].countInStock = qty;
      setVariants(updatedVariants);
      markVariantFieldAsTouched(variantId, 'size');

      // Kiểm tra và xoá lỗi size nếu quantity > 0
      const hasValidSize = updatedVariants[variantIndex].sizes.some(
        (size) => size.selected && size.countInStock > 0
      );

      if (hasValidSize && variantErrors[variantId]?.size) {
        setVariantErrors((prev) => {
          const newErrors = { ...prev[variantId] };
          delete newErrors.size;

          if (Object.keys(newErrors).length === 0) {
            const updatedErrors = { ...prev };
            delete updatedErrors[variantId];
            return updatedErrors;
          }

          return { ...prev, [variantId]: newErrors };
        });
      }
    }
  };

  // Xử lý chọn ảnh
  const handleImageUpload = (variantId, e) => {
    const variantIndex = variants.findIndex((v) => v.id === variantId);
    if (variantIndex === -1) return;

    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const updatedVariants = [...variants];
    const currentImages = updatedVariants[variantIndex].images || [];
    const currentPreviews = updatedVariants[variantIndex].imagePreviews || [];

    // THÊM: Kiểm tra và loại bỏ file trùng
    const isDuplicateFile = (file, existingFiles) => {
      return existingFiles.some(
        (existingFile) =>
          existingFile.name === file.name && existingFile.size === file.size
      );
    };

    const uniqueFiles = files.filter((file) => !isDuplicateFile(file, currentImages));

    // ✅ Nếu có file trùng, thông báo cho user
    const duplicateCount = files.length - uniqueFiles.length;
    if (duplicateCount > 0) {
      toast.warning(`Đã bỏ qua ${duplicateCount} ảnh trùng lặp`, {
        duration: 3000,
      });
    }

    // ✅ Nếu tất cả files đều trùng, không làm gì cả
    if (uniqueFiles.length === 0) {
      e.target.value = ''; // Reset input
      return;
    }

    // ✅ SỬA: Kiểm tra số lượng ảnh với uniqueFiles (không phải files)
    if (currentImages.length + uniqueFiles.length > 5) {
      e.target.value = ''; // Reset input
      return toast.warning('Tối đa 5 ảnh mỗi biến thể', { duration: 3000 });
    }

    // ✅ SỬA: Thêm ảnh mới (chỉ uniqueFiles)
    const newImages = [...currentImages, ...uniqueFiles];
    const newPreviews = [
      ...currentPreviews,
      ...uniqueFiles.map((file) => URL.createObjectURL(file)),
    ];

    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: newImages,
      imagePreviews: newPreviews,
    };

    setVariants(updatedVariants);
    markVariantFieldAsTouched(variantId, 'images');
    validateTouchedFields();

    // Xoá lỗi ảnh nếu đã có ít nhất 1 ảnh
    if (newImages.length > 0 && variantErrors[variantId]?.images) {
      setVariantErrors((prev) => {
        const newErrors = { ...prev[variantId] };
        delete newErrors.images;

        if (Object.keys(newErrors).length === 0) {
          const updatedErrors = { ...prev };
          delete updatedErrors[variantId];
          return updatedErrors;
        }

        return { ...prev, [variantId]: newErrors };
      });
    }

    // Reset input
    if (fileInputRefs.current[variantId]) {
      fileInputRefs.current[variantId].value = '';
    }
    e.target.value = '';
  };

  // Xử lý xoá ảnh
  const handleRemoveImage = (variantId, imageIndex) => {
    const variantIndex = variants.findIndex((v) => v.id === variantId);
    if (variantIndex === -1) return;

    const updatedVariants = [...variants];
    const variant = updatedVariants[variantIndex];

    // Revoke URL để tránh memory leak
    URL.revokeObjectURL(variant.imagePreviews[imageIndex]);

    variant.images.splice(imageIndex, 1);
    variant.imagePreviews.splice(imageIndex, 1);

    setVariants(updatedVariants);

    // THÊM sau khi xoá ảnh:
    if (variant.images.length === 0) {
      setVariantErrors((prev) => ({
        ...prev,
        [variantId]: {
          ...prev[variantId],
          images: 'Phải có ít nhất 1 ảnh',
        },
      }));
    }
  };

  //  Validate form
  const validateAllForm = () => {
    const newErrors = {};
    const newVariantErrors = {};

    // Validate product data - TẤT CẢ fields
    if (!productData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    const nameExists = products.find((p) => p.name === productData.name);
    if (nameExists) newErrors.name = 'Tên sản phẩm đã tồn tại';

    if (!productData.sku.trim()) newErrors.sku = 'SKU là bắt buộc';
    const skuExists = products.find((p) => p.sku === productData.sku);
    if (skuExists) newErrors.sku = 'SKU sản phẩm đã tồn tại';

    if (!productData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';

    if (!productData.price || parseFloat(productData.price) <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (productData.discountPrice) {
      const price = parseFloat(productData.price) || 0;
      const discountPrice = parseFloat(productData.discountPrice) || 0;
      if (discountPrice > price) {
        newErrors.discountPrice = 'Giá khuyến mãi không được lớn hơn giá gốc';
      }
      if (discountPrice < 0) {
        newErrors.discountPrice = 'Giá không được âm';
      }
    }

    if (!productData.category) newErrors.category = 'Danh mục là bắt buộc';

    if (!productData.gender) newErrors.gender = 'Giới tính là bắt buộc';

    // Validate variants - TẤT CẢ variants
    variants.forEach((variant) => {
      const variantError = {};

      if (!variant.colorName || !variant.colorHex) {
        variantError.color = 'Chưa chọn màu sắc';
      }

      const hasSelectedSize = variant.sizes.some(
        (size) => size.selected && size.countInStock > 0
      );
      if (!hasSelectedSize) {
        variantError.size = 'Phải có ít nhất 1 size được chọn với số lượng > 0';
      }

      if (variant.images.length === 0) {
        variantError.images = 'Phải có ít nhất 1 ảnh';
      }

      if (Object.keys(variantError).length > 0) {
        newVariantErrors[variant.id] = variantError;
      }
    });

    setErrors(newErrors);
    setVariantErrors(newVariantErrors);

    return (
      Object.keys(newErrors).length === 0 && Object.keys(newVariantErrors).length === 0
    );
  };

  // validate chỉ touched fields (dùng real-time)
  const validateTouchedFields = () => {
    const newErrors = {};
    const newVariantErrors = {};

    // Validate product data - CHỈ touched fields
    if (touchedFields.name) {
      if (!productData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
      const nameExists = products.find((p) => p.name === productData.name);
      if (nameExists) newErrors.name = 'Tên sản phẩm đã tồn tại';
    }

    if (touchedFields.sku) {
      if (!productData.sku.trim()) newErrors.sku = 'SKU là bắt buộc';
      const skuExists = products.find((p) => p.sku === productData.sku);
      if (skuExists) newErrors.sku = 'SKU sản phẩm đã tồn tại';
    }

    if (touchedFields.description && !productData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (touchedFields.price) {
      if (!productData.price || parseFloat(productData.price) <= 0) {
        newErrors.price = 'Giá phải lớn hơn 0';
      }
    }

    if (touchedFields.discountPrice && productData.discountPrice) {
      const price = parseFloat(productData.price) || 0;
      const discountPrice = parseFloat(productData.discountPrice) || 0;
      if (discountPrice > price) {
        newErrors.discountPrice = 'Giá khuyến mãi không được lớn hơn giá gốc';
      }
      if (discountPrice < 0) {
        newErrors.discountPrice = 'Giá không được âm';
      }
    }

    if (touchedFields.category && !productData.category) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    if (touchedFields.gender && !productData.gender) {
      newErrors.gender = 'Giới tính là bắt buộc';
    }

    // Validate variants - CHỈ touched fields
    variants.forEach((variant) => {
      const variantError = {};

      if (variantTouched[variant.id]?.color) {
        if (!variant.colorName || !variant.colorHex) {
          variantError.color = 'Chưa chọn màu sắc';
        }
      }

      if (variantTouched[variant.id]?.size) {
        const hasSelectedSize = variant.sizes.some(
          (size) => size.selected && size.countInStock > 0
        );
        if (!hasSelectedSize) {
          variantError.size = 'Phải có ít nhất 1 size được chọn với số lượng > 0';
        }
      }

      if (variantTouched[variant.id]?.images) {
        if (variant.images.length === 0) {
          variantError.images = 'Phải có ít nhất 1 ảnh';
        }
      }

      if (Object.keys(variantError).length > 0) {
        newVariantErrors[variant.id] = variantError;
      }
    });

    setErrors(newErrors);
    setVariantErrors(newVariantErrors);
  };

  // Xử lý onBlur cho các input
  const handleInputBlur = (field) => {
    markFieldAsTouched(field);
    validateTouchedFields();
  };

  const handleVariantBlur = (variantId, field) => {
    markVariantFieldAsTouched(variantId, field);
    validateTouchedFields();
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      validateTouchedFields();
    }
  }, [productData, variants, touchedFields, variantTouched]);

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllForm()) {
      // Đánh dấu TẤT CẢ fields đã touched để hiển thị lỗi
      const allFields = ['name', 'sku', 'description', 'price', 'category', 'gender'];
      allFields.forEach((field) => markFieldAsTouched(field));

      // Đánh dấu TẤT CẢ variant fields đã touched
      variants.forEach((variant) => {
        ['color', 'size', 'images'].forEach((field) => {
          markVariantFieldAsTouched(variant.id, field);
        });
      });

      toast.error('Vui lòng kiểm tra lại thông tin', { duration: 3000 });
      return;
    }

    try {
      toast.loading('Đang xử lý...', { id: 'create-product' });

      // Chuẩn bị data để gửi lên Redux
      const productFormData = {
        productData: {
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price),
          discountPrice: productData.discountPrice
            ? parseFloat(productData.discountPrice)
            : null,
          sku: productData.sku.trim(),
          category: productData.category,
          productCollection: productData.productCollection,
          material: productData.material || 'cotton',
          gender: productData.gender || 'Unisex',
          // tags: productData.tags || [],
          // metaTitle: productData.metaTitle || '',
          // metaDescription: productData.metaDescription || '',
          // metaKeywords: productData.metaKeywords || '',
        },
        variants: variants.map((variant) => {
          // Lọc sizes hợp lệ
          const validSizes = variant.sizes
            .filter((size) => {
              const hasStock = parseInt(size.countInStock) > 0;
              const isSelected = size.selected;
              // console.log(
              //   `   Size ${size.name}: selected=${isSelected}, stock=${size.countInStock}, valid=${isSelected && hasStock}`
              // );
              return isSelected && hasStock;
            })
            .map((size) => ({
              name: size.name,
              countInStock: parseInt(size.countInStock),
            }));

          // console.log(`📦 Variant ${variant.colorName} valid sizes:`, validSizes);

          return {
            id: variant.id,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            sizes: validSizes, // ← Đây là sizes đã filtered
            images: variant.images,
          };
        }),
      };

      // Debug: Log số lượng ảnh
      const totalImages = productFormData.variants.reduce(
        (sum, v) => sum + (v.images?.length || 0),
        0
      );
      // console.log(`📊 Tổng số ảnh cần upload: ${totalImages}`);

      // Gọi Redux thunk để tạo sản phẩm
      const result = await dispatch(createProductWithImages(productFormData)).unwrap();

      // Xử lý kết quả thành công
      toast.dismiss('create-product');

      if (result.success) {
        // Hiển thị thông báo thành công với thông tin chi tiết
        const stats = result.uploadStats;
        let successMessage = '✅ Tạo sản phẩm thành công!';

        if (stats?.failedVariants > 0) {
          successMessage += ` (${stats.successVariants}/${stats.totalVariants} variants thành công)`;
          toast.warning(successMessage, { duration: 5000 });
        } else {
          toast.success(successMessage, { duration: 3000 });
        }

        // Reset form sau 1.5 giây
        setTimeout(() => {
          resetForm();
          navigate('/admin/products'); // Redirect về trang danh sách
        }, 1500);
      }
    } catch (error) {
      // Xử lý lỗi
      toast.dismiss('create-product');

      console.error('❌ Lỗi khi tạo sản phẩm:', error);

      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = error?.message || error || 'Có lỗi xảy ra khi tạo sản phẩm';
      toast.error(errorMessage, { duration: 5000 });

      // Nếu lỗi là timeout, gợi ý người dùng
      if (error.message?.includes('thời gian') || error.message?.includes('timeout')) {
        toast.warning(
          '⚠️ Upload mất nhiều thời gian. Thử với ít ảnh hơn hoặc ảnh nhỏ hơn',
          {
            duration: 6000,
          }
        );
      }
    }

    // Chuẩn bị data để gửi
    // const preparedVariants = variants.map((variant) => ({
    //   colorName: variant.colorName,
    //   colorHex: variant.colorHex,
    //   sizes: variant.sizes
    //     .filter((size) => size.selected && size.countInStock > 0)
    //     .map((size) => ({
    //       name: size.name,
    //       countInStock: size.countInStock,
    //     })),
    //   images: variant.imagePreviews.map((url, idx) => ({
    //     url: url, // Trong thực tế sẽ là URL từ Cloudinary
    //     altText: `${variant.colorName} - ${idx + 1}`,
    //     _id: `temp_${variant.id}_${idx}`, // Tạm thời
    //   })),
    // }));

    // const finalProductData = {
    //   ...productData,
    //   price: parseFloat(productData.price),
    //   discountPrice: productData.discountPrice
    //     ? parseFloat(productData.discountPrice)
    //     : null,
    //   variants: preparedVariants,
    // };

    // console.log('✅ Product data to submit:');
    // console.log(JSON.stringify(finalProductData, null, 2));

    // // In ra console với định dạng bạn yêu cầu
    // console.log('📦 Final product structure:');
    // console.log('product =', finalProductData);

    // // TODO: Gửi dữ liệu lên API
    // toast.success(
    //   'Dữ liệu đã được kiểm tra và in ra console. Kiểm tra Developer Tools!',
    //   { duration: 3000 }
    // );
  };

  // Hàm reset form sau khi tạo thành công
  const resetForm = () => {
    setProductData({
      name: '',
      sku: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      productCollection: '',
      material: '',
      gender: 'Unisex',
      tags: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    });

    setVariants([
      {
        id: generateVariantId(),
        colorName: '',
        colorHex: '',
        sizes: [
          { name: 'XS', countInStock: 0, selected: false },
          { name: 'S', countInStock: 0, selected: false },
          { name: 'M', countInStock: 0, selected: false },
          { name: 'L', countInStock: 0, selected: false },
          { name: 'XL', countInStock: 0, selected: false },
        ],
        images: [],
        imagePreviews: [],
      },
    ]);

    setSelectedColors([]);
    setErrors({});
    setVariantErrors({});
    setTouchedFields({});
    setVariantTouched({});

    // Cleanup image preview URLs
    variants.forEach((variant) => {
      variant.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    });
  };

  // ✅ Lấy danh sách màu có sẵn (chưa được chọn)
  const getAvailableColors = (currentVariantId) => {
    const currentVariant = variants.find((v) => v.id === currentVariantId);
    const currentColor = currentVariant?.colorHex;
    return colors.filter(
      (color) =>
        !selectedColors.includes(color.colorHex) || color.colorHex === currentColor
    );
  };

  // Clean up URLs khi component unmount
  useEffect(() => {
    return () => {
      variants.forEach((variant) => {
        variant.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      });
    };
  }, []);

  useEffect(() => {
    // Cleanup khi component unmount
    return () => {
      variants.forEach((variant) => {
        variant.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      });
      dispatch(resetOperationState());
      dispatch(clearUploadProgress());
    };
  }, [dispatch]);

  // Hiển thị lỗi từ Redux operationError
  useEffect(() => {
    if (operationError && !operationLoading) {
      toast.error(operationError, { duration: 5000 });
    }
  }, [operationError, operationLoading]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-semibold uppercase mb-6 pt-7 px-7">Thêm Sản Phẩm</h2>

      <UploadProgressModal />

      {/* form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6 p-7 shadow-md rounded-xl">
          {/* tên */}
          <div>
            <label className="block font-semibold mb-2">Tên sản phẩm *</label>
            <Input
              type="text"
              name="name"
              value={productData.name}
              onChange={(e) => handleProductDataChange('name', e.target.value)}
              onBlur={() => handleInputBlur('name')}
              placeholder="Hãy nhập tên sản phẩm..."
              className="w-full outline-0
              focus:ring-blue-500 focus:border-blue-500 mb-2"
            />
            {errors.name && (
              <span className="text-red-500 text-sm flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </span>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block font-semibold mb-2">SKU sản phẩm *</label>
            <Input
              type="text"
              name="SKU"
              value={productData.sku}
              onChange={(e) => handleProductDataChange('sku', e.target.value)}
              onBlur={() => handleInputBlur('sku')}
              placeholder="Hãy nhập SKU sản phẩm..."
              className="w-full outline-0
              focus:ring-blue-500 focus:border-blue-500 mb-2"
            />
            {errors.sku && (
              <span className="text-red-500 text-sm flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.sku}
              </span>
            )}
          </div>

          {/* Mô tả */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-2">Mô tả sản phẩm *</label>
            <Textarea
              name="description"
              value={productData.description}
              onChange={(e) => handleProductDataChange('description', e.target.value)}
              onBlur={() => handleInputBlur('description')}
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

          <div className="flex flex-col gap-6">
            {/* giá gốc */}
            <div className="mb-2">
              <div className="flex items-center justify-between gap-6 w-full">
                <label className="block font-semibold">Giá sản phẩm *</label>
                <Input
                  type="number"
                  name="price"
                  min="0"
                  value={productData.price}
                  onChange={(e) => handleProductDataChange('price', e.target.value)}
                  onBlur={() => handleInputBlur('price')}
                  placeholder="Hãy nhập giá sản phẩm..."
                  className="w-1/2 outline-0
              focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.price && (
                <span className="text-red-500 text-sm flex items-center mt-1 justify-end">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.price}
                </span>
              )}
            </div>

            {/* giảm giá */}
            <div className="mb-2">
              <div className="flex items-center justify-between gap-6 w-full">
                <label className="block font-semibold">Giá khuyến mãi </label>
                <Input
                  type="number"
                  name="discountPrice"
                  min="0"
                  value={productData.discountPrice}
                  onChange={(e) =>
                    handleProductDataChange('discountPrice', e.target.value)
                  }
                  placeholder="Hãy nhập giá sản phẩm..."
                  className="w-1/2 outline-0
              focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.discountPrice && (
                <span className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.discountPrice}
                </span>
              )}
            </div>

            {/* Màu sắc */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-3 mb-2">
                <label className="block font-semibold">Biến thể màu sắc: </label>
                <label className="font-semibold">({variants.length}/6)</label>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="py-2 px-3 flex items-center 
                font-semibold text-sm text-white text-shadow-md
                rounded-lg bg-green-400  cursor-pointer
                active:opacity-100 hover:opacity-80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Danh mục */}
            <div className="mb-2">
              <div className="flex items-center justify-between ">
                <label className="block font-semibold">Danh mục: *</label>
                <Select
                  value={productData.category}
                  onValueChange={(value) => handleProductDataChange('category', value)}
                  onOpenChange={(open) => {
                    if (!open && !productData.category) {
                      handleInputBlur('category');
                    }
                  }}
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
              {errors.category && (
                <span className="text-red-500 text-sm flex w-full justify-end items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </span>
              )}
            </div>

            {/* Giới tính */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-semibold">Giới tính: *</label>
                <Select
                  value={productData.gender}
                  onValueChange={(value) => handleProductDataChange('gender', value)}
                  onOpenChange={(open) => {
                    if (!open && !productData.gender) {
                      handleInputBlur('gender');
                    }
                  }}
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
              {errors.gender && (
                <span className="text-red-500 text-sm flex w-full justify-end items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.gender}
                </span>
              )}
            </div>

            {/* Bộ sưu tập */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-semibold">Bộ sưu tập: </label>
                <Select
                  value={productData.productCollection}
                  onValueChange={(value) =>
                    handleProductDataChange('productCollection', value)
                  }
                >
                  <SelectTrigger className="w-58">
                    <SelectValue placeholder="Hãy chọn bộ sưu tập" />
                  </SelectTrigger>
                  <SelectContent className={'bg-white'}>
                    <SelectGroup>
                      <SelectLabel>Bộ sưu tập</SelectLabel>
                      {collections.map((collection, index) => (
                        <SelectItem
                          key={index}
                          className={'hover:bg-gray-100'}
                          value={collection._id}
                        >
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <span className="block w-full text-red-500 text-end"></span>
            </div>
          </div>

          {/* Màu sắc mobile */}
          <div className="flex sm:hidden items-center justify-between mb-2">
            <label className="block font-semibold">Biến thể màu sắc: </label>
            <label className="font-semibold">({variants.length}/6)</label>
            <button
              type="button"
              onClick={handleAddVariant}
              className="py-2 px-3 flex items-center 
                font-semibold text-sm text-white text-shadow-md
                rounded-lg bg-green-400  cursor-pointer
                active:opacity-100 hover:opacity-80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm
            </button>
          </div>
        </div>

        {/* Các biến thể màu sắc được thêm vào */}
        {variants.map((variant, variantIndex) => {
          const availableColors = getAvailableColors(variant.id);
          const variantError = variantErrors[variant.id];

          return (
            <div
              key={variant.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-7 shadow-md rounded-xl relative border-t border-gray-100"
            >
              {/* Hiển thị lỗi của variant */}
              {variantError && Object.keys(variantError).length > 0 && (
                <div className="md:col-span-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  {Object.entries(variantError).map(([field, error]) => (
                    <div key={field} className="text-red-600 text-sm flex items-center">
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
                        const selectedColors = colors.find((c) => c.colorHex === value);
                        handleColorChange(variant.id, value, selectedColors?.colorName);
                      }}
                      onOpenChange={(open) => {
                        if (!open && !variant.colorHex) {
                          handleVariantBlur(variant.id, 'color');
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        {variant.colorHex ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: variant.colorHex.toLowerCase() }}
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
                                style={{ backgroundColor: color.colorHex.toLowerCase() }}
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
                      {variant.sizes.map((size, sizeIndex) => (
                        <tr key={size.name} className="border-b border-gray-300">
                          {/* checkbox */}
                          <td className="py-2 px-4 text-right">
                            <Checkbox
                              checked={size.selected}
                              onCheckedChange={() =>
                                handleSizeToggle(variant.id, size.name)
                              }
                              className="w-4 h-4 inline"
                            />
                          </td>
                          <td className="py-2 px-4 text-center">
                            <label className="font-semibold">{size.name}</label>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <Input
                              disabled={!size.selected}
                              type={'number'}
                              min="0"
                              value={size.countInStock}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (value.startsWith('0') && value.length > 1) {
                                  value = value.replace(/^0+/, '');
                                  e.target.value = value; // Cập nhật ngay trên input
                                }
                                handleQuantityChange(
                                  variant.id,
                                  size.name,
                                  e.target.value
                                );
                              }}
                              className="w-20 h-8 outline-0 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
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
                  <div className="flex items-center gap-4 mb-4">
                    <label className="block font-medium ">Thêm hình ảnh:</label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onClick={() => {
                        // Đánh dấu dialog đang mở
                        markVariantFieldAsTouched(variant.id, 'images');
                        setFileDialogOpened((prev) => ({ ...prev, [variant.id]: true }));
                      }}
                      onChange={(e) => {
                        handleImageUpload(variant.id, e);
                        // Đánh dấu dialog đã đóng
                        setFileDialogOpened((prev) => ({ ...prev, [variant.id]: false }));
                      }}
                      onBlur={() => {
                        // Nếu dialog đã mở nhưng không chọn file nào
                        if (fileDialogOpened[variant.id] && variant.images.length === 0) {
                          markVariantFieldAsTouched(variant.id, 'images');
                          validateTouchedFields();
                        }
                        setFileDialogOpened((prev) => ({ ...prev, [variant.id]: false }));
                      }}
                      ref={(el) => (fileInputRefs.current[variant.id] = el)}
                      disabled={variant.images.length >= 5}
                      className="w-20 text-center px-3"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2 sm:gap-4 sm:max-h-[392px] md:max-h-[284px] overflow-y-auto">
                    {variant.imagePreviews.length > 0 ? (
                      variant.imagePreviews.map((previewUrl, imgIndex) => (
                        <div key={imgIndex} className="relative">
                          <img
                            src={previewUrl}
                            alt={`Variant ${variantIndex + 1} - ${imgIndex + 1}`}
                            className="w-full h-[134px] sm:h-[188px] md:h-[134px] object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(variant.id, imgIndex)}
                            className="bg-black p-1 rounded-full absolute -top-1 -right-1
                    hover:opacity-80 active:opacity-100"
                          >
                            <XIcon className="text-white h-4 w-4" />
                          </button>
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
                          onClick={() => {
                            // Đánh dấu dialog đang mở
                            markVariantFieldAsTouched(variant.id, 'images');
                            setFileDialogOpened((prev) => ({
                              ...prev,
                              [variant.id]: true,
                            }));
                          }}
                          onChange={(e) => {
                            handleImageUpload(variant.id, e);
                            // Đánh dấu dialog đã đóng
                            setFileDialogOpened((prev) => ({
                              ...prev,
                              [variant.id]: false,
                            }));
                          }}
                          onBlur={() => {
                            // Nếu dialog đã mở nhưng không chọn file nào
                            if (
                              fileDialogOpened[variant.id] &&
                              variant.images.length === 0
                            ) {
                              markVariantFieldAsTouched(variant.id, 'images');
                              validateTouchedFields();
                            }
                            setFileDialogOpened((prev) => ({
                              ...prev,
                              [variant.id]: false,
                            }));
                          }}
                          ref={(el) => (fileInputRefs.current[variant.id] = el)}
                          disabled={variant.images.length >= 5}
                          className="w-full h-full opacity-0 text-center px-3 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* button delete */}
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(variant.id)}
                  className="absolute -top-1.5 -right-1.5 p-4 bg-red-500 rounded-xl cursor-pointer
            hover:bg-red-400 active:bg-red-500"
                  title="Xoá biến thể"
                >
                  <Trash2 className="text-white" />
                </button>
              )}
            </div>
          );
        })}

        {/* back & submit */}
        <div className="flex flex-col gap-3 fixed bottom-7 right-5 z-10">
          <Button
            type="submit"
            variant={'outline'}
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
  );
};

export default AddProductPage;
