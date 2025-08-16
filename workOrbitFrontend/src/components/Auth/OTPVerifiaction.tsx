import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthApi } from '../../services/api/AuthApi';
import toast from 'react-hot-toast';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get email from location.state first, fallback to localStorage
  const emailFromState = location.state?.email || null;
  const emailFromStorage = localStorage.getItem('pending_verification_email');
  const email = emailFromState || emailFromStorage;

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please start registration again.');
      navigate('/register');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to verify OTP
      const response = await AuthApi.verifyOTP({ email, otp });

      if (!response.success) {
        toast.error(response.message || 'Invalid OTP');
        return;
      }

      // Store token & user
      const token = response.data?.token;
      const user = response.data?.user;
      if (token) localStorage.setItem('workorbit_token', token);
      if (user) localStorage.setItem('workorbit_user', JSON.stringify(user));

      // Remove pending email
      localStorage.removeItem('pending_verification_email');

      toast.success('Account verified successfully!');

      // Navigate to onboarding wizard
      navigate('/onboarding');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    // Session expired UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Session Expired</h2>
          <p className="text-gray-300 mb-6">Please start the registration process again.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Verify Your Account
            </h2>
            <p className="text-gray-300">
              Enter the OTP sent to <span className="text-purple-400">{email}</span>
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                autoFocus
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={!otp.trim() || isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/register')}
                className="text-purple-400 hover:text-white text-sm transition-colors"
              >
                Back to Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
