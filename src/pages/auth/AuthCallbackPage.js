// src/pages/auth/AuthCallbackPage.js
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/environment';
import { getTableName, supabase } from '../../lib/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const isProcessingRef = useRef(false);
  const hasCompletedRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    hasCompletedRef.current = hasCompleted;
  }, [hasCompleted]);
  // Function to create database records after email verification
  const createUserDatabaseRecords = async user => {
    try {
      console.log('🔄 Creating database records for verified user...');

      // Get user metadata from auth
      const userData = user.user_metadata || {};
      const role = userData.role;

      if (!role) {
        throw new Error('User role not found in metadata');
      }

      console.log('👤 Creating user record...');

      let userId = null;

      // Create user record
      const { data: userRecord, error: userError } = await supabase
        .from(getTableName('users'))
        .insert({
          auth_user_id: user.id,
          email: user.email,
        })
        .select()
        .single();

      if (userError) {
        // If user already exists, fetch it instead
        if (userError.code === '23505') {
          console.log('🔄 User record already exists, fetching...');
          const { data: existingUser, error: fetchError } = await supabase
            .from(getTableName('users'))
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (fetchError) throw fetchError;
          userId = existingUser.id;
        } else {
          throw userError;
        }
      } else {
        userId = userRecord.id;
      }

      if (!userId) {
        throw new Error('Could not get user ID');
      }

      console.log('✅ User record created/found');

      // Create role assignment using secure function
      console.log('🔄 Assigning user role...');
      const functionName = config.api.tablePrefix
        ? 'assign_testing_user_role'
        : 'assign_user_role';
      const { error: roleError } = await supabase.rpc(functionName, {
        user_uuid: userId,
        user_role: role,
      });

      if (roleError && !roleError.message?.includes('already assigned')) {
        throw roleError;
      }

      console.log('✅ Role assigned');

      // Create specific profile based on role
      console.log('🔄 Creating profile...');

      if (role === 'customer') {
        const { error: profileError } = await supabase
          .from(getTableName('customer_profiles'))
          .insert({
            user_id: userId,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || null,
          });

        if (profileError && profileError.code !== '23505') {
          throw profileError;
        }
      } else if (role === 'stylist') {
        const { error: profileError } = await supabase
          .from(getTableName('stylist_profiles'))
          .insert({
            user_id: userId,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || null,
            bio: userData.bio || null,
          });

        if (profileError && profileError.code !== '23505') {
          throw profileError;
        }
      } else if (role === 'tenant_admin') {
        const { error: profileError } = await supabase
          .from(getTableName('tenant_profiles'))
          .insert({
            user_id: userId,
            business_name: userData.business_name || '',
            bio: userData.bio || null,
            address: userData.address || null,
            phone: userData.phone || null,
          });

        if (profileError && profileError.code !== '23505') {
          throw profileError;
        }
      }

      console.log('✅ Profile created successfully');
      return true;
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    // ✅ STRONGER GUARD: Prevent multiple executions completely using refs
    if (isProcessingRef.current || hasCompletedRef.current) {
      console.log('⚠️ Already processing or completed, skipping...', {
        isProcessing: isProcessingRef.current,
        hasCompleted: hasCompletedRef.current,
      });
      return;
    }

    let mounted = true;

    const handleAuthCallback = async () => {
      // ✅ Set processing flag immediately and never allow re-execution using refs
      if (isProcessingRef.current) {
        console.log('⚠️ Already processing, aborting...');
        return;
      }

      // Update both state and ref
      setIsProcessing(true);
      isProcessingRef.current = true;

      try {
        console.log('🔄 Processing auth callback...');

        // Get the token from URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken =
          hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken =
          hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription =
          hashParams.get('error_description') ||
          searchParams.get('error_description');

        // Handle errors from the auth provider
        if (error) {
          console.error('Auth error:', error, errorDescription);
          setStatus('error');
          setMessage(
            errorDescription || 'An error occurred during authentication'
          );
          return;
        }

        // Handle different auth types
        if (type === 'signup') {
          // Email verification for new signup
          if (accessToken && refreshToken) {
            setMessage('Email verified! Setting up your account...');

            // Set the session with the tokens
            const { data, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage('Failed to verify email. Please try again.');
              return;
            }

            if (data.user && data.user.email_confirmed_at) {
              setMessage('Creating your account...');

              // ✅ GUARD: Check if user already has database records
              try {
                const { data: existingUser } = await supabase
                  .from(getTableName('users'))
                  .select('id')
                  .eq('auth_user_id', data.user.id)
                  .maybeSingle();

                if (existingUser) {
                  console.log(
                    '✅ User database records already exist, skipping creation'
                  );
                  setStatus('success');
                  setMessage('Welcome back! Redirecting to dashboard...');

                  setTimeout(() => {
                    if (mounted) {
                      navigate('/dashboard', { replace: true });
                    }
                  }, 2000);
                  return;
                }
              } catch (checkError) {
                console.log(
                  '📝 Could not check existing user, proceeding with creation...'
                );
              }

              // Create database records now that email is verified
              try {
                await createUserDatabaseRecords(data.user);

                setStatus('success');
                setMessage(
                  'Account created successfully! Redirecting to dashboard...'
                );

                // Wait a moment then redirect to dashboard
                setTimeout(() => {
                  if (mounted) {
                    navigate('/dashboard', { replace: true });
                  }
                }, 2000);
              } catch (dbError) {
                console.error('Database setup failed:', dbError);
                setStatus('error');
                setMessage(
                  'Email verified but account setup failed. Please contact support or try signing in.'
                );

                // Still redirect to login after delay
                setTimeout(() => {
                  if (mounted) {
                    navigate('/login', {
                      state: {
                        verified: true,
                        setupFailed: true,
                      },
                    });
                  }
                }, 3000);
              }
            } else {
              setStatus('error');
              setMessage('Email verification failed. Please try again.');
            }
          } else {
            setStatus('error');
            setMessage('Invalid verification link. Please try again.');
          }
        } else if (type === 'recovery') {
          // Password reset flow
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage('Invalid reset link. Please try again.');
              return;
            }

            setStatus('success');
            setMessage('Password reset link verified! Redirecting...');

            setTimeout(() => {
              if (mounted) {
                navigate('/auth/reset-password', { replace: true });
              }
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Invalid reset link. Please try again.');
          }
        } else {
          // Handle other auth flows or direct access
          const { data, error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            return;
          }

          if (data.session && data.session.user) {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');

            setTimeout(() => {
              if (mounted) {
                navigate('/dashboard', { replace: true });
              }
            }, 2000);
          } else {
            setStatus('error');
            setMessage('No valid session found. Please sign in again.');

            setTimeout(() => {
              if (mounted) {
                navigate('/login', { replace: true });
              }
            }, 3000);
          }
        }

        // Mark as completed after successful processing
        if (mounted) {
          setHasCompleted(true);
          hasCompletedRef.current = true;
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');

        setTimeout(() => {
          if (mounted) {
            navigate('/login', { replace: true });
          }
        }, 3000);

        // Mark as completed even on error to prevent retry loops
        if (mounted) {
          setHasCompleted(true);
          hasCompletedRef.current = true;
        }
      }
    };

    // Start the callback handling
    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="mx-auto w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {status === 'verifying' && 'Setting Up Account'}
            {status === 'success' && 'Account Created!'}
            {status === 'error' && 'Setup Failed'}
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6">{getStatusIcon()}</div>

            <p className={`text-sm mb-6 ${getStatusColor()}`}>{message}</p>

            {status === 'error' && (
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary"
                >
                  Go to Sign In
                </button>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full btn-secondary"
                >
                  Try Sign Up Again
                </button>
              </div>
            )}

            {status === 'verifying' && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  This may take a few moments...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
