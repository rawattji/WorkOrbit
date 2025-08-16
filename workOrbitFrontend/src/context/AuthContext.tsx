// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/UserTypes';
import { AuthApi } from '../services/api/AuthApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = localStorage.getItem('workorbit_token');
      const userStr = localStorage.getItem('workorbit_user');
      
      if (token && userStr) {
        try {
          await AuthApi.verifyToken();
          const user = JSON.parse(userStr);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } catch (error) {
          // Token is invalid, clear local storage
          localStorage.removeItem('workorbit_token');
          localStorage.removeItem('workorbit_user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = (user: User, token: string) => {
    localStorage.setItem('workorbit_token', token);
    localStorage.setItem('workorbit_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem('workorbit_token');
    localStorage.removeItem('workorbit_user');
    dispatch({ type: 'LOGOUT' });
  };

  const setUser = (user: User) => {
    localStorage.setItem('workorbit_user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
