import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getAuthToken, clearAuthToken } from '../services/api.js';
import { initializeSocket, disconnectSocket } from '../socket/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authApi.getProfile()
        .then((response) => {
          if (response.data) {
            setUser(response.data.user);
            localStorage.setItem('userId', response.data.user._id);
            initializeSocket();
          }
        })
        .catch(() => {
          clearAuthToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    if (response.data) {
      setUser(response.data.user);
      localStorage.setItem('userId', response.data.user._id);
      initializeSocket();
      return response;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (username, email, password) => {
    const response = await authApi.register(username, email, password);
    if (response.data) {
      setUser(response.data.user);
      localStorage.setItem('userId', response.data.user._id);
      initializeSocket();
      return response;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    disconnectSocket();
    clearAuthToken();
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

