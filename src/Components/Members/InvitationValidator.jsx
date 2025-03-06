// =================================================================
// InvitationValidator.jsx
// Component to validate invitation codes
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { Loader2, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';

// =================================================================
// CONSTANTS
// =================================================================
const STEPS = {
  VALIDATION: 'validation',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// =================================================================
// LOGS DE DEBUG
// =================================================================

useEffect(() => {
  console.log("⚠️ DIAGNOSTIC - InvitationValidator mounted");
  console.log("LocalStorage currentInvitationId:", localStorage.getItem('currentInvitationId'));

  // Vider temporairement cette valeur pendant la validation
  const savedId = localStorage.getItem('currentInvitationId');
  if (savedId) {
    console.log("Temporairement effacé currentInvitationId pour éviter redirection automatique");
    localStorage.removeItem('currentInvitationId');
    // Le stocker ailleurs
    localStorage.setItem('pendingInvitationId', savedId);
  }
}, []);

// =================================================================
// MAIN COMPONENT
// =================================================================
const InvitationValidator = ({ handlePageChange }) => {
  // State and context
  const { showNotification } = useAuth();
  const [step, setStep] = useState(STEPS.VALIDATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  // =================================================================
  // INITIALIZATION EFFECT
  // Extract parameters from URL and pre-fill form fields
  // =================================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');
    const langParam = params.get('lang');

    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
    if (langParam) setCurrentLang(langParam);

    // Automatically validate if both parameters are present
    if (emailParam && codeParam) {
      validateInvitation(emailParam, codeParam);
    }
  }, []);

  // =================================================================
  // INVITATION VALIDATION
  // Validate the invitation code against the email
  // =================================================================
  const validateInvitation = async (emailToValidate, codeToValidate) => {
    setLoading(true);
    setError(null);

    try {
      const emailValue = emailToValidate || email;
      const codeValue = codeToValidate || code;

      console.log('Validating invitation:', emailValue, codeValue);

      // Validate invitation code
      const result = await invitationsService.validateInvitationCode(emailValue, codeValue);

      if (!result.valid) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Store invitation ID in localStorage for the next step
      localStorage.setItem('currentInvitationId', result.invitation.id);

      // Show success message
      setStep(STEPS.SUCCESS);
      showNotification(
        currentLang === 'fr' 
          ? 'Code d\'invitation validé avec succès!' 
          : 'Invitation code successfully validated!', 
        'success'
      );

      // Redirect to finalization page
      setTimeout(() => {
        // Clean URL and redirect
        window.history.replaceState({}, '', '/');
        handlePageChange('finalize-invitation');
      }, 1500);
    } catch (error) {
      console.error('Error validating invitation:', error);
      setError(currentLang === 'fr' 
        ? 'Une erreur est survenue lors de la validation du code d\'invitation' 
        : 'An error occurred while validating the invitation code');
      setLoading(false);
    }
  };

  // Form submission handler
  const handleValidationSubmit = (e) => {
    e.preventDefault();
    validateInvitation();
  };

  // =================================================================
  // CONDITIONAL RENDERING
  // =================================================================

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">
          {currentLang === 'fr' ? 'Validation en cours...' : 'Validating...'}
        </p>
      </div>
    );
  }

  // Success state
  if (step === STEPS.SUCCESS) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-green-500 mr-3" />
            <h2 className="text-xl font-bold">
              {currentLang === 'fr' ? 'Redirection...' : 'Redirecting...'}
            </h2>
          </div>
          <p className="text-center mb-4">
            {currentLang === 'fr'
              ? 'Votre code a été validé. Vous allez être redirigé(e) vers la prochaine étape.'
              : 'Your code has been validated. You will be redirected to the next step.'}
          </p>
        </div>
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
            <h2 className="text-xl font-bold">
              {currentLang === 'fr' ? 'Erreur' : 'Error'}
            </h2>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => setStep(STEPS.VALIDATION)}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors"
          >
            {currentLang === 'fr' ? 'Réessayer' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  // Validation form (default state)
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {currentLang === 'fr' ? 'Valider votre invitation' : 'Validate your invitation'}
        </h2>

        <form onSubmit={handleValidationSubmit} className="space-y-4">
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
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              <span>{currentLang === 'fr' ? 'Valider l\'invitation' : 'Validate invitation'}</span>
            </div>
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          {currentLang === 'fr'
            ? 'Entrez l\'email et le code d\'invitation que vous avez reçus'
            : 'Enter the email and invitation code you received'}
        </p>
      </div>
    </div>
  );
};

export default InvitationValidator;