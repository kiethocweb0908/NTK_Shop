import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    categories: categoryReducer,
    orders: orderReducer,
  },
});

export default store;
