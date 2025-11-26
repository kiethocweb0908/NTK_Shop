import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

const initialState = {
  cart: { products: [], totalItems: 0, totalPrice: 0 },
  loading: false,
  error: null,
};

// Fetch cart for a user or guest
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/cart`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi fetchCart: ', error);
      return rejectWithValue(
        error.response.data?.message || { message: 'Failed to fetch cart' }
      );
    }
  }
);

// Add an item to the cart for a user or guest
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, color, size, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/cart`, {
        productId,
        color,
        size,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi addToCart: ', error);
      return rejectWithValue(error.response?.data || { message: 'Lỗi không xác định' });
    }
  }
);

// Update the quantity of an item in the cart
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, color, size, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/cart`, {
        productId,
        color,
        size,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi updateCartItemQuantity: ', error);
      return rejectWithValue(
        error.response?.data?.message || { message: 'Update failed' }
      );
    }
  }
);

// Remove an item from the cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId, color, size }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/cart`, {
        data: { productId, color, size },
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi removeFromCart: ', error);
      return rejectWithValue(error.response?.data || { message: 'Remove failed' });
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = { products: [], totalItems: 0, totalPrice: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      //fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.payload || 'Failed to fetch cart';
      })

      // Add item
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.payload?.message || 'Failed to add to cart';
      })
      // update quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.payload || 'Failed to update item quantity';
      })

      // remove item
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.payload.message || 'Failed to remove item';
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
