// src/pages/ServicesPage.js
import { useState } from 'react';
import ServiceFormModal from '../components/services/ServiceFormModal';
import ServiceList from '../components/services/ServiceList';
import { useAuth } from '../contexts/AuthContext';
import { useUserServices } from '../hooks/useServices';

const ServicesPage = () => {
  const { isStylist, userProfile } = useAuth();
  const { services, loading, error, reload } = useUserServices({
    includeInactive: true,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const handleCreateClick = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEditClick = service => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleModalSuccess = serviceData => {
    setShowModal(false);
    setEditingService(null);
    reload(); // Refresh the services list
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleDelete = () => {
    reload(); // Refresh the services list after delete
  };

  // Check if user can create services
  const canCreateServices = isStylist() && userProfile?.stylist;

  if (!canCreateServices) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Access Restricted
              </h3>
              <p className="text-gray-600 mb-4">
                You need a stylist profile to create and manage services.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
              <p className="mt-2 text-gray-600">
                Manage your service offerings and pricing.
              </p>
            </div>

            <button
              onClick={handleCreateClick}
              className="btn-primary flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Service
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          {/* Services List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Your Services ({services.length})
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your services...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error Loading Services
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {error.message || 'Unable to load your services'}
                  </p>
                  <button onClick={reload} className="btn-primary">
                    Try Again
                  </button>
                </div>
              ) : (
                <ServiceList
                  services={services}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  showActions={true}
                />
              )}
            </div>
          </div>

          {/* Empty State */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first service offering.
              </p>
              <button onClick={handleCreateClick} className="btn-primary">
                Create Your First Service
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={showModal}
        service={editingService}
        onSuccess={handleModalSuccess}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default ServicesPage;
