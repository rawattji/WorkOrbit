// src/components/Dashboard/Dashboard.tsx
import React from 'react';
import { LogOut, Settings, Bell, Search, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mr-8">
                WorkOrbit
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search workspaces, projects..."
                  className="w-64 pl-10 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Settings size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {getGreeting()}, {user?.first_name}! 👋
          </h1>
          <p className="text-gray-300">
            Welcome to your WorkOrbit dashboard. Manage your projects, teams, and tasks all in one place.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Plus className="text-blue-400" size={24} />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2">New Project</h3>
            <p className="text-gray-400 text-sm">Start a new project and invite your team</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Plus className="text-green-400" size={24} />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2">Create Team</h3>
            <p className="text-gray-400 text-sm">Build a new team for your projects</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Plus className="text-purple-400" size={24} />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2">Add Workspace</h3>
            <p className="text-gray-400 text-sm">Create a new workspace for your organization</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Settings className="text-orange-400" size={24} />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-400 text-sm">Manage your account and preferences</p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">Project {i}</h3>
                      <p className="text-sm text-gray-400">Last updated 2 hours ago</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-400">Active</span>
                      <p className="text-xs text-gray-400">5 tasks remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">John Doe</span> completed a task in{' '}
                        <span className="font-medium">Project Alpha</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{i} hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl mt-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Projects</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Team Members</span>
                  <span className="text-white font-semibold">25</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completed Tasks</span>
                  <span className="text-white font-semibold">148</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pending Tasks</span>
                  <span className="text-white font-semibold">32</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;