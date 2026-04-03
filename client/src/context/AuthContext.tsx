import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../api/auth';
import type { User } from '../api/auth';

export interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setCurrentUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => setCurrentUser(null);
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await apiLogin({ email, password });
    setCurrentUser(user);
  }, []);

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    const user = await apiRegister({ displayName, email, password });
    setCurrentUser(user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
