import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config/environment';
import { supabase } from '../../lib/supabase';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Customer fields
    firstName: '',
    lastName: '',
    phone: '',
    // Business fields
    businessName: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [successRole, setSuccessRole] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Book appointments with stylists',
      icon: '👤',
      color: 'brand',
    },
    {
      id: 'stylist',
      title: 'Stylist',
      description: 'Offer your services to customers',
      icon: '✂️',
      color: 'accent',
    },
    {
      id: 'tenant_admin',
      title: 'Business Owner',
      description: 'Manage your salon and stylists',
      icon: '🏢',
      color: 'green',
    },
  ];

  const isFormValid = () => {
    // Basic validation for all roles
    const basicValid =
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      !emailError &&
      !emailChecking;

    if (!basicValid) return false;

    // Role-specific validation
    if (selectedRole === 'customer' || selectedRole === 'stylist') {
      return formData.firstName && formData.lastName;
    }

    if (selectedRole === 'tenant_admin') {
      return (
        formData.businessName &&
        formData.address &&
        formData.city &&
        formData.state &&
        formData.country &&
        formData.postal_code
      );
    }

    return true;
  };

  const checkEmailExists = async email => {
    if (!email || !email.includes('@') || email.length < 5) return;

    setEmailChecking(true);

    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        check_email: email.toLowerCase().trim(),
      });

      if (error) {
        console.log('Email check error:', error);
        return;
      }

      if (data === true) {
        setEmailError(
          'An account with this email already exists. Please sign in instead.'
        );
      }
    } catch (error) {
      console.log('Email check network error (ignored):', error);
    } finally {
      setEmailChecking(false);
    }
  };

  const timeoutRef = useRef(null); // Add this with your other refs/state

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError(''); // Clear general error when user types

    if (e.target.name === 'email') {
      setEmailError('');
      setEmailChecking(false);

      // ✅ Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // ✅ Set new timeout with ref for cleanup
      timeoutRef.current = setTimeout(() => {
        checkEmailExists(e.target.value);
      }, 1000); // Check 1 second after user stops typing
    }
  };

  // Add this useEffect to cleanup timeout on unmount:
  useEffect(() => {
    return () => {
      // Cleanup timeout when component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update your validateForm function to include address validation:
  const validateForm = () => {
    if (!selectedRole) {
      setError('Please select your role');
      return false;
    }

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    // Role-specific validation
    if (selectedRole === 'customer' || selectedRole === 'stylist') {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
        return false;
      }
    }

    if (selectedRole === 'tenant_admin') {
      if (!formData.businessName) {
        setError('Business name is required');
        return false;
      }

      // ✅ NEW: Validate address fields for business tenants
      if (!formData.address) {
        setError('Street address is required');
        return false;
      }

      if (!formData.city) {
        setError('City is required');
        return false;
      }

      if (!formData.state) {
        setError('State/Province is required');
        return false;
      }

      if (!formData.country) {
        setError('Country is required');
        return false;
      }

      if (!formData.postal_code) {
        setError('Postal code is required');
        return false;
      }
    }

    return true;
  };

  const getRoleDisplayName = role => {
    const roleMap = {
      customer: 'Customer',
      stylist: 'Stylist',
      tenant_admin: 'Business Owner',
    };
    return roleMap[role] || role;
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      businessName: '',
      bio: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    });

    setEmailError('');
  };

  // const sendWelcomeEmail = async (email, name) => {
  //   if (
  //     !config.loops.apiKey ||
  //     !config.loops.transactionalIds.emailVerification
  //   ) {
  //     console.log('Loops not configured, skipping welcome email');
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${config.loops.baseUrl}/transactional`, {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${config.loops.apiKey}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         transactionalId: config.loops.transactionalIds.emailVerification,
  //         email: email,
  //         dataVariables: {
  //           name: name,
  //           role: selectedRole,
  //           appName: config.app.name,
  //         },
  //       }),
  //     });

  //     if (!response.ok) {
  //       console.error('Failed to send welcome email via Loops');
  //     }
  //   } catch (error) {
  //     console.error('Error sending welcome email:', error);
  //   }
  // };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setEmailError('');

    try {
      console.log('🔄 Starting signup process...');

      // Sign up with Supabase Auth - this sends the verification email
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: config.supabase.redirectTo,
          data: {
            // Store form data in auth metadata for later use
            role: selectedRole,
            first_name: formData.firstName,
            last_name: formData.lastName,
            business_name: formData.businessName,
            phone: formData.phone,
            bio: formData.bio,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postal_code,
          },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.includes('User already registered') ||
          signUpError.message.includes('already been registered') ||
          signUpError.code === 'user_already_exists'
        ) {
          // console.log('❌ Email already exists:', signUpError.message);
          setEmailError(
            'An account with this email already exists. Please sign in instead.'
          );
          return;
        }

        throw signUpError;
      }

      // console.log('✅ Supabase signup successful - verification email sent!');

      if (data.user) {
        console
          .log
          // '✅ Showing success modal - database operations deferred until verification'
          ();

        // Show success modal immediately - no database operations yet
        setSuccessEmail(formData.email);
        setSuccessRole(selectedRole);
        setShowSuccessModal(true);

        // Clear form fields after success
        clearForm();
      } else {
        throw new Error('No user data returned from signup');
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      setError(error.message || 'An error occurred during sign up');
    } finally {
      // console.log('🔄 Clearing loading state');
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Join {config.app.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose how you'd like to use our platform
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-${role.color}-300 focus:outline-none focus:ring-2 focus:ring-${role.color}-500 focus:border-${role.color}-500 transition-all`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{role.icon}</div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {role.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {role.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-brand-600 hover:text-brand-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <button
            onClick={() => setSelectedRole('')}
            className="mb-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to role selection
          </button>
          <div className="text-4xl mb-2">{selectedRoleData.icon}</div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sign up as {selectedRoleData.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {selectedRoleData.description}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Error Display Section */}
            {emailError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Email Already Registered
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {emailError}
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <Link
                          to="/login"
                          className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                        >
                          Sign In Instead
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email and Password */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 ${
                    emailError
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {/* ✅ Loading spinner when checking email */}
                {emailChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {/* Email-specific error message */}
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Enhanced Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-3.122-3.122l7.071-7.071m0 0a3 3 0 00-4.243 4.243m4.243-4.243L9.878 9.878"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-3.122-3.122l7.071-7.071m0 0a3 3 0 00-4.243 4.243m4.243-4.243L9.878 9.878"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role-specific fields */}
            {(selectedRole === 'customer' || selectedRole === 'stylist') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedRole === 'tenant_admin' && (
              <>
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                {/* ✅ Updated: Address fields now required */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required // ✅ Added required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required // ✅ Added required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State / Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required // ✅ Added required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      required // ✅ Added required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postal_code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      required // ✅ Added required
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Optional fields */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {(selectedRole === 'stylist' ||
              selectedRole === 'tenant_admin') && (
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bio (optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Tell us about yourself or your business..."
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !!emailError}
                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading || emailError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300 hover:bg-gray-300' // ✅ Prevent hover effect when disabled
                    : 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500'
                }`}
                title={
                  emailError
                    ? 'Cannot create account - email already exists'
                    : ''
                } // ✅ Tooltip on hover
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* ✅ Specific helper text based on what's wrong */}
              {emailError && (
                <p className="mt-3 text-sm text-center text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                  <svg
                    className="inline w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  This email is already registered -
                  <Link
                    to="/login"
                    className="underline hover:no-underline ml-1"
                  >
                    sign in instead
                  </Link>
                </p>
              )}

              {emailChecking && (
                <p className="mt-2 text-sm text-center text-blue-600">
                  Verifying email availability...
                </p>
              )}

              {!isFormValid() &&
                !emailError &&
                !emailChecking &&
                formData.email && (
                  <p className="mt-2 text-xs text-center text-gray-500">
                    {(() => {
                      if (selectedRole === 'tenant_admin') {
                        const missing = [];
                        if (!formData.businessName)
                          missing.push('business name');
                        if (!formData.address) missing.push('address');
                        if (!formData.city) missing.push('city');
                        if (!formData.state) missing.push('state/province');
                        if (!formData.country) missing.push('country');
                        if (!formData.postal_code) missing.push('postal code');

                        if (missing.length > 0) {
                          return `Please complete: ${missing.join(', ')}`;
                        }
                      }

                      if (
                        (selectedRole === 'customer' ||
                          selectedRole === 'stylist') &&
                        (!formData.firstName || !formData.lastName)
                      ) {
                        return 'Please enter your first and last name';
                      }

                      if (formData.password !== formData.confirmPassword) {
                        return 'Passwords must match';
                      }

                      return 'Complete all required fields to create account';
                    })()}
                  </p>
                )}
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-brand-600 hover:text-brand-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Verification Email Sent!
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  We've sent a verification link to:
                </p>
                <p className="text-base font-medium text-gray-900 mb-2">
                  {successEmail}
                </p>
                {successRole && (
                  <p className="text-sm text-gray-500 mb-4">
                    Account type: {getRoleDisplayName(successRole)}
                  </p>
                )}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 text-left">
                    <strong>Next steps:</strong>
                    <br />
                    1. Check your email inbox
                    <br />
                    2. Click the verification link
                    <br />
                    3. Complete account setup
                    <br />
                    4. Sign in to your dashboard
                  </p>
                </div>
              </div>
              <div className="items-center px-4 py-3 space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary"
                >
                  Go to Sign In
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
