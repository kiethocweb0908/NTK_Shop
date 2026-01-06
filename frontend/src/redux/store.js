import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import collectionReducer from './slices/collectionSlice';

// admin
import adminProductsSlices from './admin/slices/adminProductsSlice';
import categoriesSlice from './admin/slices/adminCategoriesSlice';
import adminOrdersSlices from './admin/slices/adminOrdersSlice';
import collectionsSlices from './admin/slices/adminCollectionsSlice.js';
import adminUserSlices from './admin/slices/adminUserSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,

    user: combineReducers({
      products: productReducer,
      cart: cartReducer,
      categories: categoryReducer,
      collections: collectionReducer,
      orders: orderReducer,
    }),
    admin: combineReducers({
      adminProducts: adminProductsSlices,
      categories: categoriesSlice,
      collections: collectionsSlices,
      adminOrders: adminOrdersSlices,
      adminUsers: adminUserSlices,
    }),
  },
});

export default store;
