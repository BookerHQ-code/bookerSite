import { useEffect, useState } from 'react';
import {
  useServiceOptionActions,
  useServiceOptionValidation,
} from '../../hooks/useServiceOptions';

const ServiceOptionForm = ({
  serviceId,
  option = null,
  onSuccess = () => {},
  onCancel = () => {},
  className = '',
}) => {
  const { createOption, updateOption, loading, error } =
    useServiceOptionActions();
  const { validateServiceOption } = useServiceOptionValidation();

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
    display_order: 0,
    is_active: true,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Populate form when editing existing option
  useEffect(() => {
    if (option) {
      setFormData({
        name: option.name || '',
        description: option.description || '',
        duration_minutes: option.duration_minutes || 30,
        price: option.price || 0,
        time_varies: option.time_varies || false,
        price_varies: option.price_varies || false,
        min_duration: option.min_duration || null,
        max_duration: option.max_duration || null,
        min_price: option.min_price || null,
        max_price: option.max_price || null,
        display_order: option.display_order || 0,
        is_active: option.is_active ?? true,
      });
    }
  }, [option]);

  // Validate form whenever data changes (after first submit attempt)
  useEffect(() => {
    if (submitAttempted) {
      const validation = validateServiceOption(formData);
      setValidationErrors(validation.errors);
    }
  }, [formData, submitAttempted, validateServiceOption]);

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

    const validation = validateServiceOption(formData);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    try {
      let result;
      if (option) {
        // Update existing option
        result = await updateOption(option.id, formData);
      } else {
        // Create new option
        result = await createOption(serviceId, formData);
      }

      if (!result.error) {
        onSuccess(result.data);
        // Reset form if creating new option
        if (!option) {
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
            display_order: 0,
            is_active: true,
          });
          setSubmitAttempted(false);
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p className="mt-1 text-sm text-red-600">{error}</p>;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="text-md font-medium text-gray-900">
          {option ? 'Edit Option' : 'Add New Option'}
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* General Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  Error {option ? 'updating' : 'creating'} option
                </h4>
                <div className="mt-1 text-sm text-red-700">
                  {error.message || 'An unexpected error occurred'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Option Name */}
        <div>
          <label
            htmlFor="option-name"
            className="block text-sm font-medium text-gray-700"
          >
            Option Name *
          </label>
          <input
            type="text"
            id="option-name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
              validationErrors.name ? 'border-red-300' : ''
            }`}
            placeholder="e.g., Full Extension"
            maxLength={255}
          />
          <ErrorMessage error={validationErrors.name} />
        </div>

        {/* Option Description */}
        <div>
          <label
            htmlFor="option-description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="option-description"
            rows={2}
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
              validationErrors.description ? 'border-red-300' : ''
            }`}
            placeholder="Describe this option..."
            maxLength={1000}
          />
          <ErrorMessage error={validationErrors.description} />
        </div>

        {/* Duration Section */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="option-time-varies"
              checked={formData.time_varies}
              onChange={e => handleInputChange('time_varies', e.target.checked)}
              className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="option-time-varies"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Duration varies
            </label>
          </div>

          {formData.time_varies ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="option-min-duration"
                  className="block text-xs font-medium text-gray-700"
                >
                  Min Duration (min) *
                </label>
                <input
                  type="number"
                  id="option-min-duration"
                  min="1"
                  value={formData.min_duration || ''}
                  onChange={e =>
                    handleInputChange(
                      'min_duration',
                      parseInt(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
                    validationErrors.min_duration ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.min_duration} />
              </div>

              <div>
                <label
                  htmlFor="option-max-duration"
                  className="block text-xs font-medium text-gray-700"
                >
                  Max Duration (min) *
                </label>
                <input
                  type="number"
                  id="option-max-duration"
                  min="1"
                  value={formData.max_duration || ''}
                  onChange={e =>
                    handleInputChange(
                      'max_duration',
                      parseInt(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
                    validationErrors.max_duration ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.max_duration} />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="option-duration"
                className="block text-xs font-medium text-gray-700"
              >
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="option-duration"
                min="1"
                value={formData.duration_minutes}
                onChange={e =>
                  handleInputChange(
                    'duration_minutes',
                    parseInt(e.target.value) || 0
                  )
                }
                className={`mt-1 block w-full max-w-24 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
                  validationErrors.duration_minutes ? 'border-red-300' : ''
                }`}
              />
              <ErrorMessage error={validationErrors.duration_minutes} />
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="option-price-varies"
              checked={formData.price_varies}
              onChange={e =>
                handleInputChange('price_varies', e.target.checked)
              }
              className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="option-price-varies"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Price varies
            </label>
          </div>

          {formData.price_varies ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="option-min-price"
                  className="block text-xs font-medium text-gray-700"
                >
                  Min Price ($) *
                </label>
                <input
                  type="number"
                  id="option-min-price"
                  min="0"
                  step="0.01"
                  value={formData.min_price || ''}
                  onChange={e =>
                    handleInputChange(
                      'min_price',
                      parseFloat(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
                    validationErrors.min_price ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.min_price} />
              </div>

              <div>
                <label
                  htmlFor="option-max-price"
                  className="block text-xs font-medium text-gray-700"
                >
                  Max Price ($) *
                </label>
                <input
                  type="number"
                  id="option-max-price"
                  min="0"
                  step="0.01"
                  value={formData.max_price || ''}
                  onChange={e =>
                    handleInputChange(
                      'max_price',
                      parseFloat(e.target.value) || null
                    )
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
                    validationErrors.max_price ? 'border-red-300' : ''
                  }`}
                />
                <ErrorMessage error={validationErrors.max_price} />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="option-price"
                className="block text-xs font-medium text-gray-700"
              >
                Price ($) *
              </label>
              <input
                type="number"
                id="option-price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e =>
                  handleInputChange('price', parseFloat(e.target.value) || 0)
                }
                className={`mt-1 block w-full max-w-24 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm ${
                  validationErrors.price ? 'border-red-300' : ''
                }`}
              />
              <ErrorMessage error={validationErrors.price} />
            </div>
          )}
        </div>

        {/* Active Status */}
        {option && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="option-is-active"
              checked={formData.is_active}
              onChange={e => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="option-is-active"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Option is active
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                {option ? 'Updating...' : 'Adding...'}
              </>
            ) : option ? (
              'Update Option'
            ) : (
              'Add Option'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceOptionForm;
