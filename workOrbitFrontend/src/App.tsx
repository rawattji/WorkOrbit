import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerifiaction.tsx';
import CreateOrMapUserToWorkspacePage from './components/Workspace/CreateOrMapUserToWorkspacePage.tsx';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/onboarding" element={<CreateOrMapUserToWorkspacePage />} />
            <Route 
              path="/dashboard" 
              element={<Dashboard />} 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'toast-container',
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;