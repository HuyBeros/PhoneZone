import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchApi } from '../api/apiClient';
import { mapProduct } from '../utils/utils';

export function useProductCatalog({ brand = '', keyword = '', priceFilter = 'all', sort = 'default' }) {
  const params = new URLSearchParams({ size: '15', sort, q: keyword.trim() });
  if (brand && brand !== 'all') params.set('brand', brand);
  if (priceFilter === 'under10') params.set('maxPrice', '9999999');
  if (priceFilter === '10to20') { params.set('minPrice', '10000000'); params.set('maxPrice', '20000000'); }
  if (priceFilter === 'over20') params.set('minPrice', '20000001');
  const query = params.toString();
  const generation = useRef(0);
  const [state, setState] = useState({ products: [], total: 0, page: -1 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const version = ++generation.current;
    const controller = new AbortController();
    setLoading(true);
    setLoadingMore(false);
    setError('');
    setState({ products: [], total: 0, page: -1 });
    const timer = setTimeout(async () => {
      try {
        const result = await fetchApi(`/products?${query}&page=0`, { signal: controller.signal });
        if (generation.current === version) setState({ products: result.data.map(mapProduct), total: result.total, page: 0 });
      } catch (err) {
        if (err.name !== 'AbortError' && generation.current === version) setError(err.message);
      } finally {
        if (generation.current === version) setLoading(false);
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); generation.current++; };
  }, [query, retry]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || state.products.length >= state.total) return;
    const version = generation.current;
    setLoadingMore(true);
    setError('');
    try {
      const result = await fetchApi(`/products?${query}&page=${state.page + 1}`);
      if (generation.current === version) setState(previous => ({
        products: [...previous.products, ...result.data.map(mapProduct)], total: result.total, page: result.page,
      }));
    } catch (err) {
      if (generation.current === version) setError(err.message);
    } finally {
      if (generation.current === version) setLoadingMore(false);
    }
  }, [query, state, loading, loadingMore]);

  return { ...state, loading, loadingMore, error, loadMore, retry: () => setRetry(value => value + 1) };
}
