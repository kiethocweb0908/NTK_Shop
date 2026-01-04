import axiosInstance from '@/lib/axios';
import { createAsyncThunk, createSlice, isRejectedWithValue } from '@reduxjs/toolkit';

// Async thunk to fetch all orders admin
export const fetchAllUsersAdmin = createAsyncThunk(
  'admin/Orders/fetchAllUsersAdmin',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, role, search, sort = 'newest' } = filters;

      const query = new URLSearchParams();

      if (page) query.append('page', page);
      if (limit) query.append('limit', limit);
      if (role) query.append('role', role);
      if (search) query.append('search', search);
      if (sort) query.append('sort', sort);

      const response = await axiosInstance.get(`/api/admin/users?${query.toString()}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi fetchAllUsersAdmin');
    }
  }
);

// Slice
const adminUsers = createSlice({
  name: 'adminUsers',
  initialState: {
    users: [],
    selectedUsers: null,
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    pagination: {
      totalUsers: 0,
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
    clearSelectedUsers: (state) => {
      state.selectedUsers = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload.pagination };
    },
  },
  extraReducers: (builder) => {
    builder
      //==========fetchAllUsersAdmin==========
      .addCase(fetchAllUsersAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchAllUsersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = {
          ...state.pagination,
          totalUsers: action.payload.pagination.totalUsers,
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          limit: action.payload.pagination.limit,
        };
      })
      .addCase(fetchAllUsersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAdminFilters, clearAdminFilters, clearSelectedUsers, setPagination } =
  adminUsers.actions;
export default adminUsers.reducer;
