import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { servicesApi } from '../lib/api/services';

// Hook for managing services list
export const useServices = (options = {}) => {
  const {
    autoLoad = true,
    stylistId = null,
    tenantId = null,
    includeInactive = false,
  } = options;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (stylistId) {
        result = await servicesApi.getServicesByStylist(stylistId);
      } else if (tenantId) {
        result = await servicesApi.getServicesByTenant(tenantId);
      } else {
        result = await servicesApi.getAllServices();
      }

      if (result.error) {
        throw result.error;
      }

      let servicesList = result.data || [];

      // Filter inactive services if not requested
      if (!includeInactive) {
        servicesList = servicesList.filter(service => service.is_active);
      }

      setServices(servicesList);
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [stylistId, tenantId, includeInactive]);

  useEffect(() => {
    if (autoLoad) {
      loadServices();
    }
  }, [autoLoad, loadServices]);

  return {
    services,
    loading,
    error,
    reload: loadServices,
  };
};

// Hook for managing current user's services
export const useUserServices = (options = {}) => {
  const { autoLoad = true, includeInactive = true } = options;
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadServices = useCallback(async () => {
    if (!user) {
      setServices([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await servicesApi.getUserServices();

      if (result.error) {
        throw result.error;
      }

      let servicesList = result.data || [];

      // Filter inactive services if not requested
      if (!includeInactive) {
        servicesList = servicesList.filter(service => service.is_active);
      }

      setServices(servicesList);
    } catch (err) {
      console.error('Error loading user services:', err);
      setError(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [user, includeInactive]);

  useEffect(() => {
    if (autoLoad) {
      loadServices();
    }
  }, [autoLoad, loadServices]);

  return {
    services,
    loading,
    error,
    reload: loadServices,
  };
};

// Hook for single service management
export const useService = serviceId => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadService = useCallback(async () => {
    if (!serviceId) {
      setService(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await servicesApi.getServiceById(serviceId);

      if (result.error) {
        throw result.error;
      }

      setService(result.data);
    } catch (err) {
      console.error('Error loading service:', err);
      setError(err);
      setService(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  return {
    service,
    loading,
    error,
    reload: loadService,
  };
};

// Hook for service CRUD operations
export const useServiceActions = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createService = useCallback(
    async serviceData => {
      setLoading(true);
      setError(null);

      try {
        // Get stylist ID from user profile
        const stylistId = userProfile?.stylist?.id;
        if (!stylistId) {
          throw new Error(
            'User must have a stylist profile to create services'
          );
        }

        const result = await servicesApi.createStylistService(
          serviceData,
          stylistId
        );

        if (result.error) {
          throw result.error;
        }

        return { data: result.data, error: null };
      } catch (err) {
        console.error('Error creating service:', err);
        setError(err);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [userProfile]
  );

  const updateService = useCallback(async (serviceId, serviceData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await servicesApi.updateService(serviceId, serviceData);

      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (serviceId, softDelete = true) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (softDelete) {
        result = await servicesApi.deactivateService(serviceId);
      } else {
        result = await servicesApi.deleteService(serviceId);
      }

      if (result.error) {
        throw result.error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const activateService = useCallback(async serviceId => {
    setLoading(true);
    setError(null);

    try {
      const result = await servicesApi.activateService(serviceId);

      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error activating service:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createService,
    updateService,
    deleteService,
    activateService,
    loading,
    error,
  };
};

// Hook for service validation
export const useServiceValidation = () => {
  const validateService = useCallback(serviceData => {
    const errors = {};

    // Required fields
    if (!serviceData.name?.trim()) {
      errors.name = 'Service name is required';
    }

    if (!serviceData.duration_minutes || serviceData.duration_minutes <= 0) {
      errors.duration_minutes = 'Duration must be greater than 0';
    }

    // Price validation - conditional based on price_varies
    if (!serviceData.price_varies) {
      // Fixed price validation
      if (
        serviceData.price === undefined ||
        serviceData.price === null ||
        serviceData.price < 0
      ) {
        errors.price = 'Price must be 0 or greater';
      }
    }

    // Variable timing validation
    if (serviceData.time_varies) {
      if (!serviceData.min_duration || serviceData.min_duration <= 0) {
        errors.min_duration = 'Minimum duration is required when time varies';
      }
      if (!serviceData.max_duration || serviceData.max_duration <= 0) {
        errors.max_duration = 'Maximum duration is required when time varies';
      }
      if (
        serviceData.min_duration &&
        serviceData.max_duration &&
        serviceData.min_duration > serviceData.max_duration
      ) {
        errors.max_duration =
          'Maximum duration must be greater than minimum duration';
      }
    }

    // Variable pricing validation
    if (serviceData.price_varies) {
      if (
        serviceData.min_price === undefined ||
        serviceData.min_price === null ||
        serviceData.min_price < 0
      ) {
        errors.min_price = 'Minimum price is required when price varies';
      }
      if (
        serviceData.max_price === undefined ||
        serviceData.max_price === null ||
        serviceData.max_price < 0
      ) {
        errors.max_price = 'Maximum price is required when price varies';
      }
      if (
        serviceData.min_price !== undefined &&
        serviceData.max_price !== undefined &&
        serviceData.min_price > serviceData.max_price
      ) {
        errors.max_price = 'Maximum price must be greater than minimum price';
      }
    }

    // String length validations
    if (serviceData.name && serviceData.name.length > 255) {
      errors.name = 'Service name must be less than 255 characters';
    }

    if (serviceData.description && serviceData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  return { validateService };
};

const servicesHooks = {
  useServices,
  useUserServices,
  useService,
  useServiceActions,
  useServiceValidation,
};

export default servicesHooks;
