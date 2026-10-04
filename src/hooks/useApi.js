import { useEffect, useState } from 'react';
import { metaApi, productsApi } from '../api';

export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const useProducts = (params) => useAsync(() => productsApi.list(params), [JSON.stringify(params)]);

// categories, styles, sizes, colors, deliveryFee (cached after first load)
const EMPTY = { categories: [], styles: [], sizes: [], colors: [], deliveryFee: 15 };
let metaCache = null;
export function useMeta() {
  const [meta, setMeta] = useState(metaCache);
  useEffect(() => {
    if (metaCache) return;
    metaApi.get().then((m) => { metaCache = m; setMeta(m); }).catch(() => {});
  }, []);
  return meta || EMPTY;
}
