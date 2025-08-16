import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Workspace, CreateWorkspaceRequest } from '../../types/WokspaceTypes';
import { CreateOrMapData } from '../../types/ApiTypes';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  createOrMapData: CreateOrMapData;
}

type WorkspaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: Workspace | null }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'SET_CREATE_OR_MAP_DATA'; payload: Partial<CreateOrMapData> }
  | { type: 'CLEAR_CREATE_OR_MAP_DATA' };

interface WorkspaceContextType extends WorkspaceState {
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  setLoading: (loading: boolean) => void;
  updateCreateOrMapData: (data: Partial<CreateOrMapData>) => void;
  clearCreateOrMapData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const workspaceReducer = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload };
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    case 'ADD_WORKSPACE':
      return { 
        ...state, 
        workspaces: [...state.workspaces, action.payload],
        currentWorkspace: action.payload
      };
    case 'SET_CREATE_OR_MAP_DATA':
      return { 
        ...state, 
        createOrMapData: { ...state.createOrMapData, ...action.payload }
      };
    case 'CLEAR_CREATE_OR_MAP_DATA':
      return { ...state, createOrMapData: {} };
    default:
      return state;
  }
};

const initialState: WorkspaceState = {
  currentWorkspace: null,
  workspaces: [],
  isLoading: false,
  createOrMapData: {},
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const UserWorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const setWorkspaces = (workspaces: Workspace[]) => {
    dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
  };

  const setCurrentWorkspace = (workspace: Workspace | null) => {
    dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspace });
  };

  const addWorkspace = (workspace: Workspace) => {
    dispatch({ type: 'ADD_WORKSPACE', payload: workspace });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const updateCreateOrMapData = (data: Partial<CreateOrMapData>) => {
    dispatch({ type: 'SET_CREATE_OR_MAP_DATA', payload: data });
  };

  const clearCreateOrMapData = () => {
    dispatch({ type: 'CLEAR_CREATE_OR_MAP_DATA' });
  };

  const value: WorkspaceContextType = {
    ...state,
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    setLoading,
    updateCreateOrMapData,
    clearCreateOrMapData,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useUserWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useUserWorkspace must be used within a UserWorkspaceProvider');
  }
  return context;
};
