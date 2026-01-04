import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
// import { updateProduct } from '@/redux/slices/productsSlice';

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

// Async Thunk to Fetch Admin Product Details
export const fetchAdminProductDetails = createAsyncThunk(
  'adminProducts/fetchAdminProductDetails',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi fetchAdminProductDetails: ', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'fetch product details failed',
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
        timeout: 60000, // 1 phút
      });

      // console.log('✅ SERVER RESPONSE:', response.data);

      if (response.data.success) {
        dispatch(
          addUploadLog({
            message: '✅ Đã tạo sản phẩm thành công trong database',
            type: 'success',
          })
        );
        // Refresh product list sau khi tạo thành công
        // setTimeout(() => {
        //   dispatch(fetchAdminProducts({}));
        // }, 2000);

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

// Async Thunk to delete product
export const deleteProductThunk = createAsyncThunk(
  'adminProducts/deleteProduct',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi deleteProduct: ', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'delete product failed',
      });
    }
  }
);

// Async Thunk to toggle product published
export const toggleProductPublished = createAsyncThunk(
  'adminProducts/toggleProductPublished',
  async ({ _id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/products/isPublished`, {
        _id,
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi toggleProductPublished: ', error);
      return rejectWithValue(
        error.response?.data?.message || { message: 'Update failed' }
      );
    }
  }
);

// Asnyc Thunk to toggle product featured
export const toggleProductFeaturedThunk = createAsyncThunk(
  'adminProducts/toggleProductFeatured',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/products/${id}/isFeatured`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi toggleProductFeatured: ', error);
      return rejectWithValue(
        error.response?.data?.message || { message: 'Update failed' }
      );
    }
  }
);

// Async Thunk to update basic fields product
export const updateBasicFieldsThunk = createAsyncThunk(
  'adminProducts/updateBasicFieldsThunk',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/updateBasicFields`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi updateBasicFieldsThunk: ', error);
      return rejectWithValue(
        error.response?.data?.message || { message: 'Update failed' }
      );
    }
  }
);

// Async thunk to update countInStock for variant
export const updateCountInStockThunk = createAsyncThunk(
  'adminProducts/updateCountInStockThunk',
  async ({ productId, variantId, stocks }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/variants/${variantId}/countInStock`,
        { stocks }
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi updateCountInStockThunk: ', error);
      return rejectWithValue(
        error.response?.data?.message || { message: 'Update failed' }
      );
    }
  }
);

// Async thunk to add sizes for variant
export const addSizesThunk = createAsyncThunk(
  'adminProducts/addSizesThunk',
  async ({ productId, variantId, sizes }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/variants/${variantId}/addSizes`,
        { sizes }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'addSizesThunk failed',
      });
    }
  }
);

// Async thunk to delete sizes for variant
export const deleteSizesThunk = createAsyncThunk(
  'adminProducts/deleteSizesThunk',
  async ({ productId, variantId, sizes }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/variants/${variantId}/deleteSizes`,
        { sizes }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'deleteSizesThunk failed',
      });
    }
  }
);

// Async thun to update color
export const updateColorThunk = createAsyncThunk(
  'adminProducts/updateColorThunk',
  async ({ productId, variantId, colorName, colorHex }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/variants/${variantId}/updateColor`,
        { colorName, colorHex }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'updateColorThunk failed',
      });
    }
  }
);

// Async thunk to add images
export const addImagesThunk = createAsyncThunk(
  'adminProducts/addImagesThunk',
  async ({ productId, variantId, images }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/variants/${variantId}/addImages`,
        { images }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.data?.message ||
          error ||
          'addImagesThunk',
      });
    }
  }
);

// Async thunk to remove images
export const removeImagesThunk = createAsyncThunk(
  'adminProducts/removeImagesThunk',
  async ({ productId, variantId, publicIds }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/products/${productId}/variants/${variantId}/removeImages`,
        { publicIds }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          'removeImagesThunk failed'
      );
    }
  }
);

// Async thunk to add variants
export const addVariantsThunk = createAsyncThunk(
  'adminProducs/addVariantsThunk',
  async ({ productId, variant }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/admin/products/${productId}/variants`,
        { variant }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data || 'addVariantsThunk failed'
      );
    }
  }
);

