import { useEffect, useState } from 'react';
import { useServiceOptions } from '../../hooks/useServiceOptions';
import {
  useServiceActions,
  useServiceValidation,
} from '../../hooks/useServices';
import ServiceOptionForm from './ServiceOptionForm';
import ServiceOptionsList from './ServiceOptionsList';

const ServiceForm = ({
  service = null,
  onSuccess = () => {},
  onCancel = () => {},
  className = '',
  isNewlyCreated = false,
}) => {
  const { createService, updateService, loading, error } = useServiceActions();
  const { validateService } = useServiceValidation();

  // Load options for existing service
  const {
    options,
    loading: optionsLoading,
    reload: reloadOptions,
  } = useServiceOptions(service?.id, { autoLoad: !!service?.id });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    time_varies: false,
    price_varies: false,
    min_duration: null,
    max_duration: null,
    min_price: null,
    max_price: null,
    is_active: true,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Option management state
  const [showAddOption, setShowAddOption] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // Populate form when editing existing service
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration_minutes: service.duration_minutes || 30,
        price: service.price || 0,
        time_varies: service.time_varies || false,
        price_varies: service.price_varies || false,
        min_duration: service.min_duration || null,
        max_duration: service.max_duration || null,
        min_price: service.min_price || null,
        max_price: service.max_price || null,
        is_active: service.is_active ?? true,
      });
    }
  }, [service]);

  // Validate form whenever data changes (after first submit attempt)
  useEffect(() => {
    if (submitAttempted) {
      const validation = validateService(formData);
      setValidationErrors(validation.errors);
    }
  }, [formData, submitAttempted, validateService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Clear related fields when toggling variables
      if (field === 'time_varies' && !value) {
        updated.min_duration = null;
        updated.max_duration = null;
      }

      if (field === 'price_varies' && !value) {
        updated.min_price = null;
        updated.max_price = null;
      }

      return updated;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = validateService(formData);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    try {
      let result;
      if (service) {
        // Update existing service
        result = await updateService(service.id, formData);
      } else {
        // Create new service
        result = await createService(formData);
      }

      if (!result.error) {
        onSuccess(result.data);
        // Reset form if creating new service
        if (!service) {
          setFormData({
            name: '',
            description: '',
            duration_minutes: 30,
            price: 0,
            time_varies: false,
            price_varies: false,
            min_duration: null,
            max_duration: null,
            min_price: null,
            max_price: null,
            is_active: true,
          });
          setSubmitAttempted(false);
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  // Option management handlers
  const handleEditOption = option => {
    setEditingOption(option);
    setShowAddOption(false);
  };

  const handleAddOption = () => {
    setShowAddOption(true);
    setEditingOption(null);
  };

  const handleOptionSuccess = optionData => {
    setShowAddOption(false);
    setEditingOption(null);
    reloadOptions(); // Refresh the options list
  };

  const handleOptionCancel = () => {
    setShowAddOption(false);
    setEditingOption(null);
  };

  const handleOptionDelete = () => {
    reloadOptions(); // Refresh the options list after delete
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p className="mt-1 text-sm text-red-600">{error}</p>;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {service
            ? isNewlyCreated
              ? 'Enhance Your Service'
              : 'Edit Service'
            : 'Create New Service'}
        </h3>
        {isNewlyCreated && (
          <p className="mt-1 text-sm text-gray-600">
            Add service options or customize your "{service?.name}" service
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* General Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error {service ? 'updating' : 'creating'} service
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An unexpected error occurred'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Service Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              validationErrors.name ? 'border-red-300' : ''
            }`}
            placeholder="e.g., Haircut & Style"
            maxLength={255}
          />
          <ErrorMessage error={validationErrors.name} />
        </div>

        {/* Service Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              validationErrors.description ? 'border-red-300' : ''
            }`}
            placeholder="Describe your service..."
            maxLength={1000}
          />
          <ErrorMessage error={validationErrors.description} />
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Duration Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-gray-900">Duration</h4>
            <p className="text-sm text-gray-600">
              Set how long this service takes
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="time_varies"
              checked={formData.time_varies}
              onChange={e => handleInputChange('time_varies', e.target.checked)}
              className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="time_varies"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Duration varies (time range)
            </label>
          </div>

          {formData.time_varies ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="min_duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Minimum Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="min_duration"
                  min="1"
                  value={formData.min_duration || ''}
                  onChange={e =>
                    handleInputChange(
                      'min_duration',
                      parseInt(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                    validationErrors.min_duration ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.min_duration} />
              </div>

              <div>
                <label
                  htmlFor="max_duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Maximum Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="max_duration"
                  min="1"
                  value={formData.max_duration || ''}
                  onChange={e =>
                    handleInputChange(
                      'max_duration',
                      parseInt(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                    validationErrors.max_duration ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.max_duration} />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="duration_minutes"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration_minutes"
                min="1"
                value={formData.duration_minutes}
                onChange={e =>
                  handleInputChange(
                    'duration_minutes',
                    parseInt(e.target.value) || 0
                  )
                }
                className={`mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                  validationErrors.duration_minutes ? 'border-red-300' : ''
                }`}
              />
              <ErrorMessage error={validationErrors.duration_minutes} />
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-gray-900">Pricing</h4>
            <p className="text-sm text-gray-600">Set your service pricing</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="price_varies"
              checked={formData.price_varies}
              onChange={e =>
                handleInputChange('price_varies', e.target.checked)
              }
              className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="price_varies"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Price varies (price range)
            </label>
          </div>

          {formData.price_varies ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="min_price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Minimum Price ($) *
                </label>
                <input
                  type="number"
                  id="min_price"
                  min="0"
                  step="0.01"
                  value={formData.min_price || ''}
                  onChange={e =>
                    handleInputChange(
                      'min_price',
                      parseFloat(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                    validationErrors.min_price ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.min_price} />
              </div>

              <div>
                <label
                  htmlFor="max_price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Maximum Price ($) *
                </label>
                <input
                  type="number"
                  id="max_price"
                  min="0"
                  step="0.01"
                  value={formData.max_price || ''}
                  onChange={e =>
                    handleInputChange(
                      'max_price',
                      parseFloat(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                    validationErrors.max_price ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.max_price} />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e =>
                  handleInputChange('price', parseFloat(e.target.value) || 0)
                }
                className={`mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                  validationErrors.price ? 'border-red-300' : ''
                }`}
              />
              <ErrorMessage error={validationErrors.price} />
            </div>
          )}
        </div>

        {/* Active Status */}
        {service && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="is_active"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Service is active and bookable
            </label>
          </div>
        )}

        {/* Service Options Section */}
        {service && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900">
                  Service Options
                </h4>
                <p className="text-sm text-gray-600">
                  Add different options for this service (e.g., Full Extension,
                  Partial Extension)
                </p>
              </div>

              {!showAddOption && !editingOption && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Option
                </button>
              )}
            </div>

            {/* Options Onboarding Message */}
            {!options.length && !showAddOption && !editingOption && (
              <div className="bg-brand-50 border border-brand-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-brand-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-brand-800">
                      {isNewlyCreated
                        ? 'Want to offer multiple variations?'
                        : 'Want to offer multiple variations?'}
                    </h4>
                    <div className="mt-2 text-sm text-brand-700">
                      <p>
                        {isNewlyCreated
                          ? `Great start! Your "${service?.name}" service is ready. You can enhance it by adding service options to give customers multiple choices. For example:`
                          : 'You can add service options to give customers choices. For example, if this is a "Hair Extensions" service, you could add options like:'}
                      </p>
                      <ul className="mt-1 list-disc list-inside space-y-0.5">
                        <li>"Clip-in Extensions" - $75, 60 min</li>
                        <li>"Tape-in Extensions" - $200, 120 min</li>
                        <li>"Fusion Extensions" - $400, 180 min</li>
                      </ul>
                      <p className="mt-2">
                        <strong>This is completely optional.</strong> Your
                        service works perfectly as-is
                        {isNewlyCreated ? ' and is ready for bookings' : ''}!
                      </p>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                      >
                        {isNewlyCreated
                          ? 'Add Your First Option'
                          : 'Add Your First Option'}
                        <svg
                          className="ml-1.5 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Option Form */}
            {showAddOption && (
              <ServiceOptionForm
                serviceId={service.id}
                onSuccess={handleOptionSuccess}
                onCancel={handleOptionCancel}
              />
            )}

            {/* Edit Option Form */}
            {editingOption && (
              <ServiceOptionForm
                serviceId={service.id}
                option={editingOption}
                onSuccess={handleOptionSuccess}
                onCancel={handleOptionCancel}
              />
            )}

            {/* Options List */}
            {optionsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading options...</p>
              </div>
            ) : (
              <ServiceOptionsList
                options={options}
                onEdit={handleEditOption}
                onDelete={handleOptionDelete}
                showActions={true}
              />
            )}

            {/* Options Success Message */}
            {options.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
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
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">
                      Great! Your service has {options.length} option
                      {options.length !== 1 ? 's' : ''}
                    </h4>
                    <p className="mt-1 text-sm text-green-700">
                      Customers will be able to choose from these options when
                      booking "{service.name}".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Service Next Steps */}
        {!service && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  What happens next?
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  After creating your service, you'll be able to add different
                  options if you want to give customers multiple choices (like
                  different extension types or package sizes).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {service ? 'Updating...' : 'Creating...'}
              </>
            ) : service ? (
              'Update Service'
            ) : (
              'Create Service'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
