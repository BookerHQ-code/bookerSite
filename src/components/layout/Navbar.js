import { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config/environment';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Auth hooks - properly placed inside the component
  const { user, userProfile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.customer?.first_name) {
      return userProfile.customer.first_name;
    }
    if (userProfile?.stylist?.first_name) {
      return userProfile.stylist.first_name;
    }
    if (userProfile?.tenant?.business_name) {
      return userProfile.tenant.business_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {config.app.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>

              {user ? (
                // Authenticated user menu
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>

                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {loading ? 'Loading...' : getUserDisplayName()}
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                            {user?.email}
                          </div>
                          <Link
                            to="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Non-authenticated user menu
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-brand-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              to="/"
              className="text-gray-600 hover:text-brand-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {user ? (
              // Authenticated mobile menu
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-brand-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">
                      {loading ? 'Loading...' : getUserDisplayName()}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-brand-600"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              // Non-authenticated mobile menu
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-brand-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="btn-primary text-sm inline-block">
                    Get Started
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Environment indicator for non-production */}
      {!config.isProduction && (
        <div className="bg-yellow-400 text-yellow-900 text-xs px-4 py-1 text-center font-medium">
          {config.environment.toUpperCase()} ENVIRONMENT
        </div>
      )}
    </nav>
  );
};

export default Navbar;