// Async thunk to remove variants
export const removeVariantsThunk = createAsyncThunk(
  'adminProducts/removeVariantsThunk',
  async ({ productId, variantIds }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/api/admin/products/${productId}/variants`,
        { data: { variantIds } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          'removeVariantsThunk failed'
      );
    }
  }
);

//===============================================
//-------------------IMAGES----------------------
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

//===============================================
//-------------------PRODUCT&IMAGE---------------
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

      // console.log('🔍 DEBUG - ProductFormData variants:', variants);

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
              variantId: variant.id, // ← THÊM VÀO ĐÂY
              colorName: variant.colorName, // Có thể thêm luôn cho chắc
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

          console.log('variantId: ', uploadResults.variantId);
          console.log('variant.id: ', variant.id);
          console.log('uploadResul: ', uploadResult);

          // Nếu upload thất bại, bỏ qua variant này
          if (!uploadResult?.success) {
            console.warn(`Bỏ qua variant ${variant.colorName}: upload thất bại`);
            return null;
          }

          // DEBUG: Log sizes structure
          // console.log(`🔍 Preparing variant ${variant.colorName}:`, {
          //   variantSizes: variant.sizes,
          //   uploadResultSizes: uploadResult.originalSizes,
          //   sizesType: typeof variant.sizes,
          //   isArray: Array.isArray(variant.sizes),
          //   sizesLength: variant.sizes?.length,
          // });

          // QUAN TRỌNG: Sizes đã được filtered từ AddProductPage
          // Không cần filter lại, chỉ cần dùng trực tiếp

          const validSizes = variant.sizes || uploadResult.originalSizes || [];

          // console.log(`✅ Valid sizes for ${variant.colorName}:`, validSizes);

          return {
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            sizes: validSizes.map((size) => ({
              name: size.name,
              countInStock: parseInt(size.countInStock) || 0,
            })),
            images:
              uploadResult.images?.map((img, idx) => ({
                url: img.imageURL, // Dùng cả hai trường
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
      // console.log('📦 Đang tạo sản phẩm...');
      // console.log('🔍 Prepared variants:', JSON.stringify(preparedVariants, null, 2));

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

      // console.log('📤 Final data to send:', JSON.stringify(finalProductData, null, 2));

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

// Async Thunk to Update Full Fields Product (Thunk tổng)
export const editProduct = createAsyncThunk(
  'adminProducs/editProduct',
  async (
    {
      productId,
      basicField,
      updatedCountInStock,
      newSizes,
      deletedSizes,
      updatedColor,
      newImages,
      deletedImages,
      newVariants,
      deletedVariants,
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      let updatedProduct = null;

      // cập nhật các trường cơ bản
      if (basicField && Object.keys(basicField).length > 0) {
        dispatch({
          message: 'Đang tiếp hành cập nhật các trường cơ bản...',
          type: 'info',
        });
        try {
          const resultUpdateBasicField = await dispatch(
            updateBasicFieldsThunk({ productId, productData: basicField })
          ).unwrap();
          updatedProduct = resultUpdateBasicField;
        } catch (error) {
          return rejectWithValue(error);
        }
      }

      // cập nhật số lượng
      if (updatedCountInStock && updatedCountInStock.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành cập nhật số lượng...`,
            type: 'info',
          })
        );
        try {
          const results = await Promise.all(
            updatedCountInStock.map((v) =>
              dispatch(
                updateCountInStockThunk({
                  productId,
                  variantId: v.variantId,
                  stocks: v.sizes,
                })
              ).unwrap()
            )
          );
          updatedProduct = results[results.length - 1];
        } catch (error) {
          return rejectWithValue(error);
        }
      }

      // cập nhật màu sắc
      if (updatedColor && updatedColor.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành cập nhật màu sắc...`,
            type: 'info',
          })
        );
        try {
          const results = await Promise.all(
            updatedColor.map((v) =>
              dispatch(
                updateColorThunk({
                  productId,
                  variantId: v.variantId,
                  colorName: v.colorName,
                  colorHex: v.colorHex,
                })
              ).unwrap()
            )
          );
          updatedProduct = results[results.length - 1];
        } catch (error) {}
      }

      // xoá size của biến thể
      if (deletedSizes && deletedSizes.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành xoá size của biến thể...`,
            type: 'info',
          })
        );
        try {
          for (const v of deletedSizes) {
            const result = await dispatch(
              deleteSizesThunk({ productId, variantId: v.variantId, sizes: v.sizes })
            ).unwrap();
            updatedProduct = result;
          }
        } catch (error) {
          return rejectWithValue(error);
        }
      }

      // xoá ảnh của biến thể
      if (deletedImages && deletedImages.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành xoá ảnh của biến thể...`,
            type: 'info',
          })
        );

        try {
          for (const v of deletedImages) {
            const result = await dispatch(
              removeImagesThunk({
                productId,
                variantId: v.variantId,
                publicIds: v.publicIds,
              })
            );
            updatedProduct = result;
          }
        } catch (error) {
          return rejectWithValue(error);
        }
      }

      // xoá biến thể
      if (deletedVariants && deletedVariants.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành xoá biến thể...`,
            type: 'info',
          })
        );
        try {
          const result = await dispatch(
            removeVariantsThunk({ productId, variantIds: deletedVariants })
          ).unwrap();
          updatedProduct = result;
        } catch (error) {
          return rejectWithValue(error);
        }
      }

      // thêm size cho biến thể
      if (newSizes && newSizes.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành Thêm size cho biến thể...`,
            type: 'info',
          })
        );
        try {
          for (const v of newSizes) {
            const result = await dispatch(
              addSizesThunk({
                productId,
                variantId: v.variantId,
                sizes: v.sizes,
              })
            ).unwrap();
            updatedProduct = result;
          }
        } catch (error) {
          return rejectWithValue(error);
        }
      }

      // Thêm ảnh cho biến thể
      if (newImages && newImages.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành Thêm ảnh cho biến thể...`,
            type: 'info',
          })
        );

        for (const v of newImages) {
          if (v.images.length > 0) {
            dispatch(
              addUploadLog({
                message: `🎨 Đang upload ảnh cho màu "${v.colorName}" (${v.images.length} ảnh)`,
                type: 'uploading',
              })
            );

            try {
              const result = await dispatch(
                uploadProductImages({
                  images: v.images,
                  variantId: v.variantId,
                  colorName: v.colorName,
                })
              ).unwrap();

              if (result && result.images) {
                const updated = await dispatch(
                  addImagesThunk({
                    productId,
                    variantId: result.variantId,
                    images: result.images,
                  })
                ).unwrap();
                dispatch(
                  addUploadLog({
                    message: `Đã upload ${result.images?.length || 0} ảnh cho màu "${result.colorName || v.colorName}"`,
                    type: 'success',
                  })
                );
                updatedProduct = updated;
              }
            } catch (error) {
              console.error('Lỗi khi thêm ảnh cho biến thể: ', error);
              return rejectWithValue({
                message: error.message || error,
              });
            }
          }
        }
      }

      // thêm variant
      if (newVariants && newVariants.length > 0) {
        dispatch(
          addUploadLog({
            message: `Tiến hành Thêm biến thể mới...`,
            type: 'info',
          })
        );

        for (const v of newVariants) {
          if (v.images.length > 0) {
            dispatch(
              addUploadLog({
                message: `🎨 Đang upload ảnh cho màu "${v.colorName}" (${v.images.length} ảnh)`,
                type: 'uploading',
              })
            );

            try {
              const result = await dispatch(
                uploadProductImages({
                  images: v.images,
                  variantId: v._id,
                  colorName: v.colorName,
                })
              ).unwrap();

              if (result && result.images) {
                const imgs = result.images.map((img, index) => ({
                  publicId: img.publicId,
                  url: img.imageURL,
                  altText: `${result.colorName} - ${index + 1}`,
                  order: index,
                }));

                const variant = {
                  colorName: v.colorName,
                  colorHex: v.colorHex,
                  sizes: v.sizes,
                  images: imgs,
                };

                const createdVariant = await dispatch(
                  addVariantsThunk({ productId, variant })
                ).unwrap();
                updatedProduct = createdVariant;
              }
            } catch (error) {
              console.error('Lỗi khi thêm biến thể: ', error);
              return rejectWithValue({
                message: error.message || error,
              });
            }
          }
        }
      }

      return updatedProduct;
    } catch (error) {
      dispatch({
        message: 'Có lỗi trong quá trình cập nhật...',
        type: 'error',
      });
      return rejectWithValue(
        error.response?.data?.message || error?.message || 'Update failed'
      );
    }
  }
);

//============================================
//-------------------SLICE--------------------
const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState: {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    deleteLoading: false,
    deleteError: null,
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
      //========== fetchAdminProductDetails ==========
      .addCase(fetchAdminProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.product;
      })
      .addCase(fetchAdminProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Lỗi fetchAdminProductDetails';
      })

      // ========== deleteProductThunk ==========
      .addCase(deleteProductThunk.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const newProducts = state.products.filter(
          (p) => p._id !== action.payload.deletedProduct._id
        );
        state.products = newProducts;
      })
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || 'Failed to deleteProductThunk';
      })

      // ========== toggleProductPublished ==========
      .addCase(toggleProductPublished.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductPublished.fulfilled, (state, action) => {
        state.loading = false;

        // Lấy product đã update từ response
        const updatedProduct = action.payload.product;
        // Tìm index của product cần update
        const index = state.products.findIndex(
          (product) => product._id === updatedProduct._id
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      .addCase(toggleProductPublished.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to toggle products published';
      })

      // ========== toggleProductFeaturedThunk ==========
      .addCase(toggleProductFeaturedThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductFeaturedThunk.fulfilled, (state, action) => {
        state.loading = false;

        // Lấy product đã update từ response
        const updatedProduct = action.payload.product;
        // Tìm index của product cần update
        const index = state.products.findIndex(
          (product) => product._id === updatedProduct._id
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      .addCase(toggleProductFeaturedThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to toggle products featured';
      })

      // ========== updateBasicFieldsThunk ==========
      .addCase(updateBasicFieldsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBasicFieldsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.product;
        const productIndex = state.products.findIndex(
          (p) => p._id === updatedProduct._id
        );
        if (productIndex !== -1) {
          state.products[productIndex] = updatedProduct;
        }
      })
      .addCase(updateBasicFieldsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Lỗi';
      })

      // ========== updateCountInStockThunk ==========
      .addCase(updateCountInStockThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCountInStockThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex] = action.payload.variant;
          }
        }
      })
      .addCase(updateCountInStockThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi';
      })

      // ========== addSizesThunk ==========
      .addCase(addSizesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSizesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex].sizes =
              action.payload.variant.sizes;
          }
        }
      })
      .addCase(addSizesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi';
      })

      // ========== deleteSizesThunk ==========
      .addCase(deleteSizesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSizesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex].sizes =
              action.payload.variant.sizes;
          }
        }
      })
      .addCase(deleteSizesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi';
      })

      // ========== updateColorThunk ==========
      .addCase(updateColorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateColorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex].sizes =
              action.payload.variant.sizes;
          }
        }
      })
      .addCase(updateColorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi';
      })

      // ========== addImagesThunk ==========
      .addCase(addImagesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addImagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex].images =
              action.payload.variant.images;
          }
        }
      })
      .addCase(addImagesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Lỗi';
      })

      // ========== removeImagesThunk ==========
      .addCase(removeImagesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeImagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex].images =
              action.payload.variant.images;
          }
        }
      })
      .addCase(removeImagesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Lỗi';
      })

      // ========== addVariantsThunk ==========
      .addCase(addVariantsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVariantsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex > -1) {
          state.products[productIndex].variants = action.payload.product.variants;
        }
      })
      .addCase(addVariantsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Lỗi addVariantsThunk';
      })

      // ========== removeVariantsThunk ==========
      .addCase(removeVariantsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeVariantsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (productIndex > -1) {
          state.products[productIndex].variants = action.payload.product.variants;
        }
      })
      .addCase(removeVariantsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || 'Lỗi removeVariantsThunk';
      })

      // ========== eidtProduct ==========
      .addCase(editProduct.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.uploadProgress = {};
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.uploadProgress = {};
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.uploadProgress = {};
        state.operationError = action.payload;
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
