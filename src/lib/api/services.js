// src/lib/api/services.js - UPDATED to use new views with options
import config from '../../config/environment';
import { getTableName, supabase } from '../supabase';

// Helper to get view names with environment prefix
const getViewName = viewName => {
  const result = config.api.usesTestingTables
    ? `testing_${viewName}`
    : viewName;
  // console.log(
  //   `🔍 getViewName: ${viewName} -> ${result} (usesTestingTables: ${config.api.usesTestingTables})`
  // );
  return result;
};

export const servicesApi = {
  // Get all services (public access) - NOW WITH OPTION INFO
  async getAllServices() {
    try {
      const { data, error } = await supabase
        .from(getViewName('vw_public_services_with_options'))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { data: null, error };
    }
  },

  // Get services by stylist
  async getServicesByStylist(stylistId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('services'))
        .select('*')
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching stylist services:', error);
      return { data: null, error };
    }
  },

  // Get services by tenant
  async getServicesByTenant(tenantId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('services'))
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tenant services:', error);
      return { data: null, error };
    }
  },

  // Get single service by ID
  async getServiceById(serviceId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('services'))
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching service:', error);
      return { data: null, error };
    }
  },

  // Create new service for stylist
  async createStylistService(serviceData, stylistId) {
    try {
      // Validate required fields - conditional based on price_varies and time_varies
      const baseRequiredFields = ['name'];

      // Duration validation
      if (!serviceData.time_varies) {
        baseRequiredFields.push('duration_minutes');
      }

      // Price validation - conditional
      if (!serviceData.price_varies) {
        baseRequiredFields.push('price');
      }

      // Check base required fields
      for (const field of baseRequiredFields) {
        if (!serviceData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Additional validation for variable pricing/timing
      if (serviceData.time_varies) {
        if (!serviceData.min_duration || !serviceData.max_duration) {
          throw new Error('Min and max duration required when time varies');
        }
        if (!serviceData.duration_minutes) {
          // Set a default duration when time varies (could be min, max, or average)
          serviceData.duration_minutes = serviceData.min_duration;
        }
      }

      if (serviceData.price_varies) {
        if (!serviceData.min_price || !serviceData.max_price) {
          throw new Error('Min and max price required when price varies');
        }
        if (!serviceData.price) {
          // Set a default price when price varies (could be min, max, or average)
          serviceData.price = serviceData.min_price;
        }
      }

      // Prepare service data
      const service = {
        ...serviceData,
        stylist_id: stylistId,
        tenant_id: null,
        is_active: serviceData.is_active ?? true,
      };

      // Handle variable pricing/timing
      if (serviceData.time_varies) {
        service.min_duration = serviceData.min_duration;
        service.max_duration = serviceData.max_duration;
      } else {
        service.min_duration = null;
        service.max_duration = null;
      }

      if (serviceData.price_varies) {
        service.min_price = serviceData.min_price;
        service.max_price = serviceData.max_price;
      } else {
        service.min_price = null;
        service.max_price = null;
      }

      const { data, error } = await supabase
        .from(getTableName('services'))
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating service:', error);
      return { data: null, error };
    }
  },

  // Update service
  async updateService(serviceId, serviceData) {
    try {
      // Prepare update data
      const updateData = { ...serviceData };

      // Handle variable pricing/timing
      if (serviceData.time_varies === false) {
        updateData.min_duration = null;
        updateData.max_duration = null;
      }

      if (serviceData.price_varies === false) {
        updateData.min_price = null;
        updateData.max_price = null;
      }

      // Add updated timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(getTableName('services'))
        .update(updateData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating service:', error);
      return { data: null, error };
    }
  },

  // Soft delete service (set is_active to false)
  async deactivateService(serviceId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('services'))
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deactivating service:', error);
      return { data: null, error };
    }
  },

  // Reactivate service
  async activateService(serviceId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('services'))
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error activating service:', error);
      return { data: null, error };
    }
  },

  // Hard delete service
  async deleteService(serviceId) {
    try {
      const { error } = await supabase
        .from(getTableName('services'))
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting service:', error);
      return { error };
    }
  },

  // Get services for current user (stylist or tenant) - WITH OPTIONS INFO
  async getUserServices() {
    try {
      const { data, error } = await supabase
        .from(getViewName('vw_user_services_with_options'))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user services:', error);
      return { data: null, error };
    }
  },
};

export default servicesApi;
