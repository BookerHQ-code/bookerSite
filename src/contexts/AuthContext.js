// src/contexts/AuthContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getTableName, supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ✅ Refs to track current state without causing re-renders
  const currentUser = useRef(user);
  const currentUserProfile = useRef(userProfile);
  const currentUserRoles = useRef(userRoles);
  const loadingProfileForUser = useRef(null);

  // ✅ Update refs when state changes
  useEffect(() => {
    currentUser.current = user;
  }, [user]);

  useEffect(() => {
    currentUserProfile.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    currentUserRoles.current = userRoles;
  }, [userRoles]);

  // Debug state (remove in production)
  useEffect(() => {
    // console.log('AuthContext State:', { loading, initialized, user: user?.id });
  }, [loading, initialized, user]);

  // Load user profile and roles
  const loadUserProfile = async authUser => {
    if (!authUser) return;

    // ✅ GUARD: Don't reload if already loading for this user
    if (loadingProfileForUser.current === authUser.id) {
      // console.log('👤 Already loading profile for this user, skipping...');
      return;
    }

    // ✅ GUARD: Don't reload if profile already exists for this user
    if (
      currentUserProfile.current &&
      currentUserProfile.current.auth_user_id === authUser.id &&
      currentUserRoles.current?.length > 0
    ) {
      // console.log('👤 Profile already loaded and current for this user');
      return;
    }

    loadingProfileForUser.current = authUser.id;

    try {
      // console.log('👤 Loading profile for:', authUser.id);

      // Basic user data
      const { data: userData, error: userError } = await supabase
        .from(getTableName('users'))
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError || !userData) {
        // ✅ IMPROVED: Better handling for users without database records
        if (
          userError?.code === 'PGRST116' ||
          userError?.details?.includes('0 rows')
        ) {
          // console.log(
          //   '📝 User verified but database setup not complete - this is normal during signup flow'
          // );
          setUserProfile(null);
          setUserRoles([]);
          return;
        }

        console.log(
          '❌ Unexpected error loading user data:',
          userError?.message
        );
        setUserProfile(null);
        setUserRoles([]);
        return;
      }

      // console.log('✅ User data loaded');

      // Set basic profile first
      setUserProfile({ ...userData });

      // Load roles separately (don't block on this)
      const { data: rolesData } = await supabase
        .from(getTableName('user_role_assignments'))
        .select('role')
        .eq('user_id', userData.id);

      const roles = rolesData?.map(r => r.role) || [];
      setUserRoles(roles);

      // Get profile data based on roles
      const profile = { ...userData };

      if (roles.includes('customer')) {
        const { data: customerData } = await supabase
          .from(getTableName('customer_profiles'))
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (customerData) {
          profile.customer = customerData;
        }
      }

      if (roles.includes('stylist')) {
        const { data: stylistData } = await supabase
          .from(getTableName('stylist_profiles'))
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (stylistData) {
          profile.stylist = stylistData;
        }
      }

      if (roles.includes('tenant_admin')) {
        const { data: tenantData } = await supabase
          .from(getTableName('tenant_profiles'))
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (tenantData) {
          profile.tenant = tenantData;
        }
      }

      setUserProfile(profile);
      // console.log('✅ Profile loaded:', { roles });
    } catch (error) {
      console.error('Profile loading error:', error);
      setUserProfile(null);
      setUserRoles([]);
    } finally {
      loadingProfileForUser.current = null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // console.log('🔄 Initializing auth...');

      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const {
          data: { session },
          error,
        } = await Promise.race([sessionPromise, timeoutPromise]);

        // console.log('📱 Session result:', { session: !!session, error });

        if (error) {
          console.error('Session error:', error);
        } else if (session && session.user && mounted) {
          // console.log('✅ Found existing session');
          setSession(session);
          setUser(session.user);
          // Don't await profile loading during init
          loadUserProfile(session.user).catch(console.error);
        } else {
          console.log('❌ No existing session');
        }
      } catch (error) {
        console.error('Init error:', error);
      }

      // ✅ ALWAYS complete initialization
      if (mounted) {
        // console.log('✅ Auth initialization complete');
        setLoading(false);
        setInitialized(true);
      }
    };

    // Start initialization
    initializeAuth();

    // Listen for auth changes using refs to avoid dependency issues
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // ✅ Use refs to access current values without dependencies
      const userId = session?.user?.id;
      const currentUserId = currentUser.current?.id;
      const hasProfile =
        currentUserProfile.current && currentUserRoles.current?.length > 0;

      // ✅ REDUCE NOISE: Only log non-redundant events
      if (event !== 'SIGNED_IN' || userId !== currentUserId) {
        // console.log('🔄 Auth event:', event, userId || 'no user');
      }

      setSession(session);
      setUser(session?.user || null);

      if (event === 'SIGNED_IN' && session?.user) {
        // ✅ GUARD: Don't reload profile if it's the same user and already loaded
        if (userId === currentUserId && hasProfile) {
          // console.log('👤 Profile already loaded for user, skipping reload');
          setLoading(false);
          return;
        }

        // console.log('✅ User signed in, loading profile...');
        loadUserProfile(session.user).catch(console.error);
      } else if (event === 'SIGNED_OUT' || !session) {
        // console.log('✅ User signed out, clearing state...');
        setUserProfile(null);
        setUserRoles([]);
      }

      // ✅ Ensure loading is false after any auth event
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // ✅ Empty dependency array - no warnings!

  // Failsafe - force initialization if it takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialized) {
        console.warn('⚠️ Auth init timeout - forcing completion');
        setLoading(false);
        setInitialized(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [initialized]);

  // Helper functions
  const hasRole = role => userRoles.includes(role);

  const isCustomer = () => hasRole('customer');
  const isStylist = () => hasRole('stylist');
  const isTenantAdmin = () => hasRole('tenant_admin');
  const isPartnerAdmin = () => hasRole('partner_admin');
  const isSuperAdmin = () => hasRole('super_admin');

  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null;
  };

  // Auth actions
  const signOut = async () => {
    // console.log('🔄 Starting sign out process...');
    setLoading(true);

    try {
      // console.log('🔄 Calling supabase.auth.signOut()...');

      // ✅ Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error('Sign out timeout')), 5000) // 5 second timeout
      );

      const result = await Promise.race([signOutPromise, timeoutPromise]);

      if (result?.error) {
        console.error('❌ Supabase sign out error:', result.error);
        throw result.error;
      }

      // console.log('✅ Supabase sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed or timed out:', error.message);
      // Continue with manual cleanup even if Supabase signOut fails
    }

    // ✅ ALWAYS clear state regardless of Supabase response
    // console.log('🔄 Clearing auth state...');
    setSession(null);
    setUser(null);
    setUserProfile(null);
    setUserRoles([]);

    // ✅ Clear browser storage as well
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    } catch (storageError) {
      console.error('Storage clear error:', storageError);
    }

    // console.log('✅ Auth state cleared');
    // console.log('🔄 Setting loading to false');
    setLoading(false);

    // ✅ Force navigation to home page
    window.location.href = '/';
  };

  const refreshProfile = () => {
    if (user) {
      return loadUserProfile(user);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    userRoles,
    loading,
    initialized,

    // Helper functions
    hasRole,
    isCustomer,
    isStylist,
    isTenantAdmin,
    isPartnerAdmin,
    isSuperAdmin,
    isEmailVerified,

    // Actions
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
