// ================ IMPORTS ================
import React, { useState, useEffect, Suspense } from "react";
// RainbowKit & Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useAccount } from 'wagmi';

// Query Client
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuration & Providers
import { config, chains } from './config/wagmiConfig';
import { AuthProvider } from "./Components/AuthContext";
import { MembersProvider } from './Components/Members/MembersContext';
import { testFirebaseConnection } from "./services/firebase";
import { useAuth } from "./Components/AuthContext";

// Services
import { auth } from "./services/firebase";
import { db } from './services/firebase';
import { invitationsService } from './services/invitationsService';
import { autoTaggingService } from './services/autoTaggingService';
import { 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';

// Components (immediate imports)
import Header from './Components/Header';
import { LoginForm } from "./Components/AuthContext";

// Lazy-loaded components to reduce bundle size
const HomePage = React.lazy(() => import('./Components/Home/HomePage'));
const AboutPage = React.lazy(() => import('./Components/About/AboutPage'));
import MembersPageComponent from './Components/Members/MembersPage';
const LibraryPage = React.lazy(() => import('./Components/Library/LibraryPage'));
const ProtectedForumPage = React.lazy(() => import('./Components/Forum/ForumPage').then(module => ({ default: module.ProtectedForumPage })));
const GenealogyPage = React.lazy(() => import('./Components/Library/GenealogyPage'));
const LibraryChat = React.lazy(() => import('./Components/Library/LibraryChat'));
const WalkThrough = React.lazy(() => import('./Components/WalkThrough/WalkThrough'));
const FinalizeInvitation = React.lazy(() => import('./Components/Members/FinalizeInvitation'));
const TorAcceptanceRequired = React.lazy(() => import('./Components/Members/TorAcceptanceRequired'));
const Pressrelease = React.lazy(() => import('./Components/About/Pressrelease'));
const ForgotPassword = React.lazy(() => import('./Components/Members/ForgotPassword'));
const ToolsPage = React.lazy(() => import('./Components/Tools/ToolsPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

// ================ QUERY CLIENT CONFIGURATION ================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Liste des pages valides pour la navigation
const VALID_PAGES = [
  'home',
  'about',
  'members',
  'library',
  'press-releases',
  'forum',
  'draft',
  'walkthrough',
  'genealogy',
  'finalize-invitation',
  'reset-password',
  'register',
  'tools', // Nouvelle page "Tools"
  'global-toolkit' // On garde pour compatibilité
];

// ================ REGISTER COMPONENT ================
// Définir ce composant juste avant le début de la fonction AppContent
// Ajoutez-le à votre fichier App.jsx existant

function RegisterComponent({ handlePageChange, showNotification, currentLang }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // Import nécessaire pour l'icône
  const AlertTriangle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );

  // Effet pour traiter les paramètres d'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');

    if (emailParam && codeParam) {
      setEmail(emailParam);
      setCode(codeParam);
      validateInvitation(emailParam, codeParam);
    }
  }, []);

  // Fonction de validation
  const validateInvitation = async (emailToValidate, codeToValidate) => {
    try {
      setLoading(true);
      setError(null);

      const emailValue = emailToValidate || email;
      const codeValue = codeToValidate || code;

      console.log('Validation du code d\'invitation:', codeValue, 'pour l\'email:', emailValue);

      // Valider le code d'invitation
      const result = await invitationsService.validateInvitationCode(emailValue, codeValue);

      if (!result.valid) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Stocker l'ID d'invitation pour la page suivante
      localStorage.setItem('currentInvitationId', result.invitation.id);

      // Afficher un message de succès
      showNotification(
        currentLang === 'fr'
          ? 'Code d\'invitation validé avec succès!'
          : 'Invitation code successfully validated!',
        'success'
      );

      // Rediriger vers la page de finalisation
      setTimeout(() => {
        window.history.replaceState({}, '', '/#finalize-invitation');
        handlePageChange('finalize-invitation');
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    validateInvitation();
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {currentLang === 'fr' ? 'Validation en cours...' : 'Validating...'}
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {currentLang === 'fr' ? 'Valider votre invitation' : 'Validate your invitation'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {currentLang === 'fr' ? 'Adresse email' : 'Email address'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {currentLang === 'fr' ? 'Code d\'invitation' : 'Invitation code'}
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border rounded-md font-mono text-center tracking-widest uppercase"
            maxLength={8}
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertTriangle />
            <p className="ml-2">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {currentLang === 'fr' ? 'Valider l\'invitation' : 'Validate invitation'}
        </button>
      </form>
    </div>
  );
}


// ================ APP CONTENT COMPONENT ================
function AppContent() {
  // ===== State Management =====
  const { user, authPage, setAuthPage, showNotification } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredView') || 'cards');
  const { address } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [processingAuthLink, setProcessingAuthLink] = useState(false);

  // ===== Page Change Handler =====
  const handlePageChange = React.useCallback((newPage) => {
    setCurrentPage(newPage);
    window.location.hash = newPage === 'home' ? '' : newPage;
  }, []);

  // ===== Provider Check Effect =====
  useEffect(() => {
    const checkProvider = async () => {
      try {
        await window.ethereum?.request({ method: 'eth_chainId' });
      } catch (error) {
        console.warn('Provider check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkProvider();
  }, []);

  // ===== Initialize AI Auto-Tagging =====
  useEffect(() => {
    const initializeAutoTagging = async () => {
      try {
        console.log('🤖 Initializing auto-tagging service...');
        await autoTaggingService.precomputeElementEmbeddings();
        console.log('✅ Auto-tagging service ready (using secure backend)');
      } catch (error) {
        console.error('❌ Failed to initialize auto-tagging:', error);
        // Non-bloquant : l'app peut fonctionner sans auto-tagging
      }
    };
    initializeAutoTagging();
  }, []);

  // ===== Hash Navigation Effect =====
  useEffect(() => {
    // Fonction pour extraire la page et les paramètres du hash
    const parseHash = (hash) => {
      if (!hash) return { page: 'home', params: {} };

      // Séparer la page des paramètres
      const [pagePart, paramsPart] = hash.split('?');

      // Extraire les paramètres
      const params = {};
      if (paramsPart) {
        const searchParams = new URLSearchParams(`?${paramsPart}`);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }

      return { page: pagePart, params };
    };

    // Vérifier le hash au chargement
    const hash = window.location.hash.slice(1);
    const { page, params } = parseHash(hash);

    if (page && VALID_PAGES.includes(page)) {
      setCurrentPage(page);

      // Traiter les paramètres spécifiques à la page
      if (page === 'genealogy' && params.tokenId) {
        console.log("Setting tokenId from URL:", params.tokenId);
        setSelectedTokenId(params.tokenId);
      }

      // Si on est sur la page about et qu'il y a un paramètre tab
      if (page === 'about' && params.tab) {
        // Le tab sera géré par le composant AboutPage
        console.log("About page with tab parameter:", params.tab);
      }
    }

    // Écouter les changements de hash
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      const { page, params } = parseHash(newHash);

      if (page && VALID_PAGES.includes(page)) {
        setCurrentPage(page);

        // Traiter les paramètres spécifiques à la page
        if (page === 'genealogy' && params.tokenId) {
          console.log("Setting tokenId from URL on hash change:", params.tokenId);
          setSelectedTokenId(params.tokenId);
        }
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ===== Environment & Firebase Check Effect =====
  useEffect(() => {
    console.log('AppContent mounting...');
    console.log('Environment check:', {
      userAgent: navigator.userAgent,
      hasEthereum: !!window.ethereum,
      hasWeb3: !!window.web3,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });

    const testConnection = async () => {
      try {
        console.log('Testing Firebase connection...');
        const isConnected = await testFirebaseConnection();
        console.log('Firebase connection result:', isConnected);
      } catch (error) {
        console.error('Firebase connection error:', error);
      }
    };
    testConnection();
  }, []);

  // ===== Wallet Change Effect =====
  useEffect(() => {
    if (address) {
      console.log('Wallet address changed:', address);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [address]);

  // ===== Email Sign In Link Handler =====
  useEffect(() => {
    const handleAuthLinks = async () => {
      // Vérifier si c'est un lien d'authentification
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        return;
      }

      // Vérifier si on a déjà traité ce lien exact
      const currentUrl = window.location.href;
      if (localStorage.getItem('processedAuthLink') === currentUrl) {
        console.log('Ce lien a déjà été traité, ignoré');
        return;
      }

      console.log('Détection de lien d\'authentification');
      setIsLoading(true);

      try {
        // Marquer ce lien comme en cours de traitement
        localStorage.setItem('processedAuthLink', currentUrl);

        const params = new URLSearchParams(window.location.search);
        const invitationId = params.get('invitationId');
        const resetId = params.get('resetId');

        // Récupérer l'email (une seule fois)
        let email = params.get('email');
        if (!email) {
          // Essayer de récupérer du localStorage
          email = invitationId 
            ? localStorage.getItem('emailForInvitation')
            : resetId 
              ? localStorage.getItem('emailForReset')
              : null;

          // Si toujours pas d'email, demander à l'utilisateur
          if (!email) {
            email = window.prompt('Veuillez entrer votre email pour continuer');

            // Si l'utilisateur annule le prompt
            if (!email) {
              throw new Error('Email requis pour continuer');
            }

            // Stocker l'email pour éviter de le redemander
            if (invitationId) {
              localStorage.setItem('emailForInvitation', email);
            } else if (resetId) {
              localStorage.setItem('emailForReset', email);
            }
          }
        }

        // Authentification avec le lien
        console.log('Tentative d\'authentification avec:', email);
        await signInWithEmailLink(auth, email, window.location.href);
        console.log('Authentification réussie');

        // Nettoyer les données temporaires
        localStorage.removeItem('emailForInvitation');
        localStorage.removeItem('emailForReset');

        // Traitement spécifique selon le type de lien
        if (invitationId) {
          console.log('Redirection vers la page de finalisation d\'invitation');
          // Stocker l'ID d'invitation pour la page de finalisation
          localStorage.setItem('currentInvitationId', invitationId);

          // Nettoyer l'URL et rediriger
          window.history.replaceState({}, '', '/finalize-invitation');
          handlePageChange('finalize-invitation');
          showNotification('Veuillez compléter votre inscription', 'info', 5000);
        } 
        else if (resetId) {
          console.log('Traitement de la réinitialisation de mot de passe');
          // Mettre à jour le statut dans Firestore
          const resetRef = doc(db, 'passwordResets', resetId);
          await updateDoc(resetRef, {
            status: 'validated',
            validatedAt: serverTimestamp()
          });

          // Nettoyer l'URL et afficher la modal de réinitialisation
          window.history.replaceState({}, '', '/');
          setAuthPage('forgot-password');
          showNotification('Veuillez définir votre nouveau mot de passe', 'info', 5000);
        }
        else {
          console.log('Redirection vers la page d\'accueil');
          // Rediriger vers l'accueil
          window.history.replaceState({}, '', '/');
          handlePageChange('home');
          showNotification('Connecté avec succès', 'success');
        }
      } catch (error) {
        console.error('Erreur lors du traitement du lien d\'authentification:', error);
        showNotification(error.message || 'Erreur lors de l\'authentification', 'error', 5000);

        // Supprimer le marqueur en cas d'erreur pour permettre une nouvelle tentative
        localStorage.removeItem('processedAuthLink');

        // Rediriger vers la page d'accueil en cas d'erreur
        window.history.replaceState({}, '', '/');
        handlePageChange('home');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthLinks();
  }, [handlePageChange, showNotification, setAuthPage]);

  // ===== Effet de vérification d'authentification après redirection =====
  useEffect(() => {
    const checkAuthAfterRedirect = async () => {
      // Vérifier si nous venons d'une finalisation d'invitation
      const finalizationCompleted = localStorage.getItem('finalizationCompleted');

      if (finalizationCompleted) {
        console.log('Vérification de l\'état d\'authentification après finalisation');

        // Si l'utilisateur n'est pas connecté mais que nous avons des données de connexion
        if (!user && localStorage.getItem('pendingPassword')) {
          try {
            setIsLoading(true);
            // Récupérer les informations de connexion
            const email = localStorage.getItem('finalizationEmail');
            const password = localStorage.getItem('pendingPassword');

            if (email && password) {
              console.log('Tentative de reconnexion après finalisation');
              // Tenter une connexion avec les identifiants stockés
              await firebaseAuthService.loginUser(email, password);
              showNotification('Connexion réussie', 'success');
            }
          } catch (error) {
            console.error('Échec de la reconnexion après finalisation:', error);
            showNotification('Veuillez vous connecter avec votre nouveau mot de passe', 'info');
          } finally {
            // Nettoyer les données temporaires
            localStorage.removeItem('finalizationCompleted');
            localStorage.removeItem('finalizationEmail');
            localStorage.removeItem('pendingPassword');
            setIsLoading(false);
          }
        } else {
          // Nettoyer les données si l'utilisateur est déjà connecté
          localStorage.removeItem('finalizationCompleted');
          localStorage.removeItem('finalizationEmail');
          localStorage.removeItem('pendingPassword');
        }
      }
    };

    checkAuthAfterRedirect();
  }, [user, showNotification]);


  // Validation des invitations - PRIORITÉ ABSOLUE, doit se faire AVANT toute redirection
  useEffect(() => {
    // Sauvegarder immédiatement les paramètres d'URL dans sessionStorage
    // pour éviter de les perdre lors des redirections
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const code = params.get('code');
    
    console.log('[INVITATION DEBUG] useEffect de validation exécuté');
    console.log('[INVITATION DEBUG] window.location.href:', window.location.href);
    console.log('[INVITATION DEBUG] Paramètres extraits - email:', email, 'code:', code);

    // Si on a des paramètres dans l'URL, les sauvegarder ET valider immédiatement
    if (email && code) {
      console.log('Paramètres d\'invitation détectés dans l\'URL:', email, code);
      
      // Sauvegarder dans sessionStorage pour ne pas les perdre
      sessionStorage.setItem('pendingInvitationEmail', email);
      sessionStorage.setItem('pendingInvitationCode', code);
      
      // Valider immédiatement
      const validateAndRedirect = async () => {
        try {
          console.log('Validation du code d\'invitation:', code, 'pour:', email);
          
          const validationResult = await invitationsService.validateInvitationCode(email, code);
          
          if (!validationResult.valid) {
            showNotification(
              validationResult.message || 'Code d\'invitation invalide',
              'error'
            );
            // Nettoyer
            sessionStorage.removeItem('pendingInvitationEmail');
            sessionStorage.removeItem('pendingInvitationCode');
            window.history.replaceState({}, '', '/');
            return;
          }
          
          // Stocker l'ID d'invitation pour FinalizeInvitation
          localStorage.setItem('currentInvitationId', validationResult.invitation.id);
          console.log('Code validé, invitation ID stocké:', validationResult.invitation.id);
          
          // Nettoyer sessionStorage
          sessionStorage.removeItem('pendingInvitationEmail');
          sessionStorage.removeItem('pendingInvitationCode');
          
          // Nettoyer l'URL et rediriger
          window.history.replaceState({}, '', '/#finalize-invitation');
          
          // Rediriger vers la page de finalisation
          showNotification(
            currentLang === 'fr' 
              ? 'Code d\'invitation validé avec succès!' 
              : 'Invitation code validated successfully!',
            'success'
          );
          
          handlePageChange('finalize-invitation');
        } catch (error) {
          console.error('Erreur lors de la validation du code:', error);
          showNotification(
            error.message || 'Erreur lors de la validation de l\'invitation',
            'error'
          );
          // Nettoyer
          sessionStorage.removeItem('pendingInvitationEmail');
          sessionStorage.removeItem('pendingInvitationCode');
          window.history.replaceState({}, '', '/');
        }
      };
      
      validateAndRedirect();
    } 
    // Si pas de paramètres dans l'URL, vérifier sessionStorage au cas où
    else {
      const savedEmail = sessionStorage.getItem('pendingInvitationEmail');
      const savedCode = sessionStorage.getItem('pendingInvitationCode');
      
      if (savedEmail && savedCode) {
        console.log('Paramètres d\'invitation récupérés depuis sessionStorage');
        
        // Valider avec les paramètres sauvegardés
        const validateAndRedirect = async () => {
          try {
            console.log('Validation du code d\'invitation:', savedCode, 'pour:', savedEmail);
            
            const validationResult = await invitationsService.validateInvitationCode(savedEmail, savedCode);
            
            if (!validationResult.valid) {
              showNotification(
                validationResult.message || 'Code d\'invitation invalide',
                'error'
              );
              sessionStorage.removeItem('pendingInvitationEmail');
              sessionStorage.removeItem('pendingInvitationCode');
              return;
            }
            
            localStorage.setItem('currentInvitationId', validationResult.invitation.id);
            console.log('Code validé, invitation ID stocké:', validationResult.invitation.id);
            
            sessionStorage.removeItem('pendingInvitationEmail');
            sessionStorage.removeItem('pendingInvitationCode');
            
            window.history.replaceState({}, '', '/#finalize-invitation');
            
            showNotification(
              currentLang === 'fr' 
                ? 'Code d\'invitation validé avec succès!' 
                : 'Invitation code validated successfully!',
              'success'
            );
            
            handlePageChange('finalize-invitation');
          } catch (error) {
            console.error('Erreur lors de la validation du code:', error);
            showNotification(
              error.message || 'Erreur lors de la validation de l\'invitation',
              'error'
            );
            sessionStorage.removeItem('pendingInvitationEmail');
            sessionStorage.removeItem('pendingInvitationCode');
          }
        };
        
        validateAndRedirect();
      }
    }
  }, [currentLang, showNotification, handlePageChange]);


  // Validation de réinitialisation de mot de passe - même logique que les invitations
  useEffect(() => {
    // Sauvegarder immédiatement les paramètres d'URL dans sessionStorage
    const params = new URLSearchParams(window.location.search);
    const resetId = params.get('resetId');
    const code = params.get('code');
    const lang = params.get('lang');
    
    console.log('[RESET PASSWORD DEBUG] useEffect de validation exécuté');
    console.log('[RESET PASSWORD DEBUG] window.location.href:', window.location.href);
    console.log('[RESET PASSWORD DEBUG] Paramètres extraits - resetId:', resetId, 'code:', code);

    // Si on a des paramètres dans l'URL, les sauvegarder pour éviter de les perdre
    if (resetId) {
      console.log('Paramètres de reset password détectés dans l\'URL:', resetId);
      
      // Sauvegarder dans sessionStorage pour ne pas les perdre lors des redirections
      sessionStorage.setItem('pendingResetId', resetId);
      if (code) {
        sessionStorage.setItem('pendingResetCode', code);
      }
      if (lang) {
        sessionStorage.setItem('pendingResetLang', lang);
      }
      
      // Rediriger vers la page reset-password avec les paramètres préservés
      const redirectToReset = () => {
        console.log('Redirection vers la page reset-password avec paramètres sauvegardés');
        
        // Construire l'URL avec les paramètres
        let resetUrl = '/#reset-password?resetId=' + resetId;
        if (code) resetUrl += '&code=' + code;
        if (lang) resetUrl += '&lang=' + lang;
        
        // Nettoyer l'URL complète et rediriger
        window.history.replaceState({}, '', resetUrl);
        handlePageChange('reset-password');
        
        showNotification(
          currentLang === 'fr' 
            ? 'Redirection vers la réinitialisation du mot de passe...' 
            : 'Redirecting to password reset...',
          'info'
        );
      };
      
      redirectToReset();
    }
    // Si pas de paramètres dans l'URL, vérifier sessionStorage au cas où
    else {
      const savedResetId = sessionStorage.getItem('pendingResetId');
      const savedCode = sessionStorage.getItem('pendingResetCode');
      const savedLang = sessionStorage.getItem('pendingResetLang');
      
      if (savedResetId && currentPage === 'reset-password') {
        console.log('Paramètres de reset récupérés depuis sessionStorage');
        
        // Restaurer les paramètres dans l'URL pour que ForgotPassword les trouve
        let resetUrl = '?resetId=' + savedResetId;
        if (savedCode) resetUrl += '&code=' + savedCode;
        if (savedLang) resetUrl += '&lang=' + savedLang;
        
        // Mettre à jour l'URL sans recharger la page
        window.history.replaceState({}, '', '/#reset-password' + resetUrl);
        
        // Nettoyer sessionStorage car les paramètres sont maintenant dans l'URL
        sessionStorage.removeItem('pendingResetId');
        sessionStorage.removeItem('pendingResetCode');
        sessionStorage.removeItem('pendingResetLang');
      }
    }
  }, [currentLang, currentPage, showNotification, handlePageChange]);


  // ===== Language Handler =====
  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  // ===== Loading State =====
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-amber-200 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-amber-100 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // ===== Render Component =====
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div 
        className="fixed top-24 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: "url('/assets/images/carte_reseau.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          backgroundColor: '#ffffff'
        }}
      />

      {/* Header Section */}
      <div className="relative z-20">
        <Header 
          currentPage={currentPage} 
          handlePageChange={handlePageChange}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        <main className="w-full overflow-x-hidden">
          {user?.requiresTorAcceptance ? (
            <Suspense fallback={<PageLoader />}>
              <TorAcceptanceRequired />
            </Suspense>
          ) : (
            <>
              {currentPage === "home" && (
                <Suspense fallback={<PageLoader />}>
                  <HomePage
                    currentLang={currentLang}
                    handlePageChange={handlePageChange}
                    setActiveView={setViewMode}
                  />
                </Suspense>
              )}
              {currentPage === "about" && (
                <Suspense fallback={<PageLoader />}>
                  <AboutPage currentLang={currentLang} />
                </Suspense>
              )}
              {currentPage === "tools" && (
                <Suspense fallback={<PageLoader />}>
                  <ToolsPage currentLang={currentLang} />
                </Suspense>
              )}
              {currentPage === "register" && (
                <div className="container mx-auto max-w-md p-6">
                  <RegisterComponent
                    handlePageChange={handlePageChange}
                    showNotification={showNotification}
                    currentLang={currentLang}
                  />
                </div>
              )}
              {currentPage === "finalize-invitation" && (
                <Suspense fallback={<PageLoader />}>
                  <FinalizeInvitation handlePageChange={handlePageChange} />
                </Suspense>
              )}
              {currentPage === "reset-password" && (
                <Suspense fallback={<PageLoader />}>
                  <ForgotPassword />
                </Suspense>
              )}
              {currentPage === "draft" && user?.role === "admin" && (
                <Suspense fallback={<PageLoader />}>
                  <LibraryChat currentLang={currentLang} />
                </Suspense>
              )}
              {currentPage === "walkthrough" && (
                <Suspense fallback={<PageLoader />}>
                  <WalkThrough />
                </Suspense>
              )}
              {currentPage === "members" && (
                <MembersPageComponent
                  currentLang={currentLang}
                  initialView={localStorage.getItem('preferredView')}
                />
              )}
              {currentPage === "library" && (
                <Suspense fallback={<PageLoader />}>
                  <LibraryPage
                    currentLang={currentLang}
                    handlePageChange={handlePageChange}
                    setSelectedTokenId={setSelectedTokenId}
                  />
                </Suspense>
              )}
              {currentPage === "press-releases" && (
                <Suspense fallback={<PageLoader />}>
                  <Pressrelease currentLang={currentLang} />
                </Suspense>
              )}
              {currentPage === "genealogy" && (
                <Suspense fallback={<PageLoader />}>
                  {console.log("Rendering GenealogyPage with tokenId:", selectedTokenId)}
                  <GenealogyPage
                    currentLang={currentLang}
                    tokenId={selectedTokenId}
                    onBack={() => handlePageChange("library")}
                  />
                </Suspense>
              )}
              {currentPage === "forum" && (
                <Suspense fallback={<PageLoader />}>
                  <ProtectedForumPage currentLang={currentLang} />
                </Suspense>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal ForgotPassword */}
      {authPage === 'forgot-password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

// ================ MAIN APP COMPONENT ================
function App() {
  // ===== Error Handler Effect =====
  useEffect(() => {
    console.log('App component mounting...');
    console.log('Wagmi config:', config);

    const handleError = (error) => {
      console.error('Global error caught:', {
        message: error.message,
        stack: error.stack,
        type: error.type
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // ===== Render Component =====
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <AuthProvider>
            <MembersProvider>
              <AppContent />
            </MembersProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;