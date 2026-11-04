import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { readWishlist, writeWishlist, wishlistStorageKey } from '../utils/wishlistStorage';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, token, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const owner = token && user?.id != null ? String(user.id) : null;
  const stored = useMemo(() => readWishlist(owner), [owner]);
  const [snapshot, setSnapshot] = useState(() => ({ owner, items: stored }));
  const [drawer, setDrawer] = useState({ owner: null, open: false });

  // Gate the render by owner immediately, before effects run on logout/account switching.
  const wishlist = owner === null ? [] : snapshot.owner === owner ? snapshot.items : stored;
  const wishlistOpen = drawer.owner === owner && drawer.open;

  useEffect(() => {
    setSnapshot({ owner, items: readWishlist(owner) });
    setDrawer(current => current.owner === owner ? current : { owner, open: false });
  }, [owner]);

  useEffect(() => {
    const sync = event => {
      if (event.key === null || event.key === wishlistStorageKey(owner)) {
        setSnapshot({ owner, items: readWishlist(owner) });
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [owner]);

  const closeWishlist = useCallback(() => setDrawer({ owner, open: false }), [owner]);
  const openWishlist = useCallback(() => setDrawer({ owner, open: true }), [owner]);
  const requestLogin = () => {
    if (loading) {
      showToast('Đang kiểm tra phiên đăng nhập. Vui lòng đợi một chút.', 'info');
      return;
    }
    closeWishlist();
    showToast('Đăng nhập để lưu sản phẩm yêu thích của bạn.', 'info');
    navigate('/login', { state: { from: location.pathname + location.search } });
  };

  const save = items => {
    if (!owner) { requestLogin(); return false; }
    if (!writeWishlist(owner, items)) {
      showToast('Không thể lưu danh sách yêu thích trên trình duyệt này. Vui lòng thử lại.', 'error');
      return false;
    }
    setSnapshot({ owner, items: readWishlist(owner) });
    return true;
  };

  const toggleWishlist = product => {
    if (!owner) { requestLogin(); return null; }
    if (!product?.id || !product?.name || !Number.isFinite(product.price) || product.price < 0) {
      showToast('Thông tin sản phẩm chưa sẵn sàng. Vui lòng thử lại.', 'error');
      return null;
    }
    const items = readWishlist(owner);
    const exists = items.some(item => String(item.id) === String(product.id));
    const next = exists ? items.filter(item => String(item.id) !== String(product.id)) : [...items, product];
    return save(next) ? !exists : null;
  };

  const removeFromWishlist = id => save(readWishlist(owner).filter(item => String(item.id) !== String(id)));
  const clearWishlist = () => save([]);
  const isWished = id => wishlist.some(item => String(item.id) === String(id));

  return <WishlistContext.Provider value={{ wishlist, wishlistCount: wishlist.length, wishlistOpen,
    authenticated: owner !== null, openWishlist, closeWishlist, requestLogin,
    toggleWishlist, removeFromWishlist, clearWishlist, isWished }}>
    {children}
  </WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist requires WishlistProvider');
  return context;
}
