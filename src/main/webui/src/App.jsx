import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { ToastProvider } from './store/ToastContext';
import { WishlistProvider } from './store/WishlistContext';
import { CartProvider } from './store/CartContext';
import { PointsProvider } from './store/PointsContext';
import { CompareProvider } from './store/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import WishlistSidebar from './components/WishlistSidebar';
import CompareBar from './components/CompareBar';
import Toast from './components/Toast';
import BackToTop from './components/BackToTop';
import RequireAuth from './components/RequireAuth';
import ErrorBoundary from './components/ErrorBoundary';
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
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminRepairs = lazy(() => import('./pages/admin/AdminRepairs'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));

function AppInner() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <main id="main-content" tabIndex={-1} style={isAdmin ? { padding: 0 } : {}}>
        <ErrorBoundary>
          <Suspense fallback={<div className="container catalog-status" role="status">Đang tải trang...</div>}>
            <Routes>
              {/* ADMIN ROUTES */}
              <Route element={<RequireAuth role="ROLE_ADMIN" />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="repairs" element={<AdminRepairs />} />
                  <Route path="contacts" element={<AdminContacts />} />
                </Route>
              </Route>

              {/* PUBLIC ROUTES */}
              <Route path="/"               element={<HomePage />} />
              <Route path="/brand/:brandId" element={<BrandPage />} />
              <Route path="/product/:id"    element={<ProductDetailPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/checkout"     element={<CheckoutPage />} />
                <Route path="/profile"      element={<ProfilePage />} />
                <Route path="/orders"       element={<OrdersPage />} />
                <Route path="/orders/:id"   element={<OrderDetailPage />} />
              </Route>
              <Route path="/rewards"        element={<RewardsPage />} />
              <Route path="/compare"        element={<ComparePage />} />
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/contact"        element={<ContactPage />} />
              <Route path="/repair"         element={<RepairPage />} />
              <Route path="/repair/:id"     element={<RepairDetailPage />} />
              <Route path="/tablet"         element={<TabletPage />} />
              <Route path="*" element={<div className="container catalog-status"><h1>Không tìm thấy trang</h1><p>Đường dẫn này không còn tồn tại.</p><Link to="/" className="btn btn-primary">Về trang chủ</Link></div>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <CartSidebar />
          <WishlistSidebar />
          <CompareBar />
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
      <WishlistProvider>
        <PointsProvider>
          <CartProvider>
            <CompareProvider>
              <AppInner />
            </CompareProvider>
          </CartProvider>
        </PointsProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
