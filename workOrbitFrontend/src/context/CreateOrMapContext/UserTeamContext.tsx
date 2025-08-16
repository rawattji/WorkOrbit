import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Team, CreateTeamRequest } from '../../types/TeamTypes';

interface TeamState {
  currentTeam: Team | null;
  teams: Team[];
  isLoading: boolean;
}

type TeamAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'SET_CURRENT_TEAM'; payload: Team | null }
  | { type: 'ADD_TEAM'; payload: Team };

interface TeamContextType extends TeamState {
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  addTeam: (team: Team) => void;
  setLoading: (loading: boolean) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const teamReducer = (state: TeamState, action: TeamAction): TeamState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload };
    case 'ADD_TEAM':
      return { 
        ...state, 
        teams: [...state.teams, action.payload],
        currentTeam: action.payload
      };
    default:
      return state;
  }
};

const initialState: TeamState = {
  currentTeam: null,
  teams: [],
  isLoading: false,
};

interface TeamProviderProps {
  children: ReactNode;
}

export const UserTeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  const setTeams = (teams: Team[]) => {
    dispatch({ type: 'SET_TEAMS', payload: teams });
  };

  const setCurrentTeam = (team: Team | null) => {
    dispatch({ type: 'SET_CURRENT_TEAM', payload: team });
  };

  const addTeam = (team: Team) => {
    dispatch({ type: 'ADD_TEAM', payload: team });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value: TeamContextType = {
    ...state,
    setTeams,
    setCurrentTeam,
    addTeam,
    setLoading,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useUserTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useUserTeam must be used within a UserTeamProvider');
  }
  return context;
};