import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    authApi.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await authApi.login({ email, password });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);
  const register = useCallback(async (name, email, password) => {
    const r = await authApi.register({ name, email, password });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
