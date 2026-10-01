import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    axios.get('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setIsAdmin(true))
      .catch(() => { localStorage.removeItem('admin_token'); setToken(null); })
      .finally(() => setChecking(false));
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setIsAdmin(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAdmin(false);
    setIsEditMode(false);
  };

  const toggleEditMode = () => setIsEditMode(p => !p);

  return (
    <AuthContext.Provider value={{ token, isAdmin, isEditMode, login, logout, toggleEditMode, checking }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
