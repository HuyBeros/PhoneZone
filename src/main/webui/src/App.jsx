import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './store/ToastContext';
import { CartProvider } from './store/CartContext';
import { PointsProvider } from './store/PointsContext';
import { CompareProvider } from './store/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CompareBar from './components/CompareBar';
import ChatWidget from './components/ChatWidget';
import Toast from './components/Toast';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import BrandPage from './pages/BrandPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import RewardsPage from './pages/RewardsPage';
import ComparePage from './pages/ComparePage';

export default function App() {
  return (
    <ToastProvider>
      <PointsProvider>
        <CartProvider>
          <CompareProvider>
            <Navbar />
          <main>
            <Routes>
              <Route path="/"               element={<HomePage />} />
              <Route path="/brand/:brandId" element={<BrandPage />} />
              <Route path="/product/:id"    element={<ProductDetailPage />} />
              <Route path="/checkout"       element={<CheckoutPage />} />
              <Route path="/profile"        element={<ProfilePage />} />
              <Route path="/orders"         element={<OrdersPage />} />
              <Route path="/rewards"        element={<RewardsPage />} />
              <Route path="/compare"        element={<ComparePage />} />
            </Routes>
          </main>
          <Footer />
          <CartSidebar />
          <CompareBar />
          <ChatWidget />
          <Toast />
          <BackToTop />
          </CompareProvider>
        </CartProvider>
      </PointsProvider>
    </ToastProvider>
  );
}
