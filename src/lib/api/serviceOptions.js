import { getTableName, supabase } from '../supabase';

export const serviceOptionsApi = {
  // Get all options for a specific service
  async getServiceOptions(serviceId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('service_options'))
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching service options:', error);
      return { data: null, error };
    }
  },

  // Get single option by ID
  async getServiceOptionById(optionId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('service_options'))
        .select('*')
        .eq('id', optionId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching service option:', error);
      return { data: null, error };
    }
  },

  // Create new service option
  async createServiceOption(serviceId, optionData) {
    try {
      // Validate required fields
      const requiredFields = ['name'];

      // Duration validation
      if (!optionData.time_varies) {
        requiredFields.push('duration_minutes');
      }

      // Price validation - conditional
      if (!optionData.price_varies) {
        requiredFields.push('price');
      }

      // Check base required fields
      for (const field of requiredFields) {
        if (!optionData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Additional validation for variable pricing/timing
      if (optionData.time_varies) {
        if (!optionData.min_duration || !optionData.max_duration) {
          throw new Error('Min and max duration required when time varies');
        }
        if (!optionData.duration_minutes) {
          optionData.duration_minutes = optionData.min_duration;
        }
      }

      if (optionData.price_varies) {
        if (!optionData.min_price || !optionData.max_price) {
          throw new Error('Min and max price required when price varies');
        }
        if (!optionData.price) {
          optionData.price = optionData.min_price;
        }
      }

      // Prepare option data
      const option = {
        ...optionData,
        service_id: serviceId,
        is_active: optionData.is_active ?? true,
        display_order: optionData.display_order ?? 0,
      };

      // Handle variable pricing/timing
      if (optionData.time_varies) {
        option.min_duration = optionData.min_duration;
        option.max_duration = optionData.max_duration;
      } else {
        option.min_duration = null;
        option.max_duration = null;
      }

      if (optionData.price_varies) {
        option.min_price = optionData.min_price;
        option.max_price = optionData.max_price;
      } else {
        option.min_price = null;
        option.max_price = null;
      }

      const { data, error } = await supabase
        .from(getTableName('service_options'))
        .insert([option])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating service option:', error);
      return { data: null, error };
    }
  },

  // Update service option
  async updateServiceOption(optionId, optionData) {
    try {
      // Prepare update data
      const updateData = { ...optionData };

      // Handle variable pricing/timing
      if (optionData.time_varies === false) {
        updateData.min_duration = null;
        updateData.max_duration = null;
      }

      if (optionData.price_varies === false) {
        updateData.min_price = null;
        updateData.max_price = null;
      }

      // Add updated timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(getTableName('service_options'))
        .update(updateData)
        .eq('id', optionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating service option:', error);
      return { data: null, error };
    }
  },

  // Delete service option
  async deleteServiceOption(optionId) {
    try {
      const { error } = await supabase
        .from(getTableName('service_options'))
        .delete()
        .eq('id', optionId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting service option:', error);
      return { error };
    }
  },

  // Deactivate service option
  async deactivateServiceOption(optionId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('service_options'))
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', optionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deactivating service option:', error);
      return { data: null, error };
    }
  },

  // Reactivate service option
  async activateServiceOption(optionId) {
    try {
      const { data, error } = await supabase
        .from(getTableName('service_options'))
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', optionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error activating service option:', error);
      return { data: null, error };
    }
  },

  // Reorder service options
  async reorderServiceOptions(serviceId, optionIds) {
    try {
      const updates = optionIds.map((optionId, index) => ({
        id: optionId,
        display_order: index,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from(getTableName('service_options'))
        .upsert(updates, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error reordering service options:', error);
      return { error };
    }
  },
};

export default serviceOptionsApi;
