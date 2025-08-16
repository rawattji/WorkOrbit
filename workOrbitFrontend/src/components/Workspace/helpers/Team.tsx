import React, { useState, useEffect } from 'react';
import { Plus, Users2, Loader, ChevronRight, Check } from 'lucide-react';
import { Team, CreateTeamRequest } from '../../../types/TeamTypes';
import { TeamsApi } from '../../../services/api/TeamApi';
import { useUserTeam } from '../../../context/CreateOrMapContext/UserTeamContext';
import toast from 'react-hot-toast';

interface TeamStepProps {
  departmentId?: string;
  isCreatingNewDepartment?: boolean;
  onComplete: (data?: { 
    createNew?: CreateTeamRequest; 
    existingTeamId?: string; 
  }) => void;
  onSkip: () => void;
}

const TeamStep: React.FC<TeamStepProps> = ({ 
  departmentId, 
  isCreatingNewDepartment = false, 
  onComplete, 
  onSkip 
}) => {
  const [teamName, setTeamName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const { 
    teams, 
    setTeams, 
    setCurrentTeam,
    isLoading,
    setLoading 
  } = useUserTeam();

  useEffect(() => {
    if (!departmentId) return;
    if (!isCreatingNewDepartment) {
      loadTeams();
    } else {
      setShowCreateForm(true); // new department → default to create
    }
  }, [departmentId, isCreatingNewDepartment]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await TeamsApi.getTeamsByDepartment(departmentId!);
      if (response.success) {
        setTeams(response.data || []);
        if (!response.data?.length) setShowCreateForm(true);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setShowCreateForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingTeam = (team: Team) => {
    setSelectedTeam(team);
    setCurrentTeam(team);
  };

  const handleCompleteWithNew = () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    const teamData: CreateTeamRequest = {
      department_id: departmentId || '', // will be filled after department creation in onboarding
      name: teamName.trim(),
    };
    onComplete({ createNew: teamData });
  };

  const handleCompleteWithExisting = async () => {
    if (!selectedTeam) {
      toast.error('Please select a team');
      return;
    }
    try {
      const res = await TeamsApi.joinTeam({
        team_id: selectedTeam.team_id,
      });
      if (res.success) {
        toast.success('Joined team successfully');
        onComplete({ existingTeamId: selectedTeam.team_id });
      } else {
        throw new Error(res.message || 'Failed to join team');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error joining team');
    }
  };


  const handleFinish = () => {
    if (selectedTeam) {
      handleCompleteWithExisting();
    } else if (showCreateForm && teamName.trim()) {
      handleCompleteWithNew();
    } else {
      toast.error('Please select a team or create a new one');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto mb-4" size={32} />
        <p className="text-gray-300">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users2 size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          Create Teams
        </h2>
        <p className="text-gray-300">
          {isCreatingNewDepartment
            ? 'Create a team for your new department'
            : 'Choose an existing team or create a new one'}
        </p>
      </div>

      {/* Existing Teams */}
      {!isCreatingNewDepartment && teams.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Existing Teams</h3>
          {teams.map((team) => (
            <button
              key={team.team_id}
              onClick={() => handleSelectExistingTeam(team)}
              className={`w-full p-4 rounded-lg border transition-all duration-300 text-left flex items-center justify-between ${
                selectedTeam?.team_id === team.team_id
                  ? 'bg-purple-500/20 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Users2 size={20} className="mr-3" />
                <span className="font-medium">{team.name}</span>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      )}

      {/* Create New Team */}
      {showCreateForm && (
        <div className={`${teams.length > 0 ? 'border-t border-white/20 pt-6' : ''}`}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g. Frontend Team, Backend Team, Mobile Squad"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCompleteWithNew()}
            />
          </div>
        </div>
      )}

      {/* Complete / Skip */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleFinish}
          disabled={!selectedTeam && (!showCreateForm || !teamName.trim())}
          className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Check className="mr-2" size={20} />
          Complete Setup
        </button>
        <button
          onClick={onSkip}
          className="py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default TeamStep;
