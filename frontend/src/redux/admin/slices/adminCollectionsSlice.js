import axiosInstance from '@/lib/axios';
import { createAsyncThunk, createSlice, isRejectedWithValue } from '@reduxjs/toolkit';

// Async thunk to fetch all orders admin
export const fetchAllCollectionsAdmin = createAsyncThunk(
  'admin/collections/fetchAllCollectionsAdmin',
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
        `/api/admin/collections?${query.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Lỗi fetchAllCollectionsAdmin'
      );
    }
  }
);

export const fetchColelctionDetailsThunk = createAsyncThunk(
  'admin/collections/fetchColelctionDetailsThunk',
  async ({ collectionId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/admin/collections/${collectionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi fetchColelctionDetailsThunk'
      );
    }
  }
);

// Async thunk add
export const createCollectionThunk = createAsyncThunk(
  'admin/collections/createCollectionThunk',
  async ({ name, description, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('image', image);

      const response = await axiosInstance.post('/api/admin/collections', formData, {
        timeout: 60000,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi createCollectionThunk'
      );
    }
  }
);

// edit
export const editCollectionThunk = createAsyncThunk(
  'admin/collections/editCollectionThunk',
  async ({ collectionId, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.image?.file) {
        formData.append('image', data.image.file);
      }

      const response = await axiosInstance.put(
        `/api/admin/collections/${collectionId}/edit`,
        formData,
        {
          timeout: 60000,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data?.message || 'Lỗi editCollectionThunk');
    }
  }
);

// delete
export const deleteCollectionThunk = createAsyncThunk(
  'admin/collections/deleteCollectionThunk',
  async ({ collectionId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/api/admin/collections/${collectionId}/delete`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data?.message || 'Lỗi deleteCollectionThunk');
    }
  }
);

// Async thunk to toggle active
export const toggleActiveThunk = createAsyncThunk(
  'admin/collections/toggleActiveThunk',
  async ({ collectionId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/collections/${collectionId}/toggle-active`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data?.message || 'Lỗi toggleActiveThunk');
    }
  }
);

// Slice
const adminCollections = createSlice({
  name: 'adminCollections',
  initialState: {
    collections: [],
    selectedCollection: null,
    loading: false,
    error: null,
    activeLoading: false,
    activeError: null,
    updateLoading: false,
    updateError: null,
    pagination: {
      totalCollections: 0,
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
    clearSelectedCollection: (state) => {
      state.selectedCollection = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload.pagination };
    },
  },
  extraReducers: (builder) => {
    builder
      //==========fetchAllCollectionsAdmin==========
      .addCase(fetchAllCollectionsAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchAllCollectionsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.collections;
        state.pagination = {
          ...state.pagination,
          totalCollections: action.payload.pagination.totalCollections,
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          limit: action.payload.pagination.limit,
        };
      })
      .addCase(fetchAllCollectionsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========fetchColelctionDetailsThunk==========
      .addCase(fetchColelctionDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchColelctionDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCollection = action.payload.collection;
      })
      .addCase(fetchColelctionDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========createCollectionThunk==========
      .addCase(createCollectionThunk.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(createCollectionThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCollectionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========editCollectionThunk==========
      .addCase(editCollectionThunk.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(editCollectionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCollection = action.payload.collection;
      })
      .addCase(editCollectionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========deleteCollectionThunk==========
      .addCase(deleteCollectionThunk.pending, (state) => {
        state.activeLoading = true;
        state.activeError = false;
      })
      .addCase(deleteCollectionThunk.fulfilled, (state, action) => {
        state.activeLoading = false;
        const deletedId = action.payload.collection._id;

        state.collections = state.collections.filter((c) => c._id !== deletedId);
      })
      .addCase(deleteCollectionThunk.rejected, (state, action) => {
        state.activeLoading = false;
        state.activeError = action.payload;
      })

      //==========toggleActiveThunk==========
      .addCase(toggleActiveThunk.pending, (state) => {
        state.activeLoading = true;
        state.activeError = false;
      })
      .addCase(toggleActiveThunk.fulfilled, (state, action) => {
        state.activeLoading = false;
        const collectionIndex = state.collections.findIndex(
          (c) => c._id === action.payload.collection._id
        );
        if (collectionIndex > -1) {
          state.collections[collectionIndex].isActive =
            action.payload.collection.isActive;
        }
      })
      .addCase(toggleActiveThunk.rejected, (state, action) => {
        state.activeLoading = false;
        state.activeError = action.payload;
      });
  },
});

export const {
  setAdminFilters,
  clearAdminFilters,
  clearSelectedCollection,
  setPagination,
} = adminCollections.actions;
export default adminCollections.reducer;
