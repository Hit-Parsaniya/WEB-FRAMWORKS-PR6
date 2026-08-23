import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, AUTH_EVENT } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // On load, if a token exists, confirm it's still valid via /auth/me.
  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        // token invalid/expired — handleResponse already cleared it and fired AUTH_EVENT
      })
      .finally(() => setCheckingSession(false));
  }, [token]);

  // Global 401 handling: any request anywhere in the app that comes back
  // unauthorized clears the session and flags it so the UI can redirect to login.
  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener(AUTH_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSessionExpired(false);
    return data;
  }, []);

  const register = useCallback(async (email, password) => {
    await apiRegister(email, password);
    // Registration doesn't log the user in automatically — go log in next.
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        checkingSession,
        sessionExpired,
        login,
        register,
        logout,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
