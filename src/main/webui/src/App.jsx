import { Routes, Route, useLocation } from 'react-router-dom';
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
import OrderDetailPage from './pages/OrderDetailPage';
import RewardsPage from './pages/RewardsPage';
import ComparePage from './pages/ComparePage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import RepairPage from './pages/RepairPage';
import RepairDetailPage from './pages/RepairDetailPage';
import TabletPage from './pages/TabletPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminRepairs from './pages/admin/AdminRepairs';
import AdminContacts from './pages/admin/AdminContacts';

function AppInner() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <main style={isAdmin ? { padding: 0 } : {}}>
        <Routes>
          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="repairs" element={<AdminRepairs />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>

          {/* PUBLIC ROUTES */}
          <Route path="/"               element={<HomePage />} />
          <Route path="/brand/:brandId" element={<BrandPage />} />
          <Route path="/product/:id"    element={<ProductDetailPage />} />
          <Route path="/checkout"       element={<CheckoutPage />} />
          <Route path="/profile"        element={<ProfilePage />} />
          <Route path="/orders"         element={<OrdersPage />} />
          <Route path="/orders/:id"     element={<OrderDetailPage />} />
          <Route path="/rewards"        element={<RewardsPage />} />
          <Route path="/compare"        element={<ComparePage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/contact"        element={<ContactPage />} />
          <Route path="/repair"         element={<RepairPage />} />
          <Route path="/repair/:id"     element={<RepairDetailPage />} />
          <Route path="/tablet"         element={<TabletPage />} />
        </Routes>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <CartSidebar />
          <CompareBar />
          <ChatWidget />
          <BackToTop />
        </>
      )}
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PointsProvider>
        <CartProvider>
          <CompareProvider>
            <AppInner />
          </CompareProvider>
        </CartProvider>
      </PointsProvider>
    </ToastProvider>
  );
}
