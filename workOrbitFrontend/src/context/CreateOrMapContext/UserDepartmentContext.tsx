import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Department, CreateDepartmentRequest } from '../../types/DepartmentTypes';

interface DepartmentState {
  currentDepartment: Department | null;
  departments: Department[];
  isLoading: boolean;
}

type DepartmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_CURRENT_DEPARTMENT'; payload: Department | null }
  | { type: 'ADD_DEPARTMENT'; payload: Department };

interface DepartmentContextType extends DepartmentState {
  setDepartments: (departments: Department[]) => void;
  setCurrentDepartment: (department: Department | null) => void;
  addDepartment: (department: Department) => void;
  setLoading: (loading: boolean) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

const departmentReducer = (state: DepartmentState, action: DepartmentAction): DepartmentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_CURRENT_DEPARTMENT':
      return { ...state, currentDepartment: action.payload };
    case 'ADD_DEPARTMENT':
      return { 
        ...state, 
        departments: [...state.departments, action.payload],
        currentDepartment: action.payload
      };
    default:
      return state;
  }
};

const initialState: DepartmentState = {
  currentDepartment: null,
  departments: [],
  isLoading: false,
};

interface DepartmentProviderProps {
  children: ReactNode;
}

export const UserDepartmentProvider: React.FC<DepartmentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(departmentReducer, initialState);

  const setDepartments = (departments: Department[]) => {
    dispatch({ type: 'SET_DEPARTMENTS', payload: departments });
  };

  const setCurrentDepartment = (department: Department | null) => {
    dispatch({ type: 'SET_CURRENT_DEPARTMENT', payload: department });
  };

  const addDepartment = (department: Department) => {
    dispatch({ type: 'ADD_DEPARTMENT', payload: department });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value: DepartmentContextType = {
    ...state,
    setDepartments,
    setCurrentDepartment,
    addDepartment,
    setLoading,
  };

  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
};

export const useUserDepartment = (): DepartmentContextType => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useUserDepartment must be used within a UserDepartmentProvider');
  }
  return context;
};