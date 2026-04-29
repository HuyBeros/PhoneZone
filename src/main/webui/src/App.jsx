import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './store/ToastContext';
import { CartProvider } from './store/CartContext';
import { PointsProvider } from './store/PointsContext';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Toast from './components/Toast';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import BrandPage from './pages/BrandPage';
import RewardsPage from './pages/RewardsPage';

export default function App() {
  return (
    <ToastProvider>
      <PointsProvider>
        <CartProvider>
          <Topbar />
          <Navbar />
          <main>
            <Routes>
              <Route path="/"               element={<HomePage />} />
              <Route path="/brand/:brandId" element={<BrandPage />} />
              <Route path="/rewards"        element={<RewardsPage />} />
            </Routes>
          </main>
          <Footer />
          <CartSidebar />
          <Toast />
          <BackToTop />
        </CartProvider>
      </PointsProvider>
    </ToastProvider>
  );
}
