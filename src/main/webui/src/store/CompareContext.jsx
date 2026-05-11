import { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds]     = useState([]);
  const [compareItems, setCompareItems] = useState([]);
  const { showToast } = useToast();

  const toggleCompare = (product) => {
    const id = product.id;
    if (compareIds.includes(id)) {
      setCompareIds(prev => prev.filter(x => x !== id));
      setCompareItems(prev => prev.filter(x => x.id !== id));
    } else {
      if (compareIds.length >= 3) {
        showToast('Chỉ có thể so sánh tối đa 3 sản phẩm!', 'warning');
        return;
      }
      setCompareIds(prev => [...prev, id]);
      setCompareItems(prev => [...prev, product]);
    }
  };

  const removeCompare = (id) => {
    setCompareIds(prev => prev.filter(x => x !== id));
    setCompareItems(prev => prev.filter(x => x.id !== id));
  };

  const clearCompare = () => {
    setCompareIds([]);
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider value={{ compareIds, compareItems, toggleCompare, removeCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
