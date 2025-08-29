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

// Enhanced environment detection with URL fallback
const detectEnvironment = () => {
  // First, try the environment variable
  if (environment === 'production') return 'production';
  if (environment === 'testing') return 'testing';

  // Fallback: detect based on URL if running in browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const href = window.location.href;

    // Check for testing URLs
    if (
      hostname.includes('testing--') ||
      href.includes('testing--') ||
      href.includes('deploy-preview') ||
      href.includes('branch-deploy')
    ) {
      console.log('🔍 Detected testing environment from URL:', href);
      return 'testing';
    }

    // Check for production URLs
    if (
      hostname === 'bookerhq.netlify.app' ||
      hostname.includes('bookerhq.') ||
      href.includes('bookerhq.netlify.app')
    ) {
      console.log('🔍 Detected production environment from URL:', href);
      return 'production';
    }
  }

  // Default to development
  console.log('🔍 Defaulting to development environment');
  return 'development';
};

const detectedEnvironment = detectEnvironment();

export const config = {
  environment: detectedEnvironment,
  isProduction: detectedEnvironment === 'production',
  isTesting: detectedEnvironment === 'testing',
  isDevelopment: detectedEnvironment === 'development',

  // Supabase configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
    redirectTo: `${getAppUrl()}/auth/callback`,
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
    // Use testing_ prefix for testing environment AND development
    tablePrefix: detectedEnvironment === 'production' ? '' : 'testing_',
    // Helper to determine if we should use testing tables (for views)
    usesTestingTables: detectedEnvironment !== 'production',
  },

  // App configuration
  app: {
    name: 'BookerHQ',
    description: 'Book, Buy, and Sell Stylist Appointments',
    url: getAppUrl(),
  },
};

export default config;
