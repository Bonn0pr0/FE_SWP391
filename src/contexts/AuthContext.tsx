import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  email: string;
  role: UserRole;
  campus?: 'campus1' | 'campus2';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, campus?: 'campus1' | 'campus2') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const DEMO_USERS = [
  { email: 'nguyenvana@fpt.edu.vn', password: '123456', role: 'student' as UserRole },
  { email: 'nguyenvanb@fe.edu.vn', password: '123456', role: 'lecturer' as UserRole },
  { email: 'admin', password: '123456', role: 'admin' as UserRole },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('fptu_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, campus?: 'campus1' | 'campus2'): Promise<boolean> => {
    // Find user in demo users
    const foundUser = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        email: foundUser.email,
        role: foundUser.role,
        campus: foundUser.role !== 'admin' ? campus : undefined,
      };
      setUser(userData);
      localStorage.setItem('fptu_user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fptu_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
