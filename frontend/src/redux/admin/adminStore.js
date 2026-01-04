import { configureStore } from '@reduxjs/toolkit';
import adminProductsSlices from './slices/adminProductsSlice';
// import categorySlice from '../slices/categorySlice';
import categoriesSlice from './slices/adminCategoriesSlice';
import adminOrdersSlices from './slices/adminOrdersSlice';
import collectionsSlices from './slices/adminCollectionsSlice.js';
import adminUserSlices from './slices/adminUserSlice.js';
const adminStore = configureStore({
  reducer: {
    adminProducts: adminProductsSlices,
    categories: categoriesSlice,
    collections: collectionsSlices,
    adminOrders: adminOrdersSlices,
    adminUsers: adminUserSlices,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default adminStore;
