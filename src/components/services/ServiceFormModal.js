//
import { useEffect, useState } from 'react';
import { useServiceOptions } from '../../hooks/useServiceOptions';
import {
  useServiceActions,
  useServiceValidation,
} from '../../hooks/useServices';
import ServiceOptionForm from './ServiceOptionForm';
import ServiceOptionsList from './ServiceOptionsList';

const ServiceFormModal = ({
  isOpen = false,
  service = null,
  onSuccess = () => {},
  onClose = () => {},
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
    has_options: false, // New field for options
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Option management state
  const [showAddOption, setShowAddOption] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && !service) {
      // Reset for new service
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
        has_options: false,
      });
      setValidationErrors({});
      setSubmitAttempted(false);
      setShowAddOption(false);
      setEditingOption(null);
    }
  }, [isOpen, service]);

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
        has_options: service.has_options || false,
      });
    }
  }, [service]);

  // Custom validation for services with options
  const validateServiceWithOptions = data => {
    const errors = {};

    // Required fields
    if (!data.name?.trim()) {
      errors.name = 'Service name is required';
    }

    // If service does NOT have options, validate price/duration normally
    if (!data.has_options) {
      // Duration validation
      if (!data.time_varies) {
        if (!data.duration_minutes || data.duration_minutes <= 0) {
          errors.duration_minutes = 'Duration must be greater than 0';
        }
      }

      // Price validation - conditional based on price_varies
      if (!data.price_varies) {
        if (data.price === undefined || data.price === null || data.price < 0) {
          errors.price = 'Price must be 0 or greater';
        }
      }

      // Variable timing validation
      if (data.time_varies) {
        if (!data.min_duration || data.min_duration <= 0) {
          errors.min_duration = 'Minimum duration is required when time varies';
        }
        if (!data.max_duration || data.max_duration <= 0) {
          errors.max_duration = 'Maximum duration is required when time varies';
        }
        if (
          data.min_duration &&
          data.max_duration &&
          data.min_duration > data.max_duration
        ) {
          errors.max_duration =
            'Maximum duration must be greater than minimum duration';
        }
      }

      // Variable pricing validation
      if (data.price_varies) {
        if (
          data.min_price === undefined ||
          data.min_price === null ||
          data.min_price < 0
        ) {
          errors.min_price = 'Minimum price is required when price varies';
        }
        if (
          data.max_price === undefined ||
          data.max_price === null ||
          data.max_price < 0
        ) {
          errors.max_price = 'Maximum price is required when price varies';
        }
        if (
          data.min_price !== undefined &&
          data.max_price !== undefined &&
          data.min_price > data.max_price
        ) {
          errors.max_price = 'Maximum price must be greater than minimum price';
        }
      }
    }

    // String length validations
    if (data.name && data.name.length > 255) {
      errors.name = 'Service name must be less than 255 characters';
    }

    if (data.description && data.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  // Validate form whenever data changes (after first submit attempt)
  useEffect(() => {
    if (submitAttempted) {
      const validation = validateServiceWithOptions(formData);
      setValidationErrors(validation.errors);
    }
  }, [formData, submitAttempted]);

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

      // When toggling has_options, set default values for pricing/timing
      if (field === 'has_options') {
        if (value) {
          // Service has options - set minimal base pricing/timing
          updated.price = 0;
          updated.duration_minutes = 30;
          updated.time_varies = false;
          updated.price_varies = false;
          updated.min_duration = null;
          updated.max_duration = null;
          updated.min_price = null;
          updated.max_price = null;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = validateServiceWithOptions(formData);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    // For services with options, ensure base price/duration exist
    let submitData = { ...formData };
    if (formData.has_options) {
      // Set minimal base values that won't be shown to customers
      submitData.price = 0;
      submitData.duration_minutes = 30;
    }

    try {
      let result;
      if (service) {
        // Update existing service
        result = await updateService(service.id, submitData);
      } else {
        // Create new service
        result = await createService(submitData);
      }

      if (!result.error) {
        onSuccess(result.data);
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
    reloadOptions();
  };

  const handleOptionCancel = () => {
    setShowAddOption(false);
    setEditingOption(null);
  };

  const handleOptionDelete = () => {
    reloadOptions();
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p className="mt-1 text-sm text-red-600">{error}</p>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal positioning */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {service ? 'Edit Service' : 'Create New Service'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-h-96 overflow-y-auto"
          >
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

            {/* Has Options Checkbox */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="has_options"
                    checked={formData.has_options}
                    onChange={e =>
                      handleInputChange('has_options', e.target.checked)
                    }
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                </div>
                <div className="ml-3">
                  <label
                    htmlFor="has_options"
                    className="text-sm font-medium text-blue-900"
                  >
                    Does this service have multiple options or sub-services?
                  </label>
                  <p className="text-sm text-blue-700 mt-1">
                    For example, "Hair Extensions" might have options like
                    "Clip-in", "Tape-in", "Fusion" - each with different pricing
                    and timing.
                  </p>
                </div>
              </div>
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

            {/* Show pricing/duration fields only if NOT has_options */}
            {!formData.has_options && (
              <>
                {/* Duration Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-base font-medium text-gray-900">
                      Duration
                    </h4>
                    <p className="text-sm text-gray-600">
                      Set how long this service takes
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="time_varies"
                      checked={formData.time_varies}
                      onChange={e =>
                        handleInputChange('time_varies', e.target.checked)
                      }
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
                            validationErrors.min_duration
                              ? 'border-red-300'
                              : ''
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
                            validationErrors.max_duration
                              ? 'border-red-300'
                              : ''
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
                          validationErrors.duration_minutes
                            ? 'border-red-300'
                            : ''
                        }`}
                      />
                      <ErrorMessage error={validationErrors.duration_minutes} />
                    </div>
                  )}
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-base font-medium text-gray-900">
                      Pricing
                    </h4>
                    <p className="text-sm text-gray-600">
                      Set your service pricing
                    </p>
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
                          handleInputChange(
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                          validationErrors.price ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage error={validationErrors.price} />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Service Options Section - Only show if has_options is checked AND service exists */}
            {formData.has_options && service && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      Service Options
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add different options with their own pricing and timing
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
                    <p className="mt-2 text-sm text-gray-600">
                      Loading options...
                    </p>
                  </div>
                ) : (
                  <ServiceOptionsList
                    options={options}
                    onEdit={handleEditOption}
                    onDelete={handleOptionDelete}
                    showActions={true}
                  />
                )}
              </div>
            )}

            {/* Info message for services with options */}
            {formData.has_options && !service && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
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
                    <h4 className="text-sm font-medium text-yellow-800">
                      Service options will be available after creation
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      First create your base service, then you'll be able to add
                      individual options with their own pricing and timing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active Status - only show for existing services */}
            {service && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e =>
                    handleInputChange('is_active', e.target.checked)
                  }
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
          </form>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={loading}
            >
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
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;
