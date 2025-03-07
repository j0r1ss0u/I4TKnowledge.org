// =================================================================
// AuthContext.jsx
// Contexte d'authentification principal de l'application
// Gère l'état de connexion et fournit les fonctionnalités d'auth
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
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LogIn, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { auth } from "../services/firebase";
import { firebaseAuthService } from "../services/firebaseAuthService";
import { passwordResetService } from "../services/passwordResetService";
import { invitationsService } from "../services/invitationsService";
import { usersService } from "../services/usersService";
import ForgotPassword from "./Members/ForgotPassword";

// =================================================================
// Création et export du Context et Hook personnalisé
// =================================================================

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// =================================================================
// AuthProvider Component
// =================================================================

export const AuthProvider = ({ children }) => {
  // ------- État local -------
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [authPage, setAuthPage] = useState('login');

  // ------- Gestionnaire de notifications -------
  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // ------- Observer Firebase Auth -------
  // Remplacer l'useEffect qui gère onAuthStateChanged dans AuthContext.jsx
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('[DEBUG] Changement d\'état d\'authentification:', firebaseUser?.email);
      try {
        if (firebaseUser) {
          // Cas spécial pour l'administrateur
          if (firebaseUser.email === 'admin@i4tk.org' || firebaseUser.email === 'joris.galea@i4tknowledge.net') {
            setUser({ uid: firebaseUser.uid, role: 'admin', email: firebaseUser.email });
            showNotification('Connecté en tant qu\'administrateur');
            setLoading(false);
            return;
          }

          // Vérifier si nous sommes en train de finaliser une invitation
          const isProcessingInvitation = window.location.pathname.includes('finalize-invitation') || 
                                        window.location.hash === '#finalize-invitation';
          const currentInvitationId = localStorage.getItem('currentInvitationId');

          // Permet de traiter correctement le processus d'invitation en cours
          if (isProcessingInvitation && currentInvitationId) {
            console.log('[DEBUG] Finalisation d\'invitation en cours, traitement spécial');

            // Définir un état utilisateur temporaire pendant la finalisation
            const pendingUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: 'member', // Rôle temporaire
              isCompletingInvitation: true
            };

            setUser(pendingUserData);
            setLoading(false);
            return;
          }

          // Rechercher l'utilisateur par email
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', firebaseUser.email));
          const querySnapshot = await getDocs(q);

          // Utilisateur trouvé par email dans Firestore
          if (!querySnapshot.empty) {
            // Utilisateur trouvé par email
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            console.log(`[DEBUG] Utilisateur trouvé par email dans Firestore: ${userDoc.id}, statut: ${userData.status}`);

            if (userData.status === 'active') {
              // Utilisateur actif trouvé, continuer normalement
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: userData.role,
                organization: userData.organization,
                ...userData
              });

              showNotification(`Bienvenue ${
                userData.role === 'validator' ? 'validateur' : 'membre'
              }${userData.organization ? ` de ${userData.organization}` : ''}`);

              setLoading(false);
              return;
            } else {
              // Utilisateur trouvé mais inactif
              console.log('[DEBUG] Compte utilisateur inactif, déconnexion');
              await firebaseAuthService.logoutUser();
              setUser(null);
              showNotification('Votre compte est inactif. Veuillez contacter l\'administrateur.', 'error');
              setLoading(false);
              return;
            }
          }

          // Vérifier aussi l'utilisateur par UID au cas où l'email aurait changé
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            console.log(`[DEBUG] Utilisateur trouvé par UID dans Firestore: ${firebaseUser.uid}`);

            if (userData.status === 'active') {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: userData.role,
                organization: userData.organization,
                ...userData
              });

              showNotification(`Bienvenue ${
                userData.role === 'validator' ? 'validateur' : 'membre'
              }${userData.organization ? ` de ${userData.organization}` : ''}`);

              setLoading(false);
              return;
            } else {
              console.log('[DEBUG] Compte utilisateur inactif, déconnexion');
              await firebaseAuthService.logoutUser();
              setUser(null);
              showNotification('Votre compte est inactif. Veuillez contacter l\'administrateur.', 'error');
              setLoading(false);
              return;
            }
          }

          // Si nous arrivons ici, l'utilisateur n'existe pas dans Firestore
          // Vérifier s'il existe une invitation en attente pour cet email
          const invitationsRef = collection(db, 'invitations');
          const invitationQuery = query(invitationsRef, where('email', '==', firebaseUser.email), where('status', '==', 'pending'));
          const invitationSnapshot = await getDocs(invitationQuery);

          if (!invitationSnapshot.empty) {
            console.log(`[DEBUG] Invitation en attente trouvée pour ${firebaseUser.email}, continuer le processus`);

            // Définir un état utilisateur temporaire
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: 'member', // Rôle par défaut temporaire
              isCompletingInvitation: true
            });

            setLoading(false);
            return;
          }

          // Vérifier s'il y a des données d'invitation en attente
          const pendingInvitationData = localStorage.getItem('pendingInvitationData');

          if (pendingInvitationData) {
            console.log('[DEBUG] Données d\'invitation trouvées:', pendingInvitationData);
            const invitationData = JSON.parse(pendingInvitationData);

            try {
              // Initialiser le rôle de l'utilisateur avec les données d'invitation
              const userDoc = await firebaseAuthService.initializeUserRole(
                firebaseUser.uid, 
                firebaseUser.email,
                invitationData
              );

              localStorage.removeItem('pendingInvitationData');
              localStorage.removeItem('currentInvitationId'); // Nettoyer aussi cette clé

              // Définir l'état utilisateur final
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: invitationData.role,
                organization: invitationData.organization,
                ...userDoc
              });

              showNotification(`Bienvenue ${
                invitationData.role === 'validator' ? 'validateur' : 'membre'
              } de ${invitationData.organization}`);

            } catch (initError) {
              console.error('[DEBUG] Erreur lors de l\'initialisation du rôle:', initError);

              // En cas d'erreur, afficher une notification mais ne pas déconnecter
              showNotification('Erreur lors de l\'initialisation du profil. Veuillez contacter l\'administrateur.', 'error');

              // Définir un état utilisateur minimal
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: 'member', // Rôle par défaut
                error: true
              });
            }
          } else {
            // Si nous arrivons ici, l'utilisateur n'existe nulle part
            console.log('[DEBUG] Utilisateur non trouvé dans Firestore, déconnexion');
            await firebaseAuthService.logoutUser();
            setUser(null);
            showNotification('Votre profil utilisateur est incomplet. Veuillez contacter l\'administrateur.', 'error');
          }
        } else {
          console.log('[DEBUG] Déconnexion détectée');
          setUser(null);
          localStorage.removeItem('pendingInvitationData');
          // Ne pas supprimer currentInvitationId lors d'une déconnexion normale
          // car cela peut interrompre le processus d'invitation
        }
      } catch (error) {
        console.error('[DEBUG] Erreur lors du changement d\'état d\'auth:', error);
        setUser(null);
        showNotification('Erreur lors de la connexion', 'error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  // ------- Méthodes d'authentification -------
  const login = async (credentials) => {
    try {
      if (credentials.email === 'admin@i4tk.org' && credentials.password === 'admin') {
        const user = await firebaseAuthService.loginUser(credentials.email, credentials.password);
        setUser({ role: 'admin', email: credentials.email });
        showNotification('Connecté en tant qu\'administrateur');
        return user;
      } 

      // Vérifier si l'utilisateur n'a pas été supprimé
      const isDeleted = await usersService.checkIfUserDeleted(null, credentials.email);
      if (isDeleted) {
        throw new Error('Ce compte a été désactivé. Veuillez contacter l\'administrateur.');
      }

      const user = await firebaseAuthService.loginUser(credentials.email, credentials.password);
      showNotification(`Bienvenue${user.role === 'admin' ? ' administrateur' : ''} !`);
      return user;
    } catch (error) {
      let message = 'Échec de la connexion. Vérifiez vos identifiants.';
      if (error.message.includes('verify your email')) {
        message = 'Veuillez vérifier votre email avant de vous connecter.';
      }
      showNotification(message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuthService.logoutUser();
      setUser(null);
      showNotification('Vous avez été déconnecté avec succès');
    } catch (error) {
      showNotification('Échec de la déconnexion', 'error');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      // Vérifier si une invitation est en attente
      const invitation = await invitationsService.getInvitationByEmail(email);
      if (invitation?.status === 'pending') {
        const invitationDate = invitation.createdAt.toDate();
        showNotification(
          `Une invitation est en attente depuis le ${invitationDate.toLocaleDateString()} (${invitationDate.toLocaleTimeString()}) - Vérifiez l'email envoyé par noreply@i4tk.org`,
          'info',
          6000 // Durée plus longue pour cette notification importante
        );
        return;
      }

      // Vérifier si un compte existe
      const userExists = await usersService.getUserByEmail(email);
      if (!userExists || userExists.deleted) {
        // Pour des raisons de sécurité, ne pas divulguer cette information
        // Simuler un succès même si l'utilisateur n'existe pas
        showNotification('Si un compte est associé à cette adresse email, des instructions de réinitialisation vous seront envoyées.', 'success', 5000);
        return true;
      }

      // Utiliser le nouveau service de réinitialisation
      await passwordResetService.requestPasswordReset(email);
      showNotification(
        'Instructions de réinitialisation envoyées par email. Veuillez vérifier votre boîte de réception et vos spams.',
        'success',
        5000 // Durée plus longue pour cette notification importante
      );
      setAuthPage('login');
      return true;
    } catch (error) {
      console.error('Erreur resetPassword:', error);
      // Pour des raisons de sécurité, ne pas divulguer d'informations spécifiques
      showNotification(
        'Si un compte est associé à cette adresse email, des instructions de réinitialisation vous seront envoyées.',
        'success',
        5000
      );
      return true; // Retourner un succès même en cas d'erreur
    }
  };

  const changePassword = async (newPassword) => {
    try {
      await firebaseAuthService.updatePassword(newPassword);
      showNotification('Mot de passe mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Échec de la mise à jour du mot de passe', 'error');
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await firebaseAuthService.resendVerificationEmail();
      showNotification('Email de vérification envoyé', 'success');
    } catch (error) {
      showNotification('Échec de l\'envoi de l\'email de vérification', 'error');
      throw error;
    }
  };

  // ------- Rendu du Provider -------
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
      setAuthPage
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
// HOC de protection des routes et logique de rôles
// =================================================================

const ROLE_HIERARCHY = {
  admin: ['admin', 'validator', 'member'], 
  validator: ['validator', 'member'],     
  member: ['member']                     
};

export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function ProtectedComponent(props) {
    const { user, authPage } = useAuth();

    if (!user) {
      return authPage === 'forgot-password' ? <ForgotPassword /> : <LoginForm />;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// =================================================================
// Composant UserProfile
// =================================================================

export const UserProfile = () => {
  const { user, logout } = useAuth();

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
        Déconnexion
      </button>
    </div>
  );
};

// =================================================================
// Composant LoginForm
// =================================================================

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, setAuthPage, showNotification } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Erreur de connexion:', error);
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
      showNotification('Email de vérification envoyé. Vérifiez votre boîte de réception.', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      showNotification('Erreur lors de l\'envoi de l\'email de vérification.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <User className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Connexion
      </h2>

      {needsVerification && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Veuillez vérifier votre email avant de vous connecter.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            className="mt-2 text-sm text-yellow-600 hover:text-yellow-500 underline"
          >
            Envoyer l'email de vérification
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
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
            Mot de passe oublié ?
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
              Connexion
            </>
          )}
        </button>
      </form>
    </div>
  );
};