import axiosInstance from '@/lib/axios';
import { createAsyncThunk, createSlice, isRejectedWithValue } from '@reduxjs/toolkit';

// Async thunk to fetch all orders admin
export const fetchAllCategoriesAdmin = createAsyncThunk(
  'admin/categories/fetchAllCategoriesAdmin',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, status, search, sort = 'newest' } = filters;

      const query = new URLSearchParams();

      if (page) query.append('page', page);
      if (limit) query.append('limit', limit);
      if (status) query.append('status', status);
      if (search) query.append('search', search);
      if (sort) query.append('sort', sort);

      const response = await axiosInstance.get(
        `/api/admin/categories?${query.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Lỗi fetchAllCategoriesAdmin'
      );
    }
  }
);

//
export const fetchCategoryDetailsThunk = createAsyncThunk(
  'admin/categories/fetchCategoryDetailsThunk',
  async ({ categoryId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/admin/categories/${categoryId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Lỗi fetchCategoryDetailsThunk'
      );
    }
  }
);

export const createCategoryThunk = createAsyncThunk(
  'admin/categories/createCategoryThunk',
  async ({ data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.image.imageSizeMen?.file) {
        formData.append('imageSizeMen', data.image.imageSizeMen.file);
      }
      if (data.image.imageSizeWomen?.file) {
        formData.append('imageSizeWomen', data.image.imageSizeWomen.file);
      }

      const response = await axiosInstance.post(`/api/admin/categories/`, formData, {
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi createCategoryThunk');
    }
  }
);

export const editCategoryThunk = createAsyncThunk(
  'admin/categories/editCategoryThunk',
  async ({ categoryId, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.image.imageSizeMen?.file) {
        formData.append('imageSizeMen', data.image.imageSizeMen.file);
      }
      if (data.image.imageSizeWomen?.file) {
        formData.append('imageSizeWomen', data.image.imageSizeWomen.file);
      }

      const response = await axiosInstance.put(
        `/api/admin/categories/${categoryId}/edit`,
        formData,
        {
          timeout: 60000,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi editCategoryThunk');
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  'admin/categories/deleteCategoryThunk',
  async ({ categoryId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/api/admin/categories/${categoryId}/delete`,
        {
          timeout: 60000,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi deleteCategoryThunk');
    }
  }
);

export const toggleActiveCategoryThunk = createAsyncThunk(
  'admin/collections/toggleActiveCategoryThunk',
  async ({ categoryId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/categories/${categoryId}/toggle-active`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data?.message || 'Lỗi toggleActiveCategoryThunk'
      );
    }
  }
);

// Slice
const adminCategories = createSlice({
  name: 'adminCategories',
  initialState: {
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    pagination: {
      totalCategories: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
    filters: {
      status: '',
      search: '',
      sort: 'newest',
    },
  },
  reducers: {
    setAdminFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearAdminFilters: (state) => {
      state.filters = {
        status: '',
        sort: 'newest',
      };
      state.pagination.currentPage = 1;
    },
    clearselectedCategory: (state) => {
      state.selectedCategory = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload.pagination };
    },
  },
  extraReducers: (builder) => {
    builder
      //==========fetchAllCategoriesAdmin==========
      .addCase(fetchAllCategoriesAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchAllCategoriesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = {
          ...state.pagination,
          totalCategories: action.payload.pagination.totalCategories,
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          limit: action.payload.pagination.limit,
        };
      })
      .addCase(fetchAllCategoriesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========fetchCategoryDetailsThunk==========
      .addCase(fetchCategoryDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchCategoryDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.category;
      })
      .addCase(fetchCategoryDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========editCategoryThunk==========
      .addCase(editCategoryThunk.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(editCategoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.category;
      })
      .addCase(editCategoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========fetchAllCategoriesAdmin==========
      .addCase(createCategoryThunk.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCategoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========deleteCategoryThunk==========
      .addCase(deleteCategoryThunk.pending, (state) => {
        state.activeLoading = true;
        state.activeError = false;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.activeLoading = false;
        const deletedId = action.payload.category._id;
        state.categories = state.categories.filter((c) => c._id !== deletedId);
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.activeLoading = false;
        state.activeError = action.payload;
      })

      //==========toggleActiveCategoryThunk==========
      .addCase(toggleActiveCategoryThunk.pending, (state) => {
        state.activeLoading = true;
        state.activeError = false;
      })
      .addCase(toggleActiveCategoryThunk.fulfilled, (state, action) => {
        state.activeLoading = false;
        const categoryIndex = state.categories.findIndex(
          (c) => c._id === action.payload.category._id
        );
        if (categoryIndex > -1) {
          state.categories[categoryIndex].isActive = action.payload.category.isActive;
        }
      })
      .addCase(toggleActiveCategoryThunk.rejected, (state, action) => {
        state.activeLoading = false;
        state.activeError = action.payload;
      });
  },
});

export const {
  setAdminFilters,
  clearAdminFilters,
  clearselectedCategory,
  setPagination,
} = adminCategories.actions;
export default adminCategories.reducer;
