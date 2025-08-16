import React, { useState, useEffect } from 'react';
import { Plus, Users, Loader, ChevronRight } from 'lucide-react';
import { Department, CreateDepartmentRequest } from '../../../types/DepartmentTypes';
import { DepartmentApi } from '../../../services/api/DepartmentApi';
import { useUserDepartment } from '../../../context/CreateOrMapContext/UserDepartmentContext';
import toast from 'react-hot-toast';

interface DepartmentStepProps {
  workspaceId: string;
  isCreatingNewWorkspace?: boolean;
  onNext: (data?: { 
    createNew?: CreateDepartmentRequest; 
    existingDepartmentId?: string; 
  }) => void;
  onSkip: () => void;
}

const DepartmentStep: React.FC<DepartmentStepProps> = ({ 
  workspaceId, 
  isCreatingNewWorkspace = false, 
  onNext, 
  onSkip 
}) => {
  const [departmentName, setDepartmentName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const { 
    departments, 
    setDepartments, 
    setCurrentDepartment,
    isLoading,
    setLoading 
  } = useUserDepartment();

  useEffect(() => {
    if (!workspaceId) return;
    if (!isCreatingNewWorkspace) {
      loadDepartments();
    } else {
      setShowCreateForm(true); // for new workspace, default to create form
    }
  }, [workspaceId, isCreatingNewWorkspace]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await DepartmentApi.getDepartmentsByWorkspace(workspaceId);
      if (response.success) {
        setDepartments(response.data || []);
        if (!response.data?.length) {
          setShowCreateForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setShowCreateForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setCurrentDepartment(department);
  };

  const handleContinueWithNew = () => {
    if (!departmentName.trim()) {
      toast.error('Please enter a department name');
      return;
    }

    // For new workspaces, workspaceId will be passed after creation
    const departmentData: CreateDepartmentRequest = {
      workspace_id: workspaceId,
      name: departmentName.trim(),
    };

    onNext({ createNew: departmentData });
  };

  const handleContinueWithExisting = async () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }
    try {
      const res = await DepartmentApi.joinDepartment({
        department_id: selectedDepartment.department_id,
      });
      if (res.success) {
        toast.success('Joined department successfully');
        onNext({ existingDepartmentId: selectedDepartment.department_id });
      } else {
        throw new Error(res.message || 'Failed to join department');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error joining department');
    }
  };

  const handleContinue = () => {
    if (selectedDepartment) {
      handleContinueWithExisting();
    } else if (showCreateForm && departmentName.trim()) {
      handleContinueWithNew();
    } else {
      toast.error('Please select a department or create a new one');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto mb-4" size={32} />
        <p className="text-gray-300">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          Set Up Departments
        </h2>
        <p className="text-gray-300">
          {isCreatingNewWorkspace 
            ? 'Create a department for your new workspace'
            : 'Choose an existing department or create a new one'}
        </p>
      </div>

      {/* Existing Departments */}
      {!isCreatingNewWorkspace && departments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Existing Departments</h3>
          {departments.map((department) => (
            <button
              key={department.department_id}
              onClick={() => handleSelectExistingDepartment(department)}
              className={`w-full p-4 rounded-lg border transition-all duration-300 text-left flex items-center justify-between ${
                selectedDepartment?.department_id === department.department_id
                  ? 'bg-purple-500/20 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Users size={20} className="mr-3" />
                <span className="font-medium">{department.name}</span>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      )}

      {/* Create New Department */}
      {showCreateForm && (
        <div className={`${departments.length > 0 ? 'border-t border-white/20 pt-6' : ''}`}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g. Engineering, Marketing, Sales"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleContinueWithNew()}
            />
          </div>
        </div>
      )}

      {/* Continue / Skip */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleContinue}
          disabled={!selectedDepartment && (!showCreateForm || !departmentName.trim())}
          className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          Continue to Teams
          <ChevronRight className="ml-2" size={20} />
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

export default DepartmentStep;
