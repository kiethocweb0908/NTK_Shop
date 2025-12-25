import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

// Retrieve user info and token from localStorage if available
// const userFromStorege = localStorage.getItem('userInfo')
//   ? JSON.parse(localStorage.getItem('userInfo'))
//   : null;

// Initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Async Thunk để lấy user info từ /me
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/users/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue({
          type: 'NOT_LOGGED_IN',
          message: error.response.data.message,
        });
      }
      return rejectWithValue({
        type: 'OTHER_ERROR',
        message: error.response?.data?.message || 'Không thể lấy thông tin user',
      });
    }
  }
);

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/users/login`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Đăng nhập thất bại');
    }
  }
);

// Async Thunk to send mail OTP
export const requestRegisterOTPThunk = createAsyncThunk(
  'auth/requestRegisterOTPThunk',
  async ({ name, phone, email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/users/request-otp`, {
        name,
        phone,
        email,
        password,
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'requestRegisterOTPThunk failed'
      );
    }
  }
);

// Async Thunk to verify OTP & create user
export const verifyRegisterOTPThunk = createAsyncThunk(
  'auth/verifyRegisterOTPThunk',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/users/verify-otp`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      return error.response?.data?.message || 'verifyRegisterOTPThunk failed';
    }
  }
);

// Async thunk to resend OTP
export const resendRegisterOTPThunk = createAsyncThunk(
  'auth/resendRegisterOTP',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/resend-otp', { email });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Async Thunk for Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/logout');
      return response?.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // Phân biệt giữa "chưa đăng nhập" và lỗi thật
        if (action.payload?.type === 'NOT_LOGGED_IN') {
          state.user = null;
          state.error = null; // KHÔNG set error cho trường hợp này
        } else {
          state.user = null;
          state.error = action.payload?.message || 'Có lỗi xảy ra';
        }
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })

      //==========requestRegisterOTPThunk=============
      .addCase(requestRegisterOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRegisterOTPThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestRegisterOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========verifyRegisterOTPThunk=============
      .addCase(verifyRegisterOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegisterOTPThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyRegisterOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //==========resendRegisterOTPThunk=============
      .addCase(resendRegisterOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendRegisterOTPThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendRegisterOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;
