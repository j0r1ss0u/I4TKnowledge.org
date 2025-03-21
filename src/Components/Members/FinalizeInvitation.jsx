// =================================================================
// FinalizeInvitation.jsx
// Component to accept Terms of Reference and create user account
// Composant pour accepter les conditions d'utilisation et créer un compte utilisateur
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { torService } from '../../services/torService';
import { documentsService } from '../../services/documentsService';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { firebaseAuthService } from '../../services/firebaseAuthService';
import { auth } from '../../services/firebase';
import { useAuth } from '../../Components/AuthContext';

// =================================================================
// CONSTANTS / CONSTANTES
// =================================================================
const STEPS = {
  LOADING: 'loading',
  VALIDATION: 'validation',
  TOR: 'tor',
  PASSWORD: 'password',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// =================================================================
// PASSWORD FORM COMPONENT / COMPOSANT DE FORMULAIRE DE MOT DE PASSE
// =================================================================
const PasswordForm = ({ onSubmit, password, setPassword, confirmPassword, setConfirmPassword, error, currentLang }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {currentLang === 'fr' ? 'Mot de passe' : 'Password'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder={currentLang === 'fr' ? '8 caractères minimum' : '8 characters minimum'}
          minLength={8}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {currentLang === 'fr' ? 'Confirmez le mot de passe' : 'Confirm password'}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder={currentLang === 'fr' ? 'Entrez à nouveau votre mot de passe' : 'Enter your password again'}
          minLength={8}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors"
      >
        {currentLang === 'fr' ? 'Finaliser l\'inscription' : 'Complete registration'}
      </button>
    </form>
  );
};

// =================================================================
// MAIN COMPONENT / COMPOSANT PRINCIPAL
// =================================================================
const FinalizeInvitation = ({ handlePageChange }) => {
  // Context and local state / Contexte et état local
  const { showNotification } = useAuth();
  const [step, setStep] = useState(STEPS.LOADING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [torDocument, setTorDocument] = useState(null);
  const [acceptTor, setAcceptTor] = useState(false);

  // Password state / État du mot de passe
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Language state / État de la langue
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  // =================================================================
  // INITIALIZATION EFFECT - VERSION MISE À JOUR AVEC RETRY
  // Load invitation data and ToR document with support for URL parameters
  // Chargement des données d'invitation et du document des conditions d'utilisation avec support pour les paramètres d'URL
  // =================================================================
  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);

        // Check URL parameters first / Vérifier d'abord les paramètres de l'URL
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        const codeParam = params.get('code');

        // If parameters are present in URL, validate directly / Si les paramètres sont présents dans l'URL, valider directement
        if (emailParam && codeParam) {
          console.log('Direct validation of code / Validation directe du code:', codeParam, 'for / pour:', emailParam);

          // Validate invitation code / Valider le code d'invitation
          const validationResult = await invitationsService.validateInvitationCode(emailParam, codeParam);

          if (!validationResult.valid) {
            throw new Error(validationResult.message || (currentLang === 'fr' 
              ? 'Code d\'invitation invalide' 
              : 'Invalid invitation code'));
          }

          // Store invitation ID if valid / Stocker l'ID d'invitation si valide
          localStorage.setItem('currentInvitationId', validationResult.invitation.id);
          console.log('Invitation code successfully validated / Code d\'invitation validé avec succès');

          // Clean URL to avoid refresh issues / Nettoyer l'URL pour éviter les problèmes de rafraîchissement
          window.history.replaceState({}, '', '/#finalize-invitation');
        }

        // Check if invitation parameters were passed via localStorage / Vérifier si des paramètres d'invitation ont été passés via localStorage
        // (from RegisterComponent / depuis RegisterComponent)
        const pendingEmail = localStorage.getItem('pendingInvitationEmail');
        const pendingCode = localStorage.getItem('pendingInvitationCode');

        if (pendingEmail && pendingCode) {
          console.log('Processing stored invitation parameters / Traitement des paramètres d\'invitation stockés:', pendingCode, 'for / pour', pendingEmail);

          // Clean these values immediately to avoid duplicates / Nettoyer ces valeurs immédiatement pour éviter les doublons
          localStorage.removeItem('pendingInvitationEmail');
          localStorage.removeItem('pendingInvitationCode');

          // No need to revalidate - RegisterComponent already did it / Nous n'avons pas besoin de revalider - RegisterComponent l'a déjà fait
          // and stored the invitation ID in currentInvitationId / et a stocké l'ID d'invitation dans currentInvitationId
        }

        // Try to recover invitationId from pendingInvitationId if not in currentInvitationId
        // Essayer de récupérer invitationId depuis pendingInvitationId s'il n'est pas dans currentInvitationId
        let invitationId = localStorage.getItem('currentInvitationId');
        if (!invitationId) {
          invitationId = localStorage.getItem('pendingInvitationId');
          if (invitationId) {
            console.log('Recovered invitation ID from pendingInvitationId / ID d\'invitation récupéré depuis pendingInvitationId:', invitationId);
            localStorage.setItem('currentInvitationId', invitationId);
            localStorage.removeItem('pendingInvitationId');
          }
        }

        // Check if current user's email has a pending invitation if no ID found
        // Vérifier si l'email de l'utilisateur actuel a une invitation en attente si aucun ID n'est trouvé
        if (!invitationId && auth.currentUser) {
          const userEmail = auth.currentUser.email;
          console.log('Trying to find invitation by user email / Tentative de recherche d\'invitation par email utilisateur:', userEmail);
          const emailInvitation = await invitationsService.getInvitationByEmail(userEmail);
          if (emailInvitation) {
            invitationId = emailInvitation.id;
            console.log('Found invitation by email / Invitation trouvée par email:', invitationId);
            localStorage.setItem('currentInvitationId', invitationId);
          }
        }

        // Get invitation ID from localStorage / Récupérer l'ID d'invitation du localStorage 
        if (!invitationId) {
          throw new Error(currentLang === 'fr' 
            ? 'Invitation non trouvée. Veuillez valider votre invitation d\'abord.' 
            : 'Invitation not found. Please validate your invitation first.');
        }

        // Validate invitation with retry / Valider l'invitation avec retry
        console.log('Retrieving invitation / Récupération de l\'invitation:', invitationId);
        const invitationResult = await invitationsService.validateInvitationWithRetry(invitationId);

        if (!invitationResult.valid) {
          throw new Error(invitationResult.message || (currentLang === 'fr' ? 'Invitation invalide' : 'Invalid invitation'));
        }

        const invitationData = invitationResult.invitation;

        // Get Terms of Reference document / Récupérer le document des conditions d'utilisation
        const torResults = await documentsService.semanticSearch('TERMS OF REFERENCE');
        if (!torResults || torResults.length === 0) {
          throw new Error(currentLang === 'fr' 
            ? 'Document des conditions d\'utilisation introuvable' 
            : 'Terms of Reference document not found');
        }

        // Update state / Mettre à jour l'état
        setInvitation(invitationData);
        setTorDocument(torResults[0]);
        setStep(STEPS.TOR);
      } catch (err) {
        console.error('Error loading invitation / Erreur lors du chargement de l\'invitation:', err);
        setError(err.message);
        setStep(STEPS.ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [currentLang]);

  // =================================================================
  // TOR ACCEPTANCE HANDLER / GESTIONNAIRE D'ACCEPTATION DES CONDITIONS
  // Handle user accepting the Terms of Reference
  // Gérer l'acceptation des conditions d'utilisation par l'utilisateur
  // =================================================================
  const handleTorAccept = async () => {
    if (!acceptTor) {
      setError(currentLang === 'fr' 
        ? 'Vous devez accepter les conditions d\'utilisation pour continuer' 
        : 'You must accept the Terms of Reference to continue');
      return;
    }

    try {
      setStep(STEPS.PROCESSING);

      // Move to password step / Passer à l'étape du mot de passe
      setStep(STEPS.PASSWORD);
      setError(null);

    } catch (err) {
      console.error('Error accepting Terms of Reference / Erreur lors de l\'acceptation des conditions d\'utilisation:', err);
      setError(err.message);
      setStep(STEPS.TOR); // Return to ToR step / Retour à l'étape des conditions
    }
  };

  // =================================================================
  // PASSWORD VALIDATION / VALIDATION DU MOT DE PASSE
  // Validate password meets requirements / Valider que le mot de passe répond aux exigences
  // =================================================================
  const validatePassword = () => {
    if (password !== confirmPassword) {
      setError(currentLang === 'fr' 
        ? 'Les mots de passe ne correspondent pas' 
        : 'Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      setError(currentLang === 'fr' 
        ? 'Le mot de passe doit contenir au moins 8 caractères' 
        : 'Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  // =================================================================
  // ACCOUNT CREATION / CRÉATION DE COMPTE
  // Create user account and finalize invitation / Créer le compte utilisateur et finaliser l'invitation
  // =================================================================

  const handleCreateAccount = async (e) => {
    e?.preventDefault(); // Make optional if called programmatically / Optionnel si appelé programmatiquement

    if (!validatePassword()) {
      return;
    }

    try {
      setStep(STEPS.PROCESSING);

      if (!invitation || !invitation.id) {
        throw new Error(currentLang === 'fr' ? 'Données d\'invitation manquantes' : 'Invitation data missing');
      }

      // 1. Create user account / Créer le compte utilisateur
      console.log('[DEBUG] Creating user account with invitation / Création du compte utilisateur avec l\'invitation', invitation.id);
      const result = await invitationsService.createUserFromInvitation(invitation.id, { 
        password: password 
      });

      // 2. Store credentials for potential reconnection / Stocker les identifiants pour une reconnexion potentielle
      localStorage.setItem('finalizationEmail', invitation.email);
      localStorage.setItem('pendingPassword', password);
      localStorage.setItem('finalizationCompleted', 'true');

      // 3. Wait for authentication to be effective / Attendre que l'authentification soit effective
      console.log('[DEBUG] Waiting for authentication propagation / En attente de la propagation de l\'authentification...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds / Augmenté à 2 secondes

      // 4. Check if user is logged in (attempt login if not) / Vérifier si l'utilisateur est connecté (tenter de se connecter sinon)
      if (!auth.currentUser) {
        console.log('[DEBUG] User not logged in, attempting login / Utilisateur non connecté, tentative de connexion...');
        try {
          await firebaseAuthService.loginUser(invitation.email, password);
          console.log('[DEBUG] Login successful / Connexion réussie');
        } catch (loginError) {
          console.error('[DEBUG] Login failed / Échec de la connexion:', loginError);
          // Continue with the process even if login fails / Continuer le processus même si la connexion échoue
        }
      }

      // 5. Register ToR acceptance / Enregistrer l'acceptation des conditions
      console.log('[DEBUG] Recording Terms of Reference acceptance / Enregistrement de l\'acceptation des conditions d\'utilisation...');
      await torService.acceptToR(invitation.email, torDocument.id);

      // 6. Update user account activation status / Mettre à jour le statut d'activation du compte utilisateur
      console.log('[DEBUG] Ensuring user account is active / Garantir que le compte utilisateur est actif...');
      try {
        await invitationsService.activateUserAccount(result.uid || auth.currentUser?.uid);
      } catch (activationError) {
        console.error('[DEBUG] Activation error / Erreur d\'activation:', activationError);
        // Continue even if activation fails - we'll try again later / Continuer même si l'activation échoue - nous réessaierons plus tard
      }

      // 7. Show success message / Afficher le message de succès
      console.log('[DEBUG] Account created successfully / Compte créé avec succès');
      setStep(STEPS.SUCCESS);
      showNotification(currentLang === 'fr' 
        ? 'Votre compte a été créé avec succès!' 
        : 'Your account has been created successfully!', 'success', 5000);

      // 8. Clean localStorage (except data needed for reconnection) / Nettoyer localStorage (sauf les données nécessaires pour la reconnexion)
      localStorage.removeItem('currentInvitationId');

      // 9. Redirect to home page after a short delay / Rediriger vers la page d'accueil après un court délai
      setTimeout(() => {
        // Force complete reload rather than SPA navigation / Forcer un rechargement complet plutôt qu'une navigation SPA
        window.location.href = '/'; 
      }, 3000);
    } catch (err) {
      console.error('[DEBUG] Error finalizing invitation / Erreur lors de la finalisation de l\'invitation:', err);
      setError(err.message);
      setStep(STEPS.PASSWORD);

      // Clean sensitive data in case of error / Nettoyer les données sensibles en cas d'erreur
      localStorage.removeItem('pendingPassword');
      localStorage.removeItem('finalizationCompleted');
    }
  };

  // =================================================================
  // CONDITIONAL RENDERING / RENDU CONDITIONNEL
  // =================================================================

  // Loading state / État de chargement
  if (step === STEPS.LOADING || step === STEPS.PROCESSING) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">
          {step === STEPS.LOADING 
            ? (currentLang === 'fr' ? 'Chargement...' : 'Loading...') 
            : (currentLang === 'fr' ? 'Traitement en cours...' : 'Processing...')}
        </p>
      </div>
    );
  }

  // Error state / État d'erreur
  if (step === STEPS.ERROR) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold">{currentLang === 'fr' ? 'Erreur' : 'Error'}</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => handlePageChange('home')}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors"
          >
            {currentLang === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  // Success state / État de succès
  if (step === STEPS.SUCCESS) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
            <h2 className="text-xl font-bold">
              {currentLang === 'fr' ? 'Inscription réussie!' : 'Registration successful!'}
            </h2>
          </div>
          <p className="text-center mb-4">
            {currentLang === 'fr'
              ? 'Votre compte a été créé avec succès. Vous allez être redirigé(e) vers la page d\'accueil.'
              : 'Your account has been created successfully. You will be redirected to the home page.'}
          </p>
          <div className="flex justify-center">
            <div className="animate-pulse h-2 w-24 bg-green-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ToR acceptance state / État d'acceptation des conditions
  if (step === STEPS.TOR) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              {currentLang === 'fr' ? 'Conditions d\'utilisation' : 'Terms of Reference'}
            </h2>

            {torDocument && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">{torDocument.title}</h3>
                <div className="prose max-w-none mb-6">
                  <p>{torDocument.excerpt || torDocument.description}</p>

                  {torDocument.ipfsCid && (
                    <div className="mt-4">
                      <a 
                        href={`ipfs://${torDocument.ipfsCid}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-700"
                      >
                        {currentLang === 'fr' ? 'Voir le document complet' : 'View full document'}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={acceptTor}
                      onChange={(e) => setAcceptTor(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-amber-600"
                    />
                    <span className="text-gray-700">
                      {currentLang === 'fr' 
                        ? 'J\'ai lu et j\'accepte les conditions d\'utilisation' 
                        : 'I have read and accept the Terms of Reference'}
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 px-4 py-2 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleTorAccept}
                    disabled={!acceptTor}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentLang === 'fr' ? 'Continuer' : 'Continue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Password creation state (default for STEPS.PASSWORD) / État de création de mot de passe (par défaut pour STEPS.PASSWORD)
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {currentLang === 'fr' ? 'Créer un mot de passe' : 'Create a password'}
          </h2>

          <p className="text-gray-600 mb-6 text-center">
            {currentLang === 'fr'
              ? 'Dernière étape ! Veuillez créer un mot de passe sécurisé pour votre compte.'
              : 'Final step! Please create a secure password for your account.'}
          </p>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <PasswordForm 
            onSubmit={handleCreateAccount}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            currentLang={currentLang}
          />
        </div>
      </div>
    </div>
  );
};

export default FinalizeInvitation;