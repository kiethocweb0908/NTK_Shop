import { createSlice, createAsyncThunk, isRejectedWithValue } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
// Async Thunk to Fetch Products by Collection and optional Filters
export const fetchProductsByFilters = createAsyncThunk(
  'products/fetchByFilters',
  async ({
    category,
    collection,
    color,
    size,
    gender,
    material,
    minPrice,
    maxPrice,
    sortBy,
    limit,
    page = 1,
    search,
  }) => {
    const query = new URLSearchParams();

    if (collection) query.append('productCollection', collection);
    if (size) query.append('sizes', size);
    if (color) query.append('colors', color);
    if (gender) query.append('gender', gender);
    if (minPrice) query.append('minPrice', minPrice);
    if (maxPrice) query.append('maxPrice', maxPrice);
    if (sortBy) query.append('sort', sortBy);
    if (search) query.append('search', search);
    if (category) query.append('category', category);
    if (material) query.append('material', material);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);

    const response = await axiosInstance.get(`/api/products?${query.toString()}`);
    return response.data;
  }
);

// Async thunk to fetch a single product by ID
export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async ({ id }) => {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  }
);

// Async thunk to fetch similar products
export const fetchSimilarProducts = createAsyncThunk(
  'products/fetchSimilarProducts',
  async ({ id }) => {
    const response = await axiosInstance.get(`/api/products/similar/${id}`);
    return response.data;
  }
);

// Async thunk to fetch products best seller
export const fetchProductBestSeller = createAsyncThunk(
  'products/fetchProductBestSeller',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/products/best-seller`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi fetchProductBestSeller: ', error);
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }) => {
    const response = await axiosInstance.put(`/api/products/${id}`, productData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      },
    });
    return response.data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    selectedProduct: null, // Store the details of the single product
    similarProducts: [],
    loading: false,
    error: null,
    pagination: {
      totalPages: 1,
      currentPage: 1,
      total: 0,
    },
    filters: {
      category: '',
      collection: '',
      size: '',
      color: '',
      gender: '',
      material: '',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        collection: '',
        size: '',
        color: '',
        gender: '',
        material: '',
        minPrice: '',
        maxPrice: '',
        sortBy: '',
        search: '',
      };
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.similarProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch products by filters
      .addCase(fetchProductsByFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          total: action.payload.total,
        };
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })

      // fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // similar product
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload;

        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index != -1) state.products[index] = updatedProduct;

        if (state.selectedProduct && state.selectedProduct === updatedProduct._id)
          state.selectedProduct = updatedProduct;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
