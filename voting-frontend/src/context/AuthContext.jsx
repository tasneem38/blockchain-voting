import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: null,
    voterId: null,
    boothId: null,
    role: null,
    isAuthenticated: false,
  });

  const login = useCallback((token, userData) => {
    setAuthState({
      token,
      voterId: userData.voterId || null,
      boothId: userData.boothId || null,
      role: userData.role || 'VOTER',
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      token: null,
      voterId: null,
      boothId: null,
      role: null,
      isAuthenticated: false,
    });
  }, []);

  const setPendingVoterId = useCallback((voterId) => {
    setAuthState(prev => ({ ...prev, voterId }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, setPendingVoterId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
