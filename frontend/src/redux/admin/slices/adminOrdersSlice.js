import axiosInstance from '@/lib/axios';
import { createAsyncThunk, createSlice, isRejectedWithValue } from '@reduxjs/toolkit';

// Async thunk to fetch all orders admin
export const fetchAllOrdersAdmin = createAsyncThunk(
  'admin/Orders/fetchAllOrdersAdmin',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        paymentMethod,
        time,
        search,
      } = filters;

      const query = new URLSearchParams();

      if (page) query.append('page', page);
      if (limit) query.append('limit', limit);
      if (status) query.append('status', status);
      if (paymentStatus) query.append('paymentStatus', paymentStatus);
      if (paymentMethod) query.append('paymentMethod', paymentMethod);
      if (time) query.append('time', time);
      if (search) query.append('search', search);

      const response = await axiosInstance.get(`/api/admin/orders?${query.toString()}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi fetchAllOrdersAdmin');
    }
  }
);

// Async thunk to fetch order details
export const fetchOrderDetailsAdmin = createAsyncThunk(
  'admin/orders/fetchOrderDetailsAdmin',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi updateOrderStatusThunk'
      );
    }
  }
);

// Async thunk to update order status admin
export const updateOrderStatusThunk = createAsyncThunk(
  'admin/Orders/updateOrderStatusThunk',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi updateOrderStatusThunk'
      );
    }
  }
);

// Slice
const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState: {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    pagination: {
      totalOrders: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
    filters: {
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      time: '',
      search: '',
      //   sort: 'newest',
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
        paymentStatus: '',
        paymentMethod: '',
        time: '',
        search: '',
      };
      state.pagination.currentPage = 1;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload.pagination };
    },
  },
  extraReducers: (builder) => {
    builder
      //==========fetchAllOrdersAdmin==========
      .addCase(fetchAllOrdersAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          ...state.pagination,
          totalOrders: action.payload.pagination.totalOrders,
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          limit: action.payload.pagination.limit,
        };
      })
      .addCase(fetchAllOrdersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========fetchOrderDetailsAdmin==========
      .addCase(fetchOrderDetailsAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchOrderDetailsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.order;
      })
      .addCase(fetchOrderDetailsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========updateOrderStatusThunk==========
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = false;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        const orderIndex = state.orders.findIndex(
          (o) => o._id === action.payload.updatedOrder._id
        );
        if (orderIndex > -1) {
          state.orders[orderIndex] = action.payload.updatedOrder;
        }
        if (state.selectedOrder) state.selectedOrder = action.payload.updatedOrder;
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { setAdminFilters, clearAdminFilters, clearSelectedOrder, setPagination } =
  adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
