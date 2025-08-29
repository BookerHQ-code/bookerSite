// src/hooks/useServiceOptions.js
import { useCallback, useEffect, useState } from 'react';
import { serviceOptionsApi } from '../lib/api/serviceOptions';

// Hook for managing service options list
export const useServiceOptions = (serviceId, hookOptions = {}) => {
  const { autoLoad = true } = hookOptions;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOptions = useCallback(async () => {
    if (!serviceId) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await serviceOptionsApi.getServiceOptions(serviceId);

      if (result.error) {
        throw result.error;
      }

      setOptions(result.data || []);
    } catch (err) {
      console.error('Error loading service options:', err);
      setError(err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (autoLoad) {
      loadOptions();
    }
  }, [autoLoad, loadOptions]);

  return {
    options,
    loading,
    error,
    reload: loadOptions,
  };
};

// Hook for single service option management
export const useServiceOption = optionId => {
  const [option, setOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOption = useCallback(async () => {
    if (!optionId) {
      setOption(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await serviceOptionsApi.getServiceOptionById(optionId);

      if (result.error) {
        throw result.error;
      }

      setOption(result.data);
    } catch (err) {
      console.error('Error loading service option:', err);
      setError(err);
      setOption(null);
    } finally {
      setLoading(false);
    }
  }, [optionId]);

  useEffect(() => {
    loadOption();
  }, [loadOption]);

  return {
    option,
    loading,
    error,
    reload: loadOption,
  };
};

// Hook for service option CRUD operations
export const useServiceOptionActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOption = useCallback(async (serviceId, optionData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceOptionsApi.createServiceOption(
        serviceId,
        optionData
      );

      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error creating service option:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOption = useCallback(async (optionId, optionData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceOptionsApi.updateServiceOption(
        optionId,
        optionData
      );

      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error updating service option:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOption = useCallback(async (optionId, softDelete = true) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (softDelete) {
        result = await serviceOptionsApi.deactivateServiceOption(optionId);
      } else {
        result = await serviceOptionsApi.deleteServiceOption(optionId);
      }

      if (result.error) {
        throw result.error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting service option:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const activateOption = useCallback(async optionId => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceOptionsApi.activateServiceOption(optionId);

      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error activating service option:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderOptions = useCallback(async (serviceId, optionIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceOptionsApi.reorderServiceOptions(
        serviceId,
        optionIds
      );

      if (result.error) {
        throw result.error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error reordering service options:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOption,
    updateOption,
    deleteOption,
    activateOption,
    reorderOptions,
    loading,
    error,
  };
};

// Hook for service option validation
export const useServiceOptionValidation = () => {
  const validateServiceOption = useCallback(optionData => {
    const errors = {};

    // Required fields
    if (!optionData.name?.trim()) {
      errors.name = 'Option name is required';
    }

    // Duration validation - conditional based on time_varies
    if (!optionData.time_varies) {
      if (!optionData.duration_minutes || optionData.duration_minutes <= 0) {
        errors.duration_minutes = 'Duration must be greater than 0';
      }
    }

    // Price validation - conditional based on price_varies
    if (!optionData.price_varies) {
      // Fixed price validation
      if (
        optionData.price === undefined ||
        optionData.price === null ||
        optionData.price < 0
      ) {
        errors.price = 'Price must be 0 or greater';
      }
    }

    // Variable timing validation
    if (optionData.time_varies) {
      if (!optionData.min_duration || optionData.min_duration <= 0) {
        errors.min_duration = 'Minimum duration is required when time varies';
      }
      if (!optionData.max_duration || optionData.max_duration <= 0) {
        errors.max_duration = 'Maximum duration is required when time varies';
      }
      if (
        optionData.min_duration &&
        optionData.max_duration &&
        optionData.min_duration > optionData.max_duration
      ) {
        errors.max_duration =
          'Maximum duration must be greater than minimum duration';
      }
    }

    // Variable pricing validation
    if (optionData.price_varies) {
      if (
        optionData.min_price === undefined ||
        optionData.min_price === null ||
        optionData.min_price < 0
      ) {
        errors.min_price = 'Minimum price is required when price varies';
      }
      if (
        optionData.max_price === undefined ||
        optionData.max_price === null ||
        optionData.max_price < 0
      ) {
        errors.max_price = 'Maximum price is required when price varies';
      }
      if (
        optionData.min_price !== undefined &&
        optionData.max_price !== undefined &&
        optionData.min_price > optionData.max_price
      ) {
        errors.max_price = 'Maximum price must be greater than minimum price';
      }
    }

    // String length validations
    if (optionData.name && optionData.name.length > 255) {
      errors.name = 'Option name must be less than 255 characters';
    }

    if (optionData.description && optionData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  return { validateServiceOption };
};

const serviceOptionsHooks = {
  useServiceOptions,
  useServiceOption,
  useServiceOptionActions,
  useServiceOptionValidation,
};

export default serviceOptionsHooks;
