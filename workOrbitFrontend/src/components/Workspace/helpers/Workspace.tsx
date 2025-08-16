// src/components/Workspace/helpers/Workspace.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Loader, ChevronRight } from 'lucide-react';
import { CreateWorkspaceRequest, Workspace } from '../../../types/WokspaceTypes';
import { useUserWorkspace } from '../../../context/CreateOrMapContext/UserWorkspaceContext';
import { WorkspaceApi } from '../../../services/api/WorkspaceApi';
import toast from 'react-hot-toast';

interface WorkspaceStepProps {
  onNext: (data: { 
    createNew?: CreateWorkspaceRequest; 
    existingWorkspaceId?: string; 
  }) => void;
}

const WorkspaceStep: React.FC<WorkspaceStepProps> = ({ onNext }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  
  const { 
    workspaces, 
    setWorkspaces, 
    setCurrentWorkspace,
    setLoading,
    isLoading
  } = useUserWorkspace();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await WorkspaceApi.getWorkspaces();
      if (response.success) {
        setWorkspaces(response.data || []);
        if (!response.data || response.data.length === 0) {
          setShowCreateForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      setShowCreateForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setCurrentWorkspace(workspace);
  };

  const handleContinue = () => {
    if (selectedWorkspace) {
      onNext({ existingWorkspaceId: selectedWorkspace.workspace_id });
    } else if (showCreateForm && workspaceName.trim()) {
      onNext({ createNew: { name: workspaceName.trim() } });
    } else {
      toast.error('Please select a workspace or create a new one');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto mb-4" size={32} />
        <p className="text-gray-300">Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          Choose Your Workspace
        </h2>
        <p className="text-gray-300">
          Select an existing workspace or create a new one
        </p>
      </div>

      {/* Existing Workspaces */}
      {workspaces.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Existing Workspaces</h3>
          {workspaces.map((workspace) => (
            <button
              key={workspace.workspace_id}
              onClick={() => handleSelectExistingWorkspace(workspace)}
              className={`w-full p-4 rounded-lg border transition-all duration-300 text-left flex items-center justify-between ${
                selectedWorkspace?.workspace_id === workspace.workspace_id
                  ? 'bg-purple-500/20 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Building2 size={20} className="mr-3" />
                <span className="font-medium">{workspace.name}</span>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      )}

      {/* Create New Workspace */}
      <div className={`${workspaces.length > 0 ? 'border-t border-white/20 pt-6' : ''}`}>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full p-4 border-2 border-dashed border-purple-400/50 rounded-lg text-purple-400 hover:border-purple-400 hover:text-white transition-all duration-300 flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Create New Workspace
          </button>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Building2 className="inline w-4 h-4 mr-2" />
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. Acme Corporation, My Startup, Team Alpha"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
              />
              <p className="text-gray-400 text-sm mt-2">
                Choose a name that represents your organization or project
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <button
          onClick={handleContinue}
          disabled={!selectedWorkspace && (!showCreateForm || !workspaceName.trim())}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          Continue to Departments
          <ChevronRight className="ml-2" size={20} />
        </button>
      </div>
    </div>
  );
};

export default WorkspaceStep;
