// Environment configuration for BookerHQ
const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

const getAppUrl = () => {
  // Handle the special DEPLOY_URL case
  if (process.env.REACT_APP_URL === 'DEPLOY_URL') {
    // Netlify replaces DEPLOY_URL during build
    return process.env.DEPLOY_URL || 'http://localhost:3000';
  }

  return process.env.REACT_APP_URL || 'http://localhost:3000';
};

export const config = {
  environment,
  isProduction: environment === 'production',
  isTesting: environment === 'testing',
  isDevelopment: environment === 'development',

  // Supabase configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
    redirectTo: `${getAppUrl()}/auth/callback`, // ✅ FIXED: Removed the extra part
  },

  loops: {
    apiKey: process.env.REACT_APP_LOOPS_API_KEY,
    baseUrl: 'https://app.loops.so/api/v1',
    transactionalIds: {
      emailVerification: process.env.REACT_APP_LOOPS_VERIFICATION_ID,
    },
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
    url: getAppUrl(),
  },
};

export default config;
