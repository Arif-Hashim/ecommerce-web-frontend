import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { cartApi } from '../api';
import { imgUrl } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'shopco_cart_v2'; // v2: product ids are now MongoDB ids (old v1 carts are ignored)

// ---------- guest cart (not logged in): localStorage, same as before ----------
function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, color, size, qty } = action.payload;
      const lineId = `${product.id}-${color}-${size}`;
      const existing = state.find((line) => line.lineId === lineId);
      if (existing) {
        return state.map((line) => (line.lineId === lineId ? { ...line, qty: line.qty + qty } : line));
      }
      return [
        ...state,
        { lineId, id: product.id, name: product.name, image: product.image, price: product.price, color, size, qty },
      ];
    }
    case 'UPDATE_QTY': {
      const { lineId, qty } = action.payload;
      if (qty < 1) return state.filter((line) => line.lineId !== lineId);
      return state.map((line) => (line.lineId === lineId ? { ...line, qty } : line));
    }
    case 'REMOVE':
      return state.filter((line) => line.lineId !== action.payload.lineId);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

// server item -> same "line" shape the Cart page already uses
const fromServer = (i) => ({
  lineId: i.id,
  id: i.productId,
  name: i.name,
  image: imgUrl(i.image),
  price: i.price,
  color: i.color,
  size: i.size,
  qty: i.quantity,
});

export function CartProvider({ children }) {
  const { user } = useAuth(); // CartProvider must be INSIDE AuthProvider
  const userId = user?.id;

  const [guestCart, dispatch] = useReducer(cartReducer, undefined, loadInitialState);
  const [serverCart, setServerCart] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const guestRef = useRef(guestCart);
  guestRef.current = guestCart;

  // keep guest cart in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestCart));
  }, [guestCart]);

  // on login: merge guest cart into the server cart, then load it. On logout: clear server copy.
  useEffect(() => {
    if (!userId) {
      setServerCart([]);
      return undefined;
    }
    let alive = true;
    (async () => {
      try {
        const local = guestRef.current;
        const res = local.length
          ? await cartApi.merge(local.map((l) => ({ productId: l.id, color: l.color, size: l.size, quantity: l.qty })))
          : await cartApi.get();
        if (!alive) return;
        setServerCart(res.items.map(fromServer));
        if (local.length) dispatch({ type: 'CLEAR' });
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  // run a server cart call, update state, return true/false (never throws)
  const run = useCallback(async (fn) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fn();
      setServerCart(res.items.map(fromServer));
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const cart = userId ? serverCart : guestCart;

  const api = useMemo(() => {
    const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
    const itemCount = cart.reduce((sum, l) => sum + l.qty, 0);
    return {
      cart,
      subtotal,
      itemCount,
      error,
      busy,
      clearError: () => setError(null),

      // returns a Promise<boolean> (true = added). Old code that ignores the result still works.
      addToCart: (product, color, size, qty = 1) => {
        if (userId) return run(() => cartApi.add({ productId: product.id, color, size, quantity: qty }));
        dispatch({ type: 'ADD', payload: { product: { ...product, image: imgUrl(product.image) }, color, size, qty } });
        return Promise.resolve(true);
      },
      updateQty: (lineId, qty) => {
        if (userId) return run(() => cartApi.update(lineId, qty));
        dispatch({ type: 'UPDATE_QTY', payload: { lineId, qty } });
        return Promise.resolve(true);
      },
      removeFromCart: (lineId) => {
        if (userId) return run(() => cartApi.remove(lineId));
        dispatch({ type: 'REMOVE', payload: { lineId } });
        return Promise.resolve(true);
      },
      clearCart: () => {
        if (userId) return run(() => cartApi.clear());
        dispatch({ type: 'CLEAR' });
        return Promise.resolve(true);
      },
    };
  }, [cart, userId, run, error, busy]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
