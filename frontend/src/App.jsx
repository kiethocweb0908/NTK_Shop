import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useDispatch } from 'react-redux';
import store from './redux/store';

import { fetchCurrentUser } from './redux/slices/authSlice';
import { fetchCart } from './redux/slices/cartSlice';

// Components
import NotFound from './pages/NotFound';
import UserLayout from './components/Layout/UserLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CollectionPage from './pages/CollectionPage';
import ProductDetails from './components/Products/ProductDetails';
import Checkout from './components/Cart/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetailsPage from './pages/OrderDetailsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import UserManagement from './components/Admin/UserManagement';
import ProductManagement from './components/Admin/ProductManagement';
import EditProdcutPage from './components/Admin/EditProdcutPage';
import OrderManagement from './components/Admin/OrderManagement';
import Aa from './components/Admin/AccordionItem ';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant', // hoặc 'smooth' cho hiệu ứng mượt
  });

  return null;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Luôn gọi /me khi app khởi động để check authentication
    dispatch(fetchCurrentUser())
      .unwrap()
      .then((user) => {
        // Nếu có user → fetch cart từ server
        if (user) {
          dispatch(fetchCart());
        }
      })
      .catch((error) => {
        // QUAN TRỌNG: Chỉ log error nếu không phải "chưa đăng nhập"
        if (error?.type !== 'NOT_LOGGED_IN') {
          console.error('❌ Lỗi khi lấy user info:', error?.message);
        } else {
          console.log('🔐 Chưa đăng nhập - chuyển sang guest mode');
        }

        // Không có user hoặc token expired → vẫn fetch cart (sẽ dùng guestId)
        dispatch(fetchCart());
      });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" closeButton richColors />

      <Routes>
        {/* User Layout */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="collections/:collection" element={<CollectionPage />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="order/:id" element={<OrderDetailsPage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
        </Route>

        {/* Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/:id/edit" element={<EditProdcutPage />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="items" element={<Aa />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
