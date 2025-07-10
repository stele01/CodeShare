import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for saved auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        parsedUser.token = token;
        // For backwards compatibility with old user objects in localStorage
        if (parsedUser.name && !parsedUser.fullName) {
          parsedUser.fullName = parsedUser.name;
          delete parsedUser.name;
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user data');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // Real login functionality that calls the API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        console.error('Login failed:', response.statusText);
        return false;
      }
      
      const userData = await response.json();
      
      // Save token separately
      localStorage.setItem('token', userData.token);
      
      // Save user data without token
      const userToSave = {
        _id: userData._id,
        fullName: userData.fullName || userData.name,
        email: userData.email,
        token: userData.token
      };
      setUser(userToSave);
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Real register functionality that calls the API
  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password })
      });
      
      if (!response.ok) {
        console.error('Registration failed:', response.statusText);
        return false;
      }
      
      // Registration successful but don't auto-login
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 