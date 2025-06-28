import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export interface User {
  id: number;
  username: string;
  email: string;
  monthlyBudget: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (email: string, budget: number) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      setLoading(false);
      return;
    }

    api.get<User>(`/user/${uid}/profile`)
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('userId'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { data: auth } = await api.post<{ userId: number; email: string }>(
        '/auth/login',
        { username, password }
      );

      localStorage.setItem('userId', String(auth.userId));
      localStorage.setItem('email', auth.email);

      const { data: profile } = await api.get<User>(`/user/${auth.userId}/profile`);
      setUser(profile);

    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setUser(null);
    api.post('/auth/logout')
  };

  const userId = localStorage.getItem("userId");
  const updateProfile = async (email: string, budget: number): Promise<User> => {
    if (!user) throw new Error('No user logged in');
    setLoading(true);
    try {
      const { data } = await api.put<User>(
        `/user/${userId}/profile`,
        { email, monthlyBudget: budget }
      );
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
