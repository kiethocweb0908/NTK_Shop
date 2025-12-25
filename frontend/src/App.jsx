import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import adminStore from './redux/admin/adminStore';
import { Provider } from 'react-redux';

import { fetchCurrentUser } from './redux/slices/authSlice';
import { fetchCart } from './redux/slices/cartSlice';

// Components
import NotFound from './pages/NotFound';
import UserLayout from './components/Layout/UserLayout';
import Home from './pages/shop/Home';
import Login from './pages/shop/Login';
import Register from './pages/shop/Register';
import Profile from './pages/shop/Profile';
import CollectionPage from './pages/shop/CollectionPage';
import ProductDetails from './components/Products/ProductDetails';
import Checkout from './pages/shop/Checkout';
import OrderConfirmation from './pages/shop/OrderConfirmation';
import OrderDetailsPage from './pages/shop/OrderDetailsPage';
import MyOrdersPage from './pages/shop/MyOrdersPage';
import AdminLayout from './components/Layout/admin/AdminLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import UserManagement from './pages/admin/user/UserManagement';
import ProductManagement from './pages/admin/product/ProductManagement';
import EditProdcutPage from './pages/admin/product/EditProdcutPage';
import OrderManagement from './pages/admin/order/OrderManagement';
import { useEffect } from 'react';
import AddProductPage from './pages/admin/product/AddProductPage';
import { fetchCategories } from './redux/slices/categorySlice';
import ProductDetailPage from './pages/admin/product/ProductDetailPage';
import Otp from './pages/shop/Otp';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth', // hoặc 'smooth' cho hiệu ứng mượt
  });

  return null;
};

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" closeButton richColors />

      <Routes>
        {/* User Routes */}
        <Route path="/*" element={<UserRoutesWithStore />} />

        {/* Admin Routes  */}
        <Route path="/admin/*" element={<AdminRoutesWithStore />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function UserRoutesWithStore() {
  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
        // components: 'buttons',
      }}
    >
      <Provider store={store}>
        <UserRoutes />
      </Provider>
    </PayPalScriptProvider>
  );
}

function AdminRoutesWithStore() {
  return (
    <Provider store={adminStore}>
      <AdminRoutes />
    </Provider>
  );
}

// User
function UserRoutes() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 1. Kiểm tra login khi vào trang (chạy 1 lần)
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // 2. Mỗi khi user thay đổi → tự động cập nhật giỏ hàng
  useEffect(() => {
    dispatch(fetchCart());
  }, [user, dispatch]);
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="otp" element={<Otp />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shop" element={<CollectionPage />} />
        <Route path="product/:id" element={<ProductDetails />} />
        {/* <Route path="checkout" element={<Checkout />} /> */}
        <Route path="order-confirmation" element={<OrderConfirmation />} />
        <Route path="order/:id" element={<OrderDetailsPage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />
      </Route>
      <Route path="checkout" element={<Checkout />} />
    </Routes>
  );
}

// Admin
function AdminRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategories())
      .unwrap()
      .then((result) => {
        toast.success(result.message, { duration: 3000 });
      })
      .catch((error) => {
        toast.error(error?.message || 'Lỗi khi lấy danh mục', { duration: 3000 });
      });
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminHomePage />} />
        {/* Product */}
        <Route path="products" element={<ProductManagement />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="products/add" element={<AddProductPage />} />
        <Route path="products/:productId/edit" element={<EditProdcutPage />} />

        {/* User */}
        <Route path="users" element={<UserManagement />} />

        {/* Order */}
        <Route path="orders" element={<OrderManagement />} />
      </Route>
    </Routes>
  );
}

function App() {
  return <AppContent />;
}

export default App;
