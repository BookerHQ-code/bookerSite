// src/components/services/ServiceList.js
import { useState } from 'react';
import { useServiceActions } from '../../hooks/useServices';

const ServiceList = ({
  services = [],
  onEdit = () => {},
  onDelete = () => {},
  showActions = true,
  className = '',
}) => {
  const { deleteService, activateService } = useServiceActions();
  const [actionLoading, setActionLoading] = useState(null);

  const formatPrice = service => {
    // If service has options, show effective price range
    if (
      service.has_options &&
      service.effective_min_price !== null &&
      service.effective_max_price !== null
    ) {
      if (service.effective_min_price === service.effective_max_price) {
        return `${service.effective_min_price}`;
      }
      return `${service.effective_min_price} - ${service.effective_max_price}`;
    }

    // Otherwise show service price (with variations)
    if (
      service.price_varies &&
      service.min_price !== null &&
      service.max_price !== null
    ) {
      return `${service.min_price} - ${service.max_price}`;
    }
    return `${service.price}`;
  };

  const formatDuration = service => {
    if (service.time_varies && service.min_duration && service.max_duration) {
      return `${service.min_duration} - ${service.max_duration} min`;
    }
    return `${service.duration_minutes} min`;
  };

  const handleToggleActive = async service => {
    setActionLoading(service.id);
    try {
      if (service.is_active) {
        await deleteService(service.id, true); // Soft delete
      } else {
        await activateService(service.id);
      }
      onDelete(); // Trigger refresh
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
    setActionLoading(null);
  };

  const handleHardDelete = async service => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete this service? This action cannot be undone.'
      )
    ) {
      setActionLoading(service.id);
      try {
        await deleteService(service.id, false); // Hard delete
        onDelete(); // Trigger refresh
      } catch (error) {
        console.error('Error deleting service:', error);
      }
      setActionLoading(null);
    }
  };

  if (!services.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
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
        <p className="text-gray-600">
          Get started by creating your first service offering.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {services.map(service => (
        <div
          key={service.id}
          className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
            service.is_active
              ? 'border-gray-200 hover:shadow-md'
              : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Service Header */}
                <div className="flex items-center space-x-3 mb-2">
                  <h3
                    className={`text-lg font-medium truncate ${
                      service.is_active ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {service.name}
                  </h3>

                  <div className="flex items-center space-x-2">
                    {!service.is_active && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}

                    {service.has_options && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {service.option_count} Option
                        {service.option_count !== 1 ? 's' : ''}
                      </span>
                    )}

                    {service.time_varies && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Variable Time
                      </span>
                    )}

                    {service.price_varies && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Variable Price
                      </span>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {formatDuration(service)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <span className="font-medium text-brand-600">
                      {formatPrice(service)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created {new Date(service.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Description */}
                {service.description && (
                  <p
                    className={`text-sm mb-3 line-clamp-2 ${
                      service.is_active ? 'text-gray-600' : 'text-gray-500'
                    }`}
                  >
                    {service.description}
                  </p>
                )}

                {/* Variable Pricing/Timing Details */}
                {(service.time_varies ||
                  service.price_varies ||
                  service.has_options) && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2 space-y-1">
                    {service.has_options && (
                      <div className="font-medium text-purple-600">
                        Service offers {service.option_count} option
                        {service.option_count !== 1 ? 's' : ''} for customers to
                        choose from
                      </div>
                    )}
                    {service.time_varies && (
                      <div>
                        Duration varies from {service.min_duration} to{' '}
                        {service.max_duration} minutes
                      </div>
                    )}
                    {service.price_varies && (
                      <div>
                        Price varies from ${service.min_price} to $
                        {service.max_price}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(service)}
                    className="p-2 text-gray-400 hover:text-brand-600 transition-colors duration-200"
                    title="Edit service"
                    disabled={actionLoading === service.id}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`p-2 transition-colors duration-200 ${
                      service.is_active
                        ? 'text-gray-400 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                    title={
                      service.is_active
                        ? 'Deactivate service'
                        : 'Activate service'
                    }
                    disabled={actionLoading === service.id}
                  >
                    {actionLoading === service.id ? (
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : service.is_active ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => handleHardDelete(service)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete service permanently"
                    disabled={actionLoading === service.id}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
