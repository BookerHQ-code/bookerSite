// Environment configuration for BookerHQ
const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

export const config = {
  environment,
  isProduction: environment === 'production',
  isTesting: environment === 'testing',
  isDevelopment: environment === 'development',

  // Supabase configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || '',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  },

  // API endpoints and table prefixes
  api: {
    // Use testing_ prefix for testing environment
    tablePrefix: environment === 'production' ? '' : 'testing_',
  },

  // App configuration
  app: {
    name: 'BookerHQ',
    description: 'Book, Buy, and Sell Stylist Appointments',
    url:
      environment === 'production'
        ? 'https://bookerhq-production.netlify.app'
        : window.location.origin, // Use current branch deploy URL
  },
};

export default config;
