// ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';
import { passwordResetService } from '../../services/passwordResetService';
import { usersService } from '../../services/usersService';
import PasswordForm from './PasswordForm';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase'; // Ajuste le chemin selon ton projet

const ForgotPassword = () => {
  const { setAuthPage, showNotification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, code, reset, success
  const [resetInfo, setResetInfo] = useState(null);


  // Check if we're in a reset process
  useEffect(() => {
    const checkResetStatus = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const resetId = params.get('resetId');
        const codeParam = params.get('code');

        if (resetId && codeParam) {
          // Automatically validate code if present in URL
          setCode(codeParam);
          const result = await passwordResetService.verifyResetCode(resetId, codeParam);

          if (result.valid) {
            setResetInfo({ 
              resetId,
              email: result.email,
              code: codeParam
            });
            setStatus('reset');
          } else {
            setError(result.error || 'The reset link is invalid or has expired.');
            setStatus('error');
          }
        } else if (resetId) {
          // If only resetId is present, show code entry screen
          const resetDoc = await passwordResetService.getResetDocument(resetId);
          if (resetDoc && resetDoc.status === 'pending') {
            setResetInfo({ resetId });
            setStatus('code');
          } else {
            setError('The reset link is invalid or has expired.');
            setStatus('error');
          }
        }
      } catch (err) {
        console.error('Error checking reset status:', err);
        setError('An error occurred while checking the reset link.');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    checkResetStatus();
  }, []);

  // Reset code validation
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!code.trim() || !resetInfo?.resetId) {
      setError('Please enter the reset code');
      return;
    }

    setLoading(true);

    try {
      const result = await passwordResetService.verifyResetCode(resetInfo.resetId, code);

      if (result.valid) {
        setResetInfo({ 
          ...resetInfo,
          email: result.email,
          code
        });
        setStatus('reset');
      } else {
        setError('Invalid reset code');
      }
    } catch (err) {
      setError(err.message || 'Error validating code');
    } finally {
      setLoading(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async ({ password }) => {
    try {
      setLoading(true);
      setError('');

      if (!resetInfo || !resetInfo.resetId) {
        throw new Error('Missing reset data');
      }

      // Confirm password reset
      await passwordResetService.confirmReset(resetInfo.resetId, password);

      // Show notification and redirect
      showNotification('Your password has been reset successfully', 'success');

      // Redirect to login page after a pause
      setTimeout(() => {
        setAuthPage('login');
      }, 2000);

    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'An error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      // Check if user exists and is not deleted
      const userCheck = await usersService.getUserByEmail(email);

      if (userCheck && userCheck.deleted) {
        // Simulate success even if user is deleted (for security reasons)
        setStatus('success');
        return;
      }

      if (!userCheck) {
        // Simulate success even if user doesn't exist (for security reasons)
        setStatus('success');
        return;
      }

      // User exists, proceed with reset
      await passwordResetService.requestPasswordReset(email);
      setStatus('success');

      // Notification
      showNotification(
        'A password reset email has been sent to your email address. Please check your inbox.', 
        'success',
        5000
      );
    } catch (err) {
      console.error('Error requesting password reset:', err);
      // For security reasons, don't disclose specific information
      setStatus('success'); // Even in case of error, show success to user
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Display code entry screen
  if (status === 'code') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Verify Code
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Please enter the reset code received by email.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reset Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter the code received by email"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              Verify Code
            </button>

            <button
              type="button"
              onClick={() => setAuthPage('login')}
              className="w-full text-gray-600 hover:text-gray-700 py-2 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Display password reset form
  if (status === 'reset') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Set New Password
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Please enter your new password below.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          <PasswordForm 
            onSubmit={handlePasswordSubmit}
            buttonText="Reset Password"
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // Default display (reset request or confirmation of sending)
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Your Password
        </h2>
        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>
                If an account exists with this email address, you will receive instructions to reset your password.
              </p>
              <p className="mt-2">
                Please check your inbox and spam folder.
              </p>
            </div>
            <button
              onClick={() => setAuthPage('login')}
              className="text-amber-600 hover:text-amber-700 mt-4 flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {status === 'loading' ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-4 w-4 mr-2" />
                  <span>Send Instructions</span>
                </div>
              )}
            </button>
           
           
            <button
              type="button"
              onClick={() => setAuthPage('login')}
              className="w-full text-gray-600 hover:text-gray-700 py-2 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;