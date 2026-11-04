import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const expiryTimers = useRef(new Map());
  const exitTimers = useRef(new Map());

  const removeToast = useCallback((id) => {
    clearTimeout(expiryTimers.current.get(id));
    expiryTimers.current.delete(id);
    if (exitTimers.current.has(id)) return;
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    exitTimers.current.set(id, setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      exitTimers.current.delete(id);
    }, 250));
  }, []);

  const showToast = useCallback((msg, type = 'success', duration = type === 'error' ? 6000 : 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, msg, type, duration }]);
    expiryTimers.current.set(id, setTimeout(() => removeToast(id), duration));
    return id;
  }, [removeToast]);

  useEffect(() => () => {
    expiryTimers.current.forEach(clearTimeout);
    exitTimers.current.forEach(clearTimeout);
    expiryTimers.current.clear();
    exitTimers.current.clear();
  }, []);

  // Preserve the existing context shape for storefront consumers.
  const toast = toasts[0] || { msg: '', show: false };

  return (
    <ToastContext.Provider value={{ toast, toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
