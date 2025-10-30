import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UserLayout from './components/Layout/UserLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import { Toaster } from 'sonner';
import NotFound from './pages/NotFound';

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Toaster position="top-right" closeButton richColors />
      <Routes>
        <Route path="/" element={<UserLayout />}>
          {/* User Layout */}
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route>{/* Admin Layout */}</Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
