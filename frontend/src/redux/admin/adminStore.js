import { configureStore } from '@reduxjs/toolkit';
import adminProductsSlices from './slices/adminProductsSlice';
import categoryReducer from '../slices/categorySlice';
const adminStore = configureStore({
  reducer: {
    adminProducts: adminProductsSlices,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default adminStore;
