// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/UserTypes';
import { AuthApi } from '../services/api/AuthApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  activeWorkspaceId: string | null;
  activeDepartmentId: string | null;
  activeTeamId: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_SCOPE'; payload: { workspaceId?: string | null; departmentId?: string | null; teamId?: string | null } };

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  setScope: (scope: { workspaceId?: string | null; departmentId?: string | null; teamId?: string | null }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  // ✅ support both keys (new + legacy)
  activeWorkspaceId: localStorage.getItem('activeWorkspaceId') || localStorage.getItem('workorbit_workspace_id') || null,
  activeDepartmentId: localStorage.getItem('activeDepartmentId') || null,
  activeTeamId: localStorage.getItem('activeTeamId') || null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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
        ...initialState,
        isLoading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_SCOPE':
      if (action.payload.workspaceId !== undefined) {
        if (action.payload.workspaceId) {
          // ✅ keep both keys in sync
          localStorage.setItem('activeWorkspaceId', action.payload.workspaceId);
          localStorage.setItem('workorbit_workspace_id', action.payload.workspaceId);
        } else {
          localStorage.removeItem('activeWorkspaceId');
          localStorage.removeItem('workorbit_workspace_id');
        }
      }
      if (action.payload.departmentId !== undefined) {
        if (action.payload.departmentId) localStorage.setItem('activeDepartmentId', action.payload.departmentId);
        else localStorage.removeItem('activeDepartmentId');
      }
      if (action.payload.teamId !== undefined) {
        if (action.payload.teamId) localStorage.setItem('activeTeamId', action.payload.teamId);
        else localStorage.removeItem('activeTeamId');
      }

      return {
        ...state,
        activeWorkspaceId: action.payload.workspaceId ?? state.activeWorkspaceId,
        activeDepartmentId: action.payload.departmentId ?? state.activeDepartmentId,
        activeTeamId: action.payload.teamId ?? state.activeTeamId,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // On mount, verify token if present
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    localStorage.removeItem('activeWorkspaceId');
    localStorage.removeItem('workorbit_workspace_id'); // ✅ clear legacy key too
    localStorage.removeItem('activeDepartmentId');
    localStorage.removeItem('activeTeamId');
    dispatch({ type: 'LOGOUT' });
  };

  const setUser = (user: User) => {
    localStorage.setItem('workorbit_user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setScope = (scope: { workspaceId?: string | null; departmentId?: string | null; teamId?: string | null }) => {
    dispatch({
      type: 'SET_SCOPE',
      payload: {
        workspaceId: scope.workspaceId ?? undefined,
        departmentId: scope.departmentId ?? undefined,
        teamId: scope.teamId ?? undefined,
      },
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setUser,
    checkAuth,
    setScope,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
