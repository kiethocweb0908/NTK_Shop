import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

// Async Thunk to Fetch Admin Products
export const fetchAdminProducts = createAsyncThunk(
  'adminProducts/fetchAdminProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const {
        status,
        category,
        productCollection,
        gender,
        hasDiscount,
        featured,
        page = 1,
        limit = 15,
        search,
        sort = 'newest',
      } = filters;

      const query = new URLSearchParams();

      if (status) query.append('status', status);
      if (category) query.append('category', category);
      if (productCollection) query.append('productCollection', productCollection);
      if (gender) query.append('gender', gender);
      if (search) query.append('search', search);
      if (hasDiscount) query.append('hasDiscount', hasDiscount);
      if (featured) query.append('featured', featured);
      if (sort) query.append('sort', sort);
      if (page) query.append('page', page);
      if (limit) query.append('limit', limit);

      const response = await axiosInstance.get(`/api/admin/products?${query.toString()}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk to Upload Images với Progress Tracking
export const uploadProductImages = createAsyncThunk(
  'adminProducts/uploadImages',
  async ({ images, variantId, colorName }, { rejectWithValue, dispatch }) => {
    try {
      if (!images || images.length === 0) {
        throw new Error('Không có ảnh để upload');
      }

      // Log bắt đầu upload
      dispatch(
        addUploadLog({
          message: `📤 Nhận ${images.length} ảnh để upload cho màu "${colorName}"`,
          type: 'info',
        })
      );

      const formData = new FormData();
      images.forEach((file, index) => {
        formData.append('images', file);
        // Log từng file
        dispatch(
          addUploadLog({
            message: `   📄 Ảnh ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
            type: 'info',
          })
        );
      });

      // Tính timeout: 30 giây mỗi ảnh, tối đa 5 phút
      const estimatedTime = Math.min(images.length * 30000, 300000);

      const response = await axiosInstance.post('/api/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: estimatedTime,
      });

      if (response.data.success) {
        // Log kết quả
        const uploadedCount = response.data.images?.length || 0;
        dispatch(
          addUploadLog({
            message: `✅ Upload thành công ${uploadedCount}/${images.length} ảnh cho màu "${colorName}"`,
            type: 'success',
          })
        );
        return {
          variantId,
          colorName: colorName || 'Unknown',
          images: response.data.images,
          uploadedCount: response.data.images?.length || 0,
        };
      }

      throw new Error(response.data.message || 'Upload thất bại');
    } catch (error) {
      console.error('Upload error:', error);

      // Log lỗi
      dispatch(
        addUploadLog({
          message: `❌ Lỗi upload cho màu "${colorName}": ${error.message}`,
          type: 'error',
        })
      );

      return rejectWithValue({
        variantId,
        colorName: colorName || 'Unknown',
        message: error.response?.data?.message || error.message,
      });
    }
  }
);

// Async Thunk to Create Product
export const createProduct = createAsyncThunk(
  'adminProducts/createProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(
        addUploadLog({
          message: '📝 Đang tạo sản phẩm trong database...',
          type: 'info',
        })
      );

      const response = await axiosInstance.post('/api/admin/products', productData, {
        timeout: 30000, // 1 phút
      });

      console.log('✅ SERVER RESPONSE:', response.data);

      if (response.data.success) {
        dispatch(
          addUploadLog({
            message: '✅ Đã tạo sản phẩm thành công trong database',
            type: 'success',
          })
        );
        // Refresh product list sau khi tạo thành công
        setTimeout(() => {
          dispatch(fetchAdminProducts({}));
        }, 2000);

        return response.data;
      }

      throw new Error(response.data.message || 'Tạo sản phẩm thất bại');
    } catch (error) {
      console.error('Create product error:', error);
      dispatch(
        addUploadLog({
          message: `❌ Lỗi tạo sản phẩm: ${error.message}`,
          type: 'error',
        })
      );
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue(
          'Server mất quá nhiều thời gian để xử lý. Vui lòng thử lại'
        );
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async Thunk to Create Product with Images (Main Flow)
export const createProductWithImages = createAsyncThunk(
  'adminProducts/createProductWithImages',
  async (productFormData, { rejectWithValue, dispatch }) => {
    try {
      const { productData, variants } = productFormData;

      // Log bắt đầu
      dispatch(
        addUploadLog({
          message: '🚀 Bắt đầu tạo sản phẩm mới',
          type: 'info',
        })
      );
      dispatch(
        addUploadLog({
          message: `📝 Tên sản phẩm: ${productData.name}`,
          type: 'info',
        })
      );

      console.log('🔍 DEBUG - ProductFormData variants:', variants);

      // A. VALIDATE TRƯỚC
      const totalImages = variants.reduce((sum, v) => sum + (v.images?.length || 0), 0);
      dispatch(
        addUploadLog({
          message: `📊 Tổng số ảnh cần upload: ${totalImages}`,
          type: 'info',
        })
      );

      if (totalImages > 60) {
        dispatch(
          addUploadLog({
            message: `❌ Tối đa 60 ảnh (hiện có: ${totalImages})`,
            type: 'error',
          })
        );
        throw new Error(`Tối đa 60 ảnh (hiện có: ${totalImages})`);
      }

      if (variants.length > 6) {
        dispatch(
          addUploadLog({
            message: `❌ Tối đa 6 variants (hiện có: ${variants.length})`,
            type: 'error',
          })
        );
        throw new Error(`Tối đa 6 variants (hiện có: ${variants.length})`);
      }

      // B. UPLOAD ẢNH
      dispatch(
        addUploadLog({
          message: '🔄 Bắt đầu upload ảnh...',
          type: 'info',
        })
      );

      const uploadResults = [];

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        if (variant.images.length > 0) {
          dispatch(
            addUploadLog({
              message: `🎨 Đang upload ảnh cho màu "${variant.colorName}" (${variant.images.length} ảnh)`,
              type: 'uploading',
            })
          );

          try {
            const result = await dispatch(
              uploadProductImages({
                images: variant.images,
                variantId: variant.id,
                colorName: variant.colorName,
              })
            ).unwrap();

            uploadResults.push({
              ...result,
              success: true,
              originalSizes: variant.sizes,
            });

            dispatch(
              addUploadLog({
                message: `✅ Đã upload ${result.images?.length || 0} ảnh cho màu "${variant.colorName}"`,
                type: 'success',
              })
            );
          } catch (uploadError) {
            // Lỗi đã được log trong uploadProductImages
            uploadResults.push({
              variantId: variant.id,
              colorName: variant.colorName,
              success: false,
              error:
                uploadError.payload?.message || uploadError.message || 'Upload thất bại',
              originalSizes: variant.sizes,
            });
          }
        } else {
          uploadResults.push({
            variantId: variant.id,
            colorName: variant.colorName,
            images: [],
            success: true,
            uploadedCount: 0,
            originalSizes: variant.sizes,
          });
        }
      }

      // C. CHUẨN BỊ DATA - SỬA LẠI PHẦN NÀY
      const preparedVariants = variants
        .map((variant) => {
          const uploadResult = uploadResults.find((r) => r.variantId === variant.id);

          // Nếu upload thất bại, bỏ qua variant này
          if (!uploadResult?.success) {
            console.warn(`Bỏ qua variant ${variant.colorName}: upload thất bại`);
            return null;
          }

          // DEBUG: Log sizes structure
          console.log(`🔍 Preparing variant ${variant.colorName}:`, {
            variantSizes: variant.sizes,
            uploadResultSizes: uploadResult.originalSizes,
            sizesType: typeof variant.sizes,
            isArray: Array.isArray(variant.sizes),
            sizesLength: variant.sizes?.length,
          });

          // QUAN TRỌNG: Sizes đã được filtered từ AddProductPage
          // Không cần filter lại, chỉ cần dùng trực tiếp
          const validSizes = variant.sizes || uploadResult.originalSizes || [];

          console.log(`✅ Valid sizes for ${variant.colorName}:`, validSizes);

          return {
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            sizes: validSizes.map((size) => ({
              name: size.name,
              countInStock: parseInt(size.countInStock) || 0,
            })),
            images:
              uploadResult.images?.map((img, idx) => ({
                url: img.url || img.imageURL, // Dùng cả hai trường
                publicId: img.publicId,
                altText: img.altText || `${variant.colorName} - ${idx + 1}`,
              })) || [],
          };
        })
        .filter((v) => v !== null);

      // Kiểm tra còn variant nào không
      if (preparedVariants.length === 0) {
        const failedVariants = uploadResults.filter((r) => !r.success);
        const errorMessages = failedVariants
          .map((f) => `${f.colorName}: ${f.error}`)
          .join(', ');
        throw new Error(
          `Không có variant nào upload ảnh thành công. Lỗi: ${errorMessages}`
        );
      }

      // D. TẠO SẢN PHẨM
      console.log('📦 Đang tạo sản phẩm...');
      console.log('🔍 Prepared variants:', JSON.stringify(preparedVariants, null, 2));

      const finalProductData = {
        ...productData,
        price: parseFloat(productData.price),
        discountPrice: productData.discountPrice
          ? parseFloat(productData.discountPrice)
          : null,
        variants: preparedVariants,
        gender: productData.gender || 'Unisex',
        isPublished: true,
      };

      console.log('📤 Final data to send:', JSON.stringify(finalProductData, null, 2));

      const result = await dispatch(createProduct(finalProductData)).unwrap();

      // Thêm thống kê upload vào kết quả
      const successVariants = uploadResults.filter((r) => r.success).length;
      const totalUploadedImages = uploadResults.reduce(
        (sum, r) => sum + (r.uploadedCount || 0),
        0
      );

      return {
        ...result,
        uploadStats: {
          totalVariants: variants.length,
          successVariants,
          failedVariants: variants.length - successVariants,
          totalImages,
          uploadedImages: totalUploadedImages,
        },
      };
    } catch (error) {
      console.error('❌ Lỗi tạo sản phẩm:', error);
      dispatch(
        addUploadLog({
          message: `❌ Lỗi tạo sản phẩm: ${error.message}`,
          type: 'error',
        })
      );
      return rejectWithValue(error.message || 'Có lỗi xảy ra');
    }
  }
);

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState: {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    operationLoading: false, // Loading cho các operation (create, update, delete)
    operationError: null,
    uploadProgress: {}, // { variantId: progressPercentage }
    uploadLogs: [], // lưu log từng bước
    pagination: {
      totalPages: 1,
      currentPage: 1,
      total: 0,
      limit: 15,
    },
    filters: {
      status: '',
      category: '',
      productCollection: '',
      gender: '',
      hasDiscount: '',
      featured: '',
      search: '',
      sort: 'newest',
    },
  },
  reducers: {
    setAdminFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = action.payload.page || 1;
    },
    clearAdminFilters: (state) => {
      state.filters = {
        status: '',
        category: '',
        productCollection: '',
        gender: '',
        hasDiscount: '',
        featured: '',
        search: '',
        sort: 'newest',
      };
      state.pagination.currentPage = 1;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearOperationError: (state) => {
      state.operationError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateProductInList: (state, action) => {
      const updatedProduct = action.payload;
      const index = state.products.findIndex(
        (product) => product._id === updatedProduct._id
      );
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
    },
    setUploadProgress: (state, action) => {
      const { variantId, progress } = action.payload;
      state.uploadProgress[variantId] = progress;
    },
    clearUploadProgress: (state) => {
      state.uploadProgress = {};
    },
    resetOperationState: (state) => {
      state.operationLoading = false;
      state.operationError = null;
      state.uploadProgress = {};
    },
    addUploadLog: (state, action) => {
      const { message, type = 'info' } = action.payload;
      state.uploadLogs.push({
        id: Date.now() + Math.random(),
        message,
        type, // 'info', 'success', 'error', 'uploading'
        timestamp: new Date().toISOString(),
      });

      // Giới hạn số lượng logs (giữ 50 logs gần nhất)
      if (state.uploadLogs.length > 50) {
        state.uploadLogs = state.uploadLogs.slice(-50);
      }
    },

    clearUploadLogs: (state) => {
      state.uploadLogs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          ...state.pagination,
          totalPages: action.payload.pagination.totalPages,
          currentPage: action.payload.pagination.currentPage,
          total: action.payload.pagination.total,
          limit: action.payload.pagination.limit,
        };
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch products';
      })

      // ========== CREATE PRODUCT WITH IMAGES ==========
      .addCase(createProductWithImages.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.uploadProgress = {};
      })
      .addCase(createProductWithImages.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.uploadProgress = {};
      })
      .addCase(createProductWithImages.rejected, (state, action) => {
        state.operationLoading = false;
        state.uploadProgress = {};
        state.operationError = action.payload;
      })

      // ========== UPLOAD IMAGES PROGRESS ==========
      .addCase(uploadProductImages.pending, (state, action) => {
        const { variantId } = action.meta.arg;
        state.uploadProgress[variantId] = 0;
      })
      .addCase(uploadProductImages.fulfilled, (state, action) => {
        const { variantId } = action.meta.arg;
        state.uploadProgress[variantId] = 100;
      })
      .addCase(uploadProductImages.rejected, (state, action) => {
        const { variantId } = action.meta.arg;
        state.uploadProgress[variantId] = -1; // Mark as error
      });
  },
});

export const {
  setAdminFilters,
  clearAdminFilters,
  clearSelectedProduct,
  clearOperationError,
  clearError,
  setPagination,
  updateProductInList,
  setUploadProgress,
  clearUploadProgress,
  resetOperationState,
  addUploadLog, // ← THÊM
  clearUploadLogs, // ← THÊM
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;
