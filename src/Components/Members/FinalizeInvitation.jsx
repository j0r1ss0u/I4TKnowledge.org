// =================================================================
// FinalizeInvitation.jsx
// Component to accept Terms of Reference and create user account
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { torService } from '../../services/torService';
import { documentsService } from '../../services/documentsService';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { firebaseAuthService } from '../../services/firebaseAuthService';
import { auth } from '../../services/firebase';
import { useAuth } from '../../Components/AuthContext';
import ui from '../../translations/ui';

// =================================================================
// CONSTANTS
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
// PASSWORD FORM COMPONENT
// =================================================================
const PasswordForm = ({ onSubmit, password, setPassword, confirmPassword, setConfirmPassword, error, currentLang }) => {
  const t = (ui[currentLang] || ui.en).finalizeInvitation;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder={t.passwordMinLength}
          minLength={8}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder={t.confirmPasswordPlaceholder}
          minLength={8}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors"
      >
        {t.completeRegistration}
      </button>
    </form>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================
const FinalizeInvitation = ({ handlePageChange }) => {
  // Context and local state
  const { showNotification } = useAuth();
  const [step, setStep] = useState(STEPS.LOADING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [torDocument, setTorDocument] = useState(null);
  const [acceptTor, setAcceptTor] = useState(false);

  // Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Language state
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  const t = (ui[currentLang] || ui.en).finalizeInvitation;

  // =================================================================
  // INITIALIZATION EFFECT - Version mise à jour pour FinalizeInvitation.jsx
  // Load invitation data and ToR document with support for URL parameters
  // =================================================================
  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);

        // Vérifier d'abord les paramètres de l'URL
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        const codeParam = params.get('code');

        // Si les paramètres sont présents dans l'URL, valider directement
        if (emailParam && codeParam) {
          console.log('Validation directe du code:', codeParam, 'pour:', emailParam);

          // Valider le code d'invitation
          const validationResult = await invitationsService.validateInvitationCode(emailParam, codeParam);

          if (!validationResult.valid) {
            throw new Error(validationResult.message || t.invalidCode);
          }

          // Stocker l'ID d'invitation si valide
          localStorage.setItem('currentInvitationId', validationResult.invitation.id);
          console.log('Code d\'invitation validé avec succès');

          // Nettoyer l'URL pour éviter les problèmes de rafraîchissement
          window.history.replaceState({}, '', '/#finalize-invitation');
        }

        // Vérifier si des paramètres d'invitation ont été passés via localStorage
        // (depuis RegisterComponent)
        const pendingEmail = localStorage.getItem('pendingInvitationEmail');
        const pendingCode = localStorage.getItem('pendingInvitationCode');

        if (pendingEmail && pendingCode) {
          console.log('Traitement des paramètres d\'invitation stockés:', pendingCode, 'pour', pendingEmail);

          // Nettoyer ces valeurs immédiatement pour éviter les doublons
          localStorage.removeItem('pendingInvitationEmail');
          localStorage.removeItem('pendingInvitationCode');

          // Nous n'avons pas besoin de revalider - RegisterComponent l'a déjà fait
          // et a stocké l'ID d'invitation dans currentInvitationId
        }

        // Récupérer l'ID d'invitation du localStorage 
        console.log('[DEBUG] Vérification du localStorage pour invitation ID');
        console.log('[DEBUG] Tous les items dans localStorage:', Object.keys(localStorage));
        console.log('[DEBUG] currentInvitationId:', localStorage.getItem('currentInvitationId'));
        console.log('[DEBUG] sessionStorage items:', Object.keys(sessionStorage));
        
        const invitationId = localStorage.getItem('currentInvitationId');
        
        if (!invitationId) {
          const debugInfo = {
            localStorageKeys: Object.keys(localStorage),
            sessionStorageKeys: Object.keys(sessionStorage),
            urlSearch: window.location.search,
            urlHash: window.location.hash,
            currentUrl: window.location.href
          };
          
          console.error('[DEBUG] Invitation ID non trouvé. Informations de debug:', debugInfo);
          
          throw new Error(t.invitationNotFound + '\n\nDEBUG INFO:\n' + JSON.stringify(debugInfo, null, 2));
        }

        // Valider l'invitation
        console.log('[DEBUG] Récupération de l\'invitation avec ID:', invitationId);
        const invitationResult = await invitationsService.validateInvitation(invitationId);

        if (!invitationResult.valid) {
          throw new Error(invitationResult.message || t.invitationInvalid);
        }

        const invitationData = invitationResult.invitation;

        // Récupérer le document des conditions d'utilisation
        const torResults = await documentsService.semanticSearch('TERMS OF REFERENCE');
        if (!torResults || torResults.length === 0) {
          throw new Error(t.torDocumentNotFound || 'Terms of Reference document not found');
        }

        // Mettre à jour l'état
        setInvitation(invitationData);
        setTorDocument(torResults[0]);
        // Les observers n'ont pas besoin de signer le ToR
        setStep(invitationData.role === 'observer' ? STEPS.PASSWORD : STEPS.TOR);
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError(err.message);
        setStep(STEPS.ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [currentLang]);

  // =================================================================
  // TOR ACCEPTANCE HANDLER
  // Handle user accepting the Terms of Reference
  // =================================================================
  const handleTorAccept = async () => {
    if (!acceptTor) {
      setError(t.torAcceptRequired);
      return;
    }

    try {
      setStep(STEPS.PROCESSING);

      // Move to password step
      setStep(STEPS.PASSWORD);
      setError(null);

    } catch (err) {
      console.error('Error accepting Terms of Reference:', err);
      setError(err.message);
      setStep(STEPS.TOR); // Return to ToR step
    }
  };

  // =================================================================
  // PASSWORD VALIDATION
  // Validate password meets requirements
  // =================================================================
  const validatePassword = () => {
    if (password !== confirmPassword) {
      setError(t.passwordsNoMatch);
      return false;
    }

    if (password.length < 8) {
      setError(t.passwordMinChars);
      return false;
    }

    return true;
  };

  // =================================================================
  // ACCOUNT CREATION
  // Create user account and finalize invitation
  // =================================================================
 
  const handleCreateAccount = async (e) => {
    e?.preventDefault(); // Make optional if called programmatically

    if (!validatePassword()) {
      return;
    }

    try {
      setStep(STEPS.PROCESSING);

      if (!invitation || !invitation.id) {
        throw new Error(t.invitationDataMissing);
      }

      // 1. Create user account
      console.log('[DEBUG] Creating user account with invitation', invitation.id);
      const result = await invitationsService.createUserFromInvitation(invitation.id, { 
        password: password 
      });

      // 2. Store credentials for potential reconnection
      localStorage.setItem('finalizationEmail', invitation.email);
      localStorage.setItem('pendingPassword', password);
      localStorage.setItem('finalizationCompleted', 'true');

      // 3. Wait for authentication to be effective
      console.log('[DEBUG] Waiting for authentication propagation...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Augmenté à 2 secondes

      // 4. Check if user is logged in (attempt login if not)
      if (!auth.currentUser) {
        console.log('[DEBUG] User not logged in, attempting login...');
        try {
          await firebaseAuthService.loginUser(invitation.email, password);
          console.log('[DEBUG] Login successful');
        } catch (loginError) {
          console.error('[DEBUG] Login failed:', loginError);
          // Continue with the process even if login fails
        }
      }

      // 5. Register ToR acceptance (not required for observers)
      if (invitation.role !== 'observer') {
        console.log('[DEBUG] Recording Terms of Reference acceptance...');
        await torService.acceptToR(invitation.email, torDocument.id);
      }

      // 6. Update user account activation status
      console.log('[DEBUG] Ensuring user account is active...');
      try {
        await invitationsService.activateUserAccount(result.uid || auth.currentUser?.uid);
      } catch (activationError) {
        console.error('[DEBUG] Activation error:', activationError);
        // Continue even if activation fails - we'll try again later
      }

      // 7. Show success message
      console.log('[DEBUG] Account created successfully');
      setStep(STEPS.SUCCESS);
      showNotification(t.accountCreated, 'success', 5000);

      // 8. Clean localStorage (except data needed for reconnection)
      localStorage.removeItem('currentInvitationId');

      // 9. Redirect to home page after a short delay
      setTimeout(() => {
        // Force complete reload rather than SPA navigation
        window.location.href = '/'; 
      }, 3000);
    } catch (err) {
      console.error('[DEBUG] Error finalizing invitation:', err);
      setError(err.message);
      setStep(STEPS.PASSWORD);

      // Clean sensitive data in case of error
      localStorage.removeItem('pendingPassword');
      localStorage.removeItem('finalizationCompleted');
    }
  };

  // =================================================================
  // CONDITIONAL RENDERING
  // =================================================================

  // Loading state
  if (step === STEPS.LOADING || step === STEPS.PROCESSING) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">
          {step === STEPS.LOADING ? t.loading : t.processing}
        </p>
      </div>
    );
  }

  // Error state
  if (step === STEPS.ERROR) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold">{t.error}</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => handlePageChange('home')}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (step === STEPS.SUCCESS) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
            <h2 className="text-xl font-bold">{t.registrationSuccess}</h2>
          </div>
          <p className="text-center mb-4">{t.accountCreatedRedirect}
          </p>
          <div className="flex justify-center">
            <div className="animate-pulse h-2 w-24 bg-green-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ToR acceptance state
  if (step === STEPS.TOR) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">{t.termsOfReference}</h2>

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
                        {t.viewFullDocument}
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
                    <span className="text-gray-700">{t.torCheckboxLabel}</span>
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
                    {t.continue}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Password creation state (default for STEPS.PASSWORD)
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">{t.createPassword}</h2>

          <p className="text-gray-600 mb-6 text-center">{t.finalStep}</p>

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