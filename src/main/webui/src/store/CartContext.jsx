import { createContext, useContext, useState, useCallback } from 'react';
import { PHONES, ACCESSORIES } from '../data/data';
import { useToast } from './ToastContext';

const CartContext = createContext();
const ALL_PRODUCTS = [...PHONES, ...ACCESSORIES];

export function CartProvider({ children }) {
  const { showToast } = useToast();

  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem('pz_cart') || '[]')
  );
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((id) => {
    const p = ALL_PRODUCTS.find(x => x.id === id);
    setCart(prev => {
      const ex = prev.find(x => x.id === id);
      const next = ex
        ? prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x)
        : [...prev, { ...p, qty: 1 }];
      localStorage.setItem('pz_cart', JSON.stringify(next));
      return next;
    });
    showToast(`🛒 Đã thêm "${p.name}" vào giỏ hàng!`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const next = prev.filter(x => x.id !== id);
      localStorage.setItem('pz_cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      addToCart, removeFromCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
