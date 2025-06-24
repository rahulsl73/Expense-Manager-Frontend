import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export interface User {
  id: number;
  username: string;
  email: string;
  monthly_budget: number;
}

interface AuthContextType {
  user: User | null;
  updateProfile: (email: string, budget: number) => Promise<void>;
  login: (token: string, userId: number, email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const uid   = localStorage.getItem('userId');
    if (token && uid) {
      api
        .get<User>('/users', { headers: { 'User-Id': uid } })
        .then(res => setUser(res.data))
        .catch(() => {
          try {
            const { sub, email } = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id:             Number(uid),
              username:       sub,
              email,
              monthly_budget: 0,
            });
          } catch {
            localStorage.clear();
          }
        });
    }
  }, []);

  const login = async (token: string, userId: number, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('email', email);

    try {
      const res = await api.get<User>('/users', {
        headers: { 'User-Id': String(userId) },
      });
      setUser(res.data);
    } catch {
      const { sub } = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id:             userId,
        username:       sub,
        email,
        monthly_budget: 0,
      });
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const updateProfile = async (email: string, budget: number) => {
    if (!user) throw new Error('No user logged in');
    const payload = { email, monthlyBudget: budget };
    const res = await api.put<User>('/users', payload, {
      headers: {
        'User-Id':      String(user.id),
        'Content-Type': 'application/json',
      },
    });
    setUser({
      ...user,
      email:           res.data.email,
      monthly_budget:  res.data.monthly_budget,
    });
  };

  return (
    <AuthContext.Provider value={{ user, updateProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
