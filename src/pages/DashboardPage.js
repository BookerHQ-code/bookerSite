import { Link } from 'react-router-dom';
import config from '../config/environment';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, userProfile, userRoles, isCustomer, isStylist, isTenantAdmin } =
    useAuth();

  const getRoleDisplayName = role => {
    const roleMap = {
      customer: 'Customer',
      stylist: 'Stylist',
      tenant_admin: 'Business Owner',
      partner_admin: 'Partner Admin',
      super_admin: 'Super Admin',
    };
    return roleMap[role] || role;
  };

  const getWelcomeMessage = () => {
    if (isCustomer()) {
      return `Welcome back${userProfile?.customer?.first_name ? `, ${userProfile.customer.first_name}` : ''}!`;
    } else if (isStylist()) {
      return `Welcome back${userProfile?.stylist?.first_name ? `, ${userProfile.stylist.first_name}` : ''}!`;
    } else if (isTenantAdmin()) {
      return `Welcome back${userProfile?.tenant?.business_name ? `, ${userProfile.tenant.business_name}` : ''}!`;
    }
    return 'Welcome back!';
  };

  const getNextSteps = () => {
    const steps = [];

    if (isCustomer()) {
      steps.push(
        { text: 'Browse available stylists', href: '/browse' },
        { text: 'Book your first appointment', href: '/book' },
        { text: 'Complete your profile', href: '/profile' }
      );
    } else if (isStylist()) {
      steps.push(
        { text: 'Set up your services', href: '/services' },
        { text: 'Configure your availability', href: '/availability' },
        { text: 'Complete your profile', href: '/profile' }
      );
    } else if (isTenantAdmin()) {
      steps.push(
        { text: 'Set up your business profile', href: '/profile' },
        { text: 'Add your stylists', href: '/stylists' },
        { text: 'Configure store hours', href: '/settings' }
      );
    }

    return steps.length
      ? steps
      : [{ text: 'Complete your profile setup', href: '/profile' }];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            {getWelcomeMessage()}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your {config.app.name} account today.
          </p>
        </div>

        {/* Main content */}
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions for Stylists */}
          {isStylist() && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Ready to start offering services?
                    </h3>
                    <p className="text-brand-100">
                      Set up your service offerings and start accepting
                      bookings.
                    </p>
                  </div>
                  <Link
                    to="/services"
                    className="bg-white text-brand-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Manage Services
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Information
                  </h3>

                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.email}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Account Type
                      </dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {userRoles.map(role => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
                            >
                              {getRoleDisplayName(role)}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Member Since
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'Unknown'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email Verified
                      </dt>
                      <dd className="mt-1">
                        {user?.email_confirmed_at ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Verified
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Next Steps
                  </h3>

                  <ul className="space-y-3">
                    {getNextSteps().map((step, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-brand-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          {step.href ? (
                            <Link
                              to={step.href}
                              className="text-sm text-gray-600 hover:text-brand-600 transition-colors duration-200"
                            >
                              {step.text}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-600">
                              {step.text}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <button className="w-full btn-primary text-sm">
                      Complete Setup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  More Features Coming Soon!
                </h3>
                <p className="text-sm text-gray-600">
                  We're working hard to bring you the full {config.app.name}{' '}
                  experience. Stay tuned for appointments, bookings, and more!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
