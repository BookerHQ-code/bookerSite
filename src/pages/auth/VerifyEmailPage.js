// src/pages/auth/VerifyEmailPage.js
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../../config/environment';
import { supabase } from '../../lib/supabase';

const VerifyEmailPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const email = location.state?.email || '';
  const role = location.state?.role || '';

  const handleResendVerification = async () => {
    if (!email) {
      setError('No email address provided');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: config.supabase.redirectTo,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = role => {
    const roleMap = {
      customer: 'Customer',
      stylist: 'Stylist',
      tenant_admin: 'Business Owner',
    };
    return roleMap[role] || 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your email address
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-6 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              We've sent a verification email to:
            </p>
            <p className="text-base font-medium text-gray-900 mb-2">{email}</p>
            {role && (
              <p className="text-sm text-gray-500 mb-6">
                Account type: {getRoleDisplayName(role)}
              </p>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                What to do next:
              </h3>
              <ol className="text-sm text-gray-600 text-left space-y-1">
                <li>1. Check your email inbox</li>
                <li>2. Look for an email from {config.app.name}</li>
                <li>3. Click the verification link in the email</li>
                <li>4. Return here to sign in</li>
              </ol>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full btn-secondary"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <Link to="/login" className="w-full btn-primary text-center">
                Go to Sign In
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try
                resending.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
