import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

// Async thun place order
export const placeOrderThunk = createAsyncThunk(
  'orders/placeOrderThunk',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/orders/', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'placeOrderThunk failed');
    }
  }
);

// Async thunk fecth my order
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async ({ limit = 5, page = 1 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (page) query.append('page', page);
      if (limit) query.append('limit', limit);
      const response = await axiosInstance.get(
        `/api/orders/user/my-orders?${query.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Lỗi lấy đơn hàng fetchMyOrders'
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi fetchOrderById');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    pagination: {
      totalPages: 1,
      currentPage: 1,
      total: 0,
      limit: 5,
    },
  },
  reducers: {
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload.pagination };
    },
    clearOrders: (state) => {
      state.orders = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //==========Place Order==========
      .addCase(placeOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload.createdOrder);
        state.selectedOrder = action.payload.createdOrder;
        state.error = null;
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========fetchMyOrders==========
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.myOrders;
        state.pagination = {
          ...state.pagination,
          totalPages: action.payload.pagination.totalPages,
          currentPage: action.payload.pagination.currentPage,
          total: action.payload.pagination.totalOrders,
          limit: action.payload.pagination.limit,
        };
        state.error = null;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========fetchOrderById==========
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.order;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders, clearSelectedOrder, setPagination } = orderSlice.actions;
export default orderSlice.reducer;
