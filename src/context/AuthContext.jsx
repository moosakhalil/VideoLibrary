import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/web/me');
      setCustomer(data.customer);
      return data.customer;
    } catch {
      setCustomer(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('token')) {
        await refresh();
      }
      setLoading(false);
    })();
  }, [refresh]);

  const onAuthed = (data) => {
    setToken(data.token);
    setCustomer(data.customer);
  };

  const login = async (phone, pin) => {
    const { data } = await api.post('/web/auth/login', { phone, pin });
    onAuthed(data);
  };

  const register = async (phone, pin, pinConfirm) => {
    const { data } = await api.post('/web/auth/register', { phone, pin, pinConfirm });
    onAuthed(data);
  };

  const checkPhone = async (phone) => {
    const { data } = await api.post('/web/auth/check-phone', { phone });
    return data; // { exists, hasPin }
  };

  const logout = async () => {
    try {
      await api.post('/web/auth/logout');
    } catch {
      /* ignore */
    }
    setToken(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{ customer, setCustomer, loading, login, register, checkPhone, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
