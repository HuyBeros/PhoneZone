import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '../api/apiClient';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { showToast } = useToast();
  const { token, user } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch cart items from API
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const data = await fetchApi('/cart');
      // data: { items: [], cartTotal: 0, cartCount: 0 }
      // need to map items to match frontend structure 
      // item = { id: cartItemId, productId, productName, productImage, price, quantity, itemTotal }
      const mapped = data.items.map(i => ({
        cartItemId: i.id, // ID của record CartItem
        id: i.productId,  // ID của Product (để match component)
        name: i.productName,
        img: i.productImage,
        price: i.price,
        qty: i.quantity,
      }));
      setCart(mapped);
    } catch (e) {
      console.error("Lỗi lấy giỏ hàng", e);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, qty = 1) => {
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    try {
      await fetchApi('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: qty })
      });
      showToast('🛒 Đã thêm sản phẩm vào giỏ hàng!');
      fetchCart(); // reload giỏ hàng
    } catch (e) {
      alert(e.message || "Lỗi thêm giỏ hàng");
    }
  }, [token, showToast, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!token) return;
    try {
      // Find cartItemId based on productId
      const item = cart.find(x => x.id === productId);
      if (!item) return;
      
      await fetchApi(`/cart/${item.cartItemId}`, { method: 'DELETE' });
      fetchCart();
    } catch (e) {
      alert(e.message || "Lỗi xóa sản phẩm khỏi giỏ hàng");
    }
  }, [token, cart, fetchCart]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      addToCart, removeFromCart, fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
