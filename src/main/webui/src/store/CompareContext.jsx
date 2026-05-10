import { createContext, useContext, useState } from 'react';
import { PHONES } from '../data/data';
import { useToast } from './ToastContext';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([]);
  const { showToast } = useToast();

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) {
        showToast('Chỉ có thể so sánh tối đa 3 sản phẩm!', 'warning');
        return prev;
      }
      return [...prev, id];
    });
  };

  const removeCompare = (id) => {
    setCompareIds(prev => prev.filter(x => x !== id));
  };

  const clearCompare = () => setCompareIds([]);

  const compareItems = compareIds.map(id => PHONES.find(p => p.id === id)).filter(Boolean);

  return (
    <CompareContext.Provider value={{ compareIds, compareItems, toggleCompare, removeCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
