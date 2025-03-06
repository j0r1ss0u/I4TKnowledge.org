// ================ IMPORTS ================
import React, { useState, useEffect } from "react";
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
import { firebaseAuthService } from "./services/firebaseAuthService";

// Services
import { auth } from "./services/firebase";
import { db } from './services/firebase';
import { 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  sendPasswordResetEmail
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

// Components
import Header from './Components/Header';
import HomePage from './Components/Home/HomePage';
import AboutPage from './Components/About/AboutPage';
import MembersPage from "./Components/Members/MembersPage";
import LibraryPage from "./Components/Library/LibraryPage";
import { ProtectedForumPage } from "./Components/Forum/ForumPage";
import GenealogyPage from "./Components/Library/GenealogyPage";
import LibraryChat from "./Components/Library/LibraryChat";
import FinalizeInvitation from './Components/Members/FinalizeInvitation';
import InvitationValidator from './Components/Members/InvitationValidator';
import Pressrelease from "./Components/About/Pressrelease";
import { LoginForm } from "./Components/AuthContext";
import ForgotPassword from "./Components/Members/ForgotPassword";

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
  'chat',
  'genealogy',
  'finalize-invitation',
  'reset-password',
  'register'
];

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
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.location.hash = newPage === 'home' ? '' : newPage;
  };

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

  // ===== Hash Navigation Effect =====
  useEffect(() => {
    // Vérifier le hash au chargement
    const hash = window.location.hash.slice(1);
    if (hash && VALID_PAGES.includes(hash)) {
      setCurrentPage(hash);
    }

    // Écouter les changements de hash
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash && VALID_PAGES.includes(newHash)) {
        setCurrentPage(newHash);
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

  // ===== URL Parameter Processing Effect =====
  useEffect(() => {
    const processUrlParameters = () => {
      const params = new URLSearchParams(window.location.search);

      // Traitement des codes d'invitation
      if (params.has('code') && params.has('email')) {
        console.log('Détection de paramètres d\'invitation:', params.get('code'), params.get('email'));

        // Stocker la préférence de langue si fournie
        if (params.has('lang')) {
          const lang = params.get('lang');
          localStorage.setItem('preferredLanguage', lang);
          setCurrentLang(lang);
        }

        handlePageChange('register');
        return;
      }

      // Traitement des réinitialisations de mot de passe
      if (params.has('resetId')) {
        console.log('Détection de paramètres de réinitialisation de mot de passe');
        handlePageChange('reset-password');
        return;
      }
    };

    processUrlParameters();
  }, []);

  // ===== Legacy Email Sign In Link Handler =====
  // Gardé pour compatibilité avec les anciens liens
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
          console.log('DEPRECATED: Ancien système d\'invitation par lien détecté');
          // Ne plus utiliser cette méthode, rediriger vers l'accueil
          window.history.replaceState({}, '', '/');
          handlePageChange('home');
          showNotification('Cette méthode d\'invitation n\'est plus supportée. Veuillez demander un nouveau code d\'invitation.', 'warning', 5000);
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

              // Ajouter un délai pour s'assurer que l'état de l'utilisateur est mis à jour
              await new Promise(resolve => setTimeout(resolve, 2000));

              if (auth.currentUser) {
                showNotification('Connexion réussie', 'success');

                // Rafraîchir la page pour s'assurer que toutes les données utilisateur sont correctement chargées
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              } else {
                throw new Error('Connexion réussie mais état utilisateur non mis à jour');
              }
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

  // ===== Effet de redirection vers le domaine principal =====
  useEffect(() => {
    // Forcer la redirection vers le domaine principal si nécessaire
    if (
      window.location.hostname === 'i4tk.replit.app' && 
      !localStorage.getItem('preventDomainRedirect') &&
      process.env.NODE_ENV === 'production' // Ne pas rediriger en développement
    ) {
      // Préserver tous les paramètres d'URL
      const newUrl = `https://www.i4tknowledge.org${window.location.pathname}${window.location.search}${window.location.hash}`;
      localStorage.setItem('preventDomainRedirect', 'true');

      // Redirection
      console.log('Redirection vers le domaine principal:', newUrl);
      window.location.href = newUrl;
      return;
    }

    // Nettoyer après un délai
    const timeout = setTimeout(() => {
      localStorage.removeItem('preventDomainRedirect');
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

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
          {currentPage === "home" && (
            <HomePage 
              currentLang={currentLang} 
              handlePageChange={handlePageChange}
              setActiveView={setViewMode}
            />
          )}
          {currentPage === "about" && <AboutPage currentLang={currentLang} />}
          {currentPage === "register" && (
            <InvitationValidator handlePageChange={handlePageChange} />
          )}
          {currentPage === "finalize-invitation" && (
            <FinalizeInvitation handlePageChange={handlePageChange} />
          )}
          {currentPage === "reset-password" && (
            <ForgotPassword />
          )}
          {currentPage === "chat" && user?.role === "admin" && (
            <LibraryChat currentLang={currentLang} />
          )}
          {currentPage === "members" && (
            <MembersPage.MembersPageWrapper 
              currentLang={currentLang}
              initialView={localStorage.getItem('preferredView')}
            />
          )}
          {currentPage === "library" && (
            <LibraryPage 
              currentLang={currentLang} 
              handlePageChange={handlePageChange}
              setSelectedTokenId={setSelectedTokenId}
            />
          )}
          {currentPage === "press-releases" && (
            <Pressrelease currentLang={currentLang} />
          )}
          {currentPage === "genealogy" && (
            <GenealogyPage 
              currentLang={currentLang}
              tokenId={selectedTokenId}
              onBack={() => handlePageChange("library")}
            />
          )}
          {currentPage === "forum" && <ProtectedForumPage currentLang={currentLang} />}
        </main>
      </div>

      {/* Modal ForgotPassword */}
      {authPage === 'forgot-password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <ForgotPassword />
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