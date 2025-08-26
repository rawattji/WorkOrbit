// src/components/Workspace/CreateOrMapUserToWorkspacePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import WorkspaceStep from './helpers/Workspace';
import DepartmentStep from './helpers/Department';
import TeamStep from './helpers/Team';
import { WorkspaceApi } from '../../services/api/WorkspaceApi';
import { DepartmentApi } from '../../services/api/DepartmentApi';
import { TeamsApi } from '../../services/api/TeamApi';
import { CreateWorkspaceRequest } from '../../types/WokspaceTypes';
import { CreateDepartmentRequest } from '../../types/DepartmentTypes';
import { CreateTeamRequest } from '../../types/TeamTypes';
import { UserWorkspaceProvider } from '../../context/CreateOrMapContext/UserWorkspaceContext';
import { UserDepartmentProvider } from '../../context/CreateOrMapContext/UserDepartmentContext';
import { UserTeamProvider } from '../../context/CreateOrMapContext/UserTeamContext';
import toast from 'react-hot-toast';

enum Step {
  WORKSPACE = 0,
  DEPARTMENT = 1,
  TEAM = 2,
}

const CreateOrMapUserToWorkspacePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.WORKSPACE);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const navigate = useNavigate();

  const stepTitles = ['Workspace', 'Department', 'Team'];

  /** Step 1: Create or select workspace */
  const handleWorkspaceNext = async (data: { createNew?: CreateWorkspaceRequest; existingWorkspaceId?: string; }) => {
    try {
      if (data.createNew) {
        // Create new workspace via API
        const res = await WorkspaceApi.createWorkspace(data.createNew);
        if (res.success && res.data?.workspace_id) {
          setWorkspaceId(res.data.workspace_id);
          toast.success('Workspace created successfully');
        } else {
          throw new Error(res.message || 'Failed to create workspace');
        }
      } 
      else if (data.existingWorkspaceId) {
        // 🔹 JOIN EXISTING WORKSPACE
        const joinRes = await WorkspaceApi.joinWorkspace(data.existingWorkspaceId, 'member');
        if (joinRes.success) {
          setWorkspaceId(data.existingWorkspaceId);
          toast.success('Joined workspace successfully');
        } else {
          throw new Error(joinRes.message || 'Failed to join workspace');
        }
      } 
      else {
        throw new Error('No workspace selected');
      }

      setCurrentStep(Step.DEPARTMENT);
    } catch (err: any) {
      toast.error(err.message || 'Error creating/selecting workspace');
    }
  };


  /** Step 2: Create or select department */
  const handleDepartmentNext = async (data: { createNew?: CreateDepartmentRequest; existingDepartmentId?: string; } = {}) => {
    if (!workspaceId) {
      toast.error('Workspace ID is missing');
      return;
    }
    try {
      if (data.createNew) {
        const res = await DepartmentApi.createDepartment({
          ...data.createNew,
          workspace_id: workspaceId,
        });
        if (res.success && res.data?.department_id) {
          setDepartmentId(res.data.department_id);
          toast.success('Department created successfully');
        } else {
          throw new Error(res.message || 'Failed to create department');
        }
      } else if (data.existingDepartmentId) {
        // Join existing department
        const res = await DepartmentApi.joinDepartment({ department_id: data.existingDepartmentId });
        if (res.success) {
          setDepartmentId(data.existingDepartmentId);
          toast.success('Joined department successfully');
        } else {
          throw new Error(res.message || 'Failed to join department');
        }
      } else {
        throw new Error('No department selected');
      }
      setCurrentStep(Step.TEAM);
    } catch (err: any) {
      toast.error(err.message || 'Error creating/selecting department');
    }
  };

  /** Step 3: Create or select team */
  const handleTeamComplete = async (data: { createNew?: CreateTeamRequest; existingTeamId?: string; } = {}) => {
    if (!departmentId) {
      toast.error('Department ID is missing');
      return;
    }
    try {
      if (data.createNew) {
        const res = await TeamsApi.createTeam({
          ...data.createNew,
          department_id: departmentId,
        });
        if (res.success) {
          toast.success('Team created successfully');
        } else {
          throw new Error(res.message || 'Failed to create team');
        }
      } else if (data.existingTeamId) {
        const res = await TeamsApi.joinTeam({ team_id: data.existingTeamId });
        if (res.success) {
          toast.success('Joined team successfully');
        } else {
          throw new Error(res.message || 'Failed to join team');
        }
      }
      toast.success('Setup complete!');
      navigate('/dashboard'); // Redirect after setup
    } catch (err: any) {
      toast.error(err.message || 'Error creating/selecting team');
    }
  };

  const handleSkipDepartment = () => {
    setCurrentStep(Step.TEAM);
  };

  const handleSkipTeam = () => {
    toast.success('Setup complete!');
    navigate('/dashboard');
  };

  const handleBack = () => {
    if (currentStep > Step.WORKSPACE) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const getProgressPercentage = () => ((currentStep + 1) / 3) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case Step.WORKSPACE:
        return <WorkspaceStep onNext={handleWorkspaceNext} />;
      case Step.DEPARTMENT:
        return (
          <DepartmentStep
            workspaceId={workspaceId ?? ""}
            onNext={handleDepartmentNext}
            onSkip={handleSkipDepartment}
          />
        );
      case Step.TEAM:
        return (
          <TeamStep
            departmentId={departmentId ?? undefined}
            onComplete={handleTeamComplete}
            onSkip={handleSkipTeam}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserWorkspaceProvider>
      <UserDepartmentProvider>
        <UserTeamProvider>
          <div className="min-h-screen p-4 bg-gradient-to-br from-gray-900 to-black">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </button>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {stepTitles.map((title, index) => (
                      <div key={title} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                            index <= currentStep
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                              : 'bg-white/20 text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`ml-2 text-sm font-medium transition-all duration-300 ${
                            index <= currentStep ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {title}
                        </span>
                        {index < stepTitles.length - 1 && (
                          <ArrowRight
                            size={16}
                            className={`mx-4 transition-all duration-300 ${
                              index < currentStep ? 'text-purple-400' : 'text-gray-600'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl animate-slide-up">
                {renderStep()}
              </div>

              {/* Step Indicator */}
              <div className="text-center mt-6 text-gray-400 text-sm">
                Step {currentStep + 1} of 3
              </div>
            </div>
          </div>
        </UserTeamProvider>
      </UserDepartmentProvider>
    </UserWorkspaceProvider>
  );
};

export default CreateOrMapUserToWorkspacePage;
