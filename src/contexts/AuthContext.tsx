import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---
export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  userId: number;
  email: string;
  token: string;
  roleId: number;
  role: UserRole;
  fullName?: string;
  campus?: 'campus1' | 'campus2';
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  expires: string;
  userId: number;
  email: string;
  roleId: number;
  fullName?: string;
}

interface GoogleLoginResponse {
  token: string;
  refreshToken: string;
  expires: string;
  userId: number;
  email: string;
  roleId: number;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<number | null>;
  loginWithGoogle: (idToken: string) => Promise<number | null>;
  logout: () => void;
  updateCampus: (campus: 'campus1' | 'campus2') => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Config ---
const API_LOGIN_URL = '/api/Auth/login';
const API_GOOGLE_LOGIN_URL = '/api/Auth/google-login'; // Endpoint cho Google Login

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const mapRoleIdToRole = (id: number): UserRole => {
    switch (id) {
      case 1: return 'admin';
      case 2: return 'lecturer';
      case 3: return 'student';
      default: return 'student';
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('fptu_user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Session invalid:", e);
        logout();
      }
    }
  }, []);

  // Login thường
  const login = async (email: string, password: string): Promise<number | null> => {
    try {
      console.log(`🚀 Sending login request to: ${API_LOGIN_URL}`);
      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        console.log("✅ Login success:", data);
        
        const userRoleStr = mapRoleIdToRole(data.roleId);
        const userData: User = {
          userId: data.userId,
          email: data.email,
          token: data.token,
          roleId: data.roleId,
          role: userRoleStr,
          fullName: data.fullName,
          campus: userRoleStr !== 'admin' ? 'campus1' : undefined 
        };

        setUser(userData);
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('fptu_user', JSON.stringify(userData));
        
        return data.roleId; 
      } else {
        const errorText = await response.text();
        console.error("❌ Server rejected:", response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error("🔥 NETWORK ERROR (CORS/SSL):", error);
      console.log("👉 Gợi ý: Kiểm tra xem API có đang chạy không? Đã accept chứng chỉ SSL chưa?");
      return null;
    }
  };

  // Login với Google
  const loginWithGoogle = async (idToken: string): Promise<number | null> => {
    try {
      console.log(`🚀 Sending Google login request to: ${API_GOOGLE_LOGIN_URL}`);
      const response = await fetch(API_GOOGLE_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken })
      });

      if (response.ok) {
        const data: GoogleLoginResponse = await response.json();
        console.log("✅ Google login success:", data);
        
        const userRoleStr = mapRoleIdToRole(data.roleId);
        const userData: User = {
          userId: data.userId,
          email: data.email,
          token: data.token,
          roleId: data.roleId,
          role: userRoleStr,
          fullName: data.fullName,
          campus: userRoleStr !== 'admin' ? 'campus1' : undefined 
        };

        setUser(userData);
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('fptu_user', JSON.stringify(userData));
        
        return data.roleId; 
      } else {
        const errorText = await response.text();
        console.error("❌ Google login rejected:", response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error("🔥 Google login error:", error);
      return null;
    }
  };

  const updateCampus = (campus: 'campus1' | 'campus2') => {
    if (user) {
      const updatedUser = { ...user, campus };
      setUser(updatedUser);
      localStorage.setItem('fptu_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fptu_user');
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle,
      logout, 
      updateCampus, 
      isAuthenticated: !!user 
    }}>
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