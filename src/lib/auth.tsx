// EXPORTS: useAuth, AuthProvider
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { storage, STORAGE_KEYS } from './storage';
import { sha256 } from './crypto';
import type { IUser } from './types';
import { logger } from '@lark-apaas/client-toolkit-lite';

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUserId = storage.get<string | null>(STORAGE_KEYS.SESSION, null);
    if (sessionUserId) {
      const users = storage.get<IUser[]>(STORAGE_KEYS.USERS, []);
      const found = users.find((u) => u.id === sessionUserId);
      if (found) {
        setUser(found);
      } else {
        storage.remove(STORAGE_KEYS.SESSION);
      }
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const users = storage.get<IUser[]>(STORAGE_KEYS.USERS, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('该邮箱已被注册');
    }
    const passwordHash = await sha256(password);
    const newUser: IUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: Date.now(),
    };
    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    storage.set(STORAGE_KEYS.SESSION, newUser.id);
    setUser(newUser);
    logger.info('User registered:', newUser.id);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = storage.get<IUser[]>(STORAGE_KEYS.USERS, []);
    const passwordHash = await sha256(password);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === passwordHash,
    );
    if (!found) {
      throw new Error('邮箱或密码错误');
    }
    storage.set(STORAGE_KEYS.SESSION, found.id);
    setUser(found);
    logger.info('User logged in:', found.id);
  }, []);

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.SESSION);
    setUser(null);
    logger.info('User logged out');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
