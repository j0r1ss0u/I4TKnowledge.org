// =================================================================
// AuthContext.jsx
// Authentication context for the application
// Manages connection state and provides auth functionalities
// =================================================================

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import React, { createContext, useState, useContext, useEffect, lazy, Suspense } from 'react';
import { User, LogIn, LogOut, AlertTriangle, CheckCircle2, Loader2, Globe } from 'lucide-react';
import { auth } from "../services/firebase";
import { firebaseAuthService } from "../services/firebaseAuthService";
import { passwordResetService } from "../services/passwordResetService";
import { invitationsService } from "../services/invitationsService";
import { usersService } from "../services/usersService";
import { loadTranslations, preloadTranslations } from '../translations';
import ui from '../translations/ui';

// Dynamic import to avoid circular import
// ForgotPassword will only be loaded when needed
const ForgotPassword = lazy(() => import('./Members/ForgotPassword'));

// =================================================================
// Context creation and custom Hook export
// =================================================================

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// =================================================================
// AuthProvider Component
// =================================================================

export const AuthProvider = ({ children }) => {
  // ------- Local state -------
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [authPage, setAuthPage] = useState('login');
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [translationsLoading, setTranslationsLoading] = useState(true);

  // Get translations for current language with fallback
  const t = translations || {};

  // Toggle language: EN → FR → ES → PT → ZH → EN
  const toggleLanguage = () => {
    const cycle = { en: 'fr', fr: 'es', es: 'pt', pt: 'zh', zh: 'en' };
    const newLanguage = cycle[language] || 'en';
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    preloadTranslations(newLanguage);
  };

  // Load translations when language changes
  useEffect(() => {
    const loadCurrentTranslations = async () => {
      try {
        setTranslationsLoading(true);
        const loadedTranslations = await loadTranslations(language);
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to empty object if loading fails
        setTranslations({});
      } finally {
        setTranslationsLoading(false);
      }
    };

    loadCurrentTranslations();
    
    // Preload the next language in the cycle for faster switching
    const nextInCycle = { en: 'fr', fr: 'es', es: 'pt', pt: 'zh', zh: 'en' };
    preloadTranslations(nextInCycle[language] || 'fr');
  }, [language]);

  // ------- Notification handler -------
  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // ------- Firebase Auth Observer -------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('[DEBUG] Authentication state change:', firebaseUser?.email);
      try {
        if (firebaseUser) {
          // Special case for administrator
          if (firebaseUser.email === 'admin@i4tk.org' || firebaseUser.email === 'joris.galea@i4tknowledge.net') {
            setUser({ uid: firebaseUser.uid, role: 'admin', email: firebaseUser.email });
            showNotification(t.adminConnected);
            setLoading(false);
            return;
          }

          // Check if we're finalizing an invitation
          const isProcessingInvitation = window.location.pathname.includes('finalize-invitation') || 
                                        window.location.hash === '#finalize-invitation';
          const currentInvitationId = localStorage.getItem('currentInvitationId');

          // Handle invitation process correctly
          if (isProcessingInvitation && currentInvitationId) {
            console.log('[DEBUG] Invitation finalization in progress, special handling');

            // Set temporary user state during finalization
            const pendingUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: 'member', // Temporary role
              isCompletingInvitation: true
            };

            setUser(pendingUserData);
            setLoading(false);
            return;
          }

          // Search user by email
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', firebaseUser.email));
          const querySnapshot = await getDocs(q);

          // User found by email in Firestore
          if (!querySnapshot.empty) {
            // User found by email
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            console.log(`[DEBUG] User found by email in Firestore: ${userDoc.id}, status: ${userData.status}`);

            if (userData.status === 'active') {
              // Active user found, continue normally
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: userData.role,
                organization: userData.organization,
                ...userData
              });

              const welcomeMessage = userData.role === 'validator' ? t.welcomeValidator : userData.role === 'observer' ? t.welcomeObserver : t.welcomeMember;
              const organizationText = userData.organization ? ` ${t.welcomeOf} ${userData.organization}` : '';
              showNotification(`${welcomeMessage}${organizationText}`);

              setLoading(false);
              return;
            } else {
              // User found but inactive
              console.log('[DEBUG] Inactive user account, logging out');
              await firebaseAuthService.logoutUser();
              setUser(null);
              showNotification(t.inactiveAccount, 'error');
              setLoading(false);
              return;
            }
          }

          // Also check user by UID in case email changed
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            console.log(`[DEBUG] User found by UID in Firestore: ${firebaseUser.uid}`);

            if (userData.status === 'active') {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: userData.role,
                organization: userData.organization,
                ...userData
              });

              const welcomeMessage = userData.role === 'validator' ? t.welcomeValidator : userData.role === 'observer' ? t.welcomeObserver : t.welcomeMember;
              const organizationText = userData.organization ? ` ${t.welcomeOf} ${userData.organization}` : '';
              showNotification(`${welcomeMessage}${organizationText}`);

              setLoading(false);
              return;
            } else {
              console.log('[DEBUG] Inactive user account, logging out');
              await firebaseAuthService.logoutUser();
              setUser(null);
              showNotification(t.inactiveAccount, 'error');
              setLoading(false);
              return;
            }
          }

          // If we get here, the user doesn't exist in Firestore
          // Check if there's a pending invitation for this email
          const invitationsRef = collection(db, 'invitations');
          const invitationQuery = query(invitationsRef, where('email', '==', firebaseUser.email), where('status', '==', 'pending'));
          const invitationSnapshot = await getDocs(invitationQuery);

          if (!invitationSnapshot.empty) {
            console.log(`[DEBUG] Pending invitation found for ${firebaseUser.email}, continuing process`);

            // Set temporary user state
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: 'member', // Default temporary role
              isCompletingInvitation: true
            });

            setLoading(false);
            return;
          }

          // Check if there's pending invitation data
          const pendingInvitationData = localStorage.getItem('pendingInvitationData');

          if (pendingInvitationData) {
            console.log('[DEBUG] Invitation data found:', pendingInvitationData);
            const invitationData = JSON.parse(pendingInvitationData);

            try {
              // Initialize user role with invitation data
              const userDoc = await firebaseAuthService.initializeUserRole(
                firebaseUser.uid, 
                firebaseUser.email,
                invitationData
              );

              localStorage.removeItem('pendingInvitationData');
              localStorage.removeItem('currentInvitationId'); // Clean this key too

              // Set final user state
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: invitationData.role,
                organization: invitationData.organization,
                ...userDoc
              });

              const welcomeMessage = invitationData.role === 'validator'
                ? t.welcomeValidator
                : invitationData.role === 'observer'
                  ? t.welcomeObserver
                  : t.welcomeMember;
              showNotification(`${welcomeMessage} ${t.welcomeOf} ${invitationData.organization}`);

            } catch (initError) {
              console.error('[DEBUG] Error initializing role:', initError);

              // In case of error, show notification but don't disconnect
              showNotification(t.profileError, 'error');

              // Set minimal user state
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: 'member', // Default role
                error: true
              });
            }
          } else {
            // If we get here, the user doesn't exist anywhere
            console.log('[DEBUG] User not found in Firestore, logging out');
            await firebaseAuthService.logoutUser();
            setUser(null);
            showNotification(t.incompleteProfile, 'error');
          }
        } else {
          console.log('[DEBUG] Logout detected');
          setUser(null);
          localStorage.removeItem('pendingInvitationData');
          // Don't remove currentInvitationId during normal logout
          // as it can interrupt the invitation process
        }
      } catch (error) {
        console.error('[DEBUG] Error during auth state change:', error);
        setUser(null);
        showNotification(t.connectionError, 'error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [language, t]);

  // ------- Authentication methods -------
  const login = async (credentials) => {
    try {
      if (credentials.email === 'admin@i4tk.org' && credentials.password === 'admin') {
        const user = await firebaseAuthService.loginUser(credentials.email, credentials.password);
        setUser({ role: 'admin', email: credentials.email });
        showNotification(t.adminConnected);
        return user;
      } 

      // Check if the user hasn't been deleted
      const isDeleted = await usersService.checkIfUserDeleted(null, credentials.email);
      if (isDeleted) {
        throw new Error(t.accountDeactivated);
      }

      const user = await firebaseAuthService.loginUser(credentials.email, credentials.password);
      const organizationText = user.organization ? ` ${t.welcomeOf} ${user.organization}` : '';
      const welcomeMsg = user.role === 'admin'
        ? t.adminConnected
        : user.role === 'validator'
          ? t.welcomeValidator
          : user.role === 'observer'
            ? t.welcomeObserver
            : t.welcomeMember;
      showNotification(`${welcomeMsg}${organizationText}`);
      return user;
    } catch (error) {
      let message = t.loginError;
      if (error.message.includes('verify your email')) {
        message = t.verifyEmail;
      }
      showNotification(message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuthService.logoutUser();
      setUser(null);
      showNotification(t.logoutSuccess);
    } catch (error) {
      showNotification(t.logoutError, 'error');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      // Check if there's a pending invitation
      const invitation = await invitationsService.getInvitationByEmail(email);
      if (invitation?.status === 'pending') {
        const invitationDate = invitation.createdAt.toDate();
        showNotification(
          `${t.pendingInvitation} ${invitationDate.toLocaleDateString()} (${invitationDate.toLocaleTimeString()}) - ${t.checkEmail}`,
          'info',
          6000 // Longer duration for this important notification
        );
        return;
      }

      // Check if account exists
      const userExists = await usersService.getUserByEmail(email);
      if (!userExists || userExists.deleted) {
        // For security reasons, don't disclose this information
        // Simulate success even if user doesn't exist
        showNotification(t.resetPasswordInstructions, 'success', 5000);
        return true;
      }

      // Use the new reset service
      await passwordResetService.requestPasswordReset(email);
      showNotification(
        t.resetPasswordSent,
        'success',
        5000 // Longer duration for this important notification
      );
      setAuthPage('login');
      return true;
    } catch (error) {
      console.error('Error resetPassword:', error);
      // For security reasons, don't disclose specific information
      showNotification(
        t.resetPasswordInstructions,
        'success',
        5000
      );
      return true; // Return success even in case of error
    }
  };

  const changePassword = async (newPassword) => {
    try {
      await firebaseAuthService.updatePassword(newPassword);
      showNotification(t.passwordUpdated, 'success');
    } catch (error) {
      showNotification(t.passwordUpdateError, 'error');
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await firebaseAuthService.resendVerificationEmail();
      showNotification(t.verificationSent, 'success');
    } catch (error) {
      showNotification(t.verificationError, 'error');
      throw error;
    }
  };

  // ------- Provider Rendering -------
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      resetPassword,
      changePassword,
      resendVerificationEmail,
      showNotification,
      authPage,
      setAuthPage,
      language,
      toggleLanguage,
      t
    }}>
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 
          notification.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        } flex items-center space-x-2 z-50 transition-all duration-500 ease-in-out max-w-md`}>
          {notification.type === 'error' ? 
            <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : 
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          }
          <span className="text-sm">{notification.message}</span>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

// =================================================================
// HOC for route protection and role logic
// =================================================================

const ROLE_HIERARCHY = {
  admin: ['admin', 'validator', 'member'],
  validator: ['validator', 'member'],
  member: ['member'],
  observer: ['observer']
};

export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function ProtectedComponent(props) {
    const { user, authPage, language, t } = useAuth();

    if (!user) {
      return authPage === 'forgot-password' ? (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>}>
          <ForgotPassword />
        </Suspense>
      ) : <LoginForm />;
    }

    if (allowedRoles.length === 0) {
      return <WrappedComponent {...props} />;
    }

    const userAccessibleRoles = ROLE_HIERARCHY[user.role] || [];
    const hasAccess = allowedRoles.some(role => userAccessibleRoles.includes(role));

    if (!hasAccess) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.accessDenied}</h2>
          <p className="text-gray-600">
            {t.noPermission}
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// =================================================================
// UserProfile Component
// =================================================================

export const UserProfile = () => {
  const { user, logout, language, t } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center bg-gray-100 rounded-full p-2">
        <User className="h-5 w-5 text-gray-600" />
        <span className="ml-2 text-sm text-gray-700">{user.email}</span>
      </div>
      <button
        onClick={logout}
        className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <LogOut className="h-4 w-4 mr-1" />
        {(ui[language] || ui.en).auth.logout}
      </button>
    </div>
  );
};

// =================================================================
// LoginForm Component
// =================================================================

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, setAuthPage, showNotification, language, toggleLanguage, t } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Connection error:', error);
      if (error.code === 'auth/email-not-verified') {
        setNeedsVerification(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await firebaseAuthService.resendVerificationEmail();
      showNotification(t.verificationSent, 'success');
    } catch (error) {
      console.error('Error sending verification email:', error);
      showNotification(t.verificationError, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg relative">
      <button 
        type="button" 
        onClick={toggleLanguage}
        className="absolute top-3 right-3 p-2 text-gray-500 hover:text-amber-600"
        aria-label={language === 'en' ? 'Switch to French' : 'Switch to English'}
      >
        <Globe className="h-5 w-5" />
        <span className="ml-1 text-xs">{language.toUpperCase()}</span>
      </button>

      <div className="flex items-center justify-center mb-6">
        <User className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        {t.login}
      </h2>

      {needsVerification && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            {t.verifyEmail}
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            className="mt-2 text-sm text-yellow-600 hover:text-yellow-500 underline"
          >
            {t.sendVerification}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t.password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => {
              console.log('Clicking forgot password');
              setAuthPage('forgot-password');
            }}
            className="text-sm text-amber-600 hover:text-amber-500"
          >
            {t.forgotPassword}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              {t.login}
            </>
          )}
        </button>
      </form>
    </div>
  );
};