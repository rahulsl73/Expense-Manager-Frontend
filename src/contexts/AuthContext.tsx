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
  updateProfile: (email: string, budget: number) => Promise<User>;
  login: (token: string, userId: number, email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('userId');

    setLoading(true);
    if (token && uid) {
      api
        .get<{ id: number; username: string; email: string; monthlyBudget: number }>(
          '/users/profile',
          { headers: { 'User-Id': uid } }
        )
        .then(res => {
          const { id, username, email, monthlyBudget } = res.data;
          setUser({ id, username, email, monthlyBudget });
        })
        .catch(() => {
          try {
            const { sub, email } = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: Number(uid),
              username: sub,
              email,
              monthlyBudget: 0,
            });
          } catch {
            localStorage.clear();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string, userId: number, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('email', email);

    setLoading(true);
    try {
      const res = await api.get<{ id: number; username: string; email: string; monthlyBudget: number }>(
        '/users/profile',
        { headers: { 'User-Id': String(userId) } }
      );
      const { id, username, email: userEmail, monthlyBudget } = res.data;
      setUser({ id, username, email: userEmail, monthlyBudget });
    } catch {
      const { sub } = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: userId,
        username: sub,
        email,
        monthlyBudget: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const updateProfile = async (email: string, budget: number): Promise<User> => {
    if (!user) throw new Error('No user logged in');
    setLoading(true);
    const payload = { email, monthlyBudget: budget };
    const res = await api.put<{ id: number; username: string; email: string; monthlyBudget: number }>(
      '/users/profile',
      payload,
      {
        headers: {
          'User-Id': String(user.id),
          'Content-Type': 'application/json',
        },
      }
    );

    const { id, username, email: updatedEmail, monthlyBudget } = res.data;
    const updatedUser: User = {
      id,
      username,
      email: updatedEmail,
      monthlyBudget,
    };

    setUser(updatedUser);
    setLoading(false);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
