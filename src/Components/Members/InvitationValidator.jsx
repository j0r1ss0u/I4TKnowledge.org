// =================================================================
// InvitationValidator.jsx
// Composant de validation d'invitation et création de compte utilisateur
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { Loader2, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';

// =================================================================
// Constantes
// =================================================================

const STEPS = {
  VALIDATION: 'validation',
  ACCOUNT_SETUP: 'account_setup',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// =================================================================
// Composant Principal
// =================================================================

const InvitationValidator = ({ handlePageChange }) => {
  // ------- Contexte et état local -------
  const { showNotification } = useAuth();
  const [step, setStep] = useState(STEPS.VALIDATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  // Formulaires
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentLang, setCurrentLang] = useState('en'); // Language state

  // ------- Pré-remplissage des champs à partir de l'URL -------
  useEffect(() => {
    // Récupérer tout ce qui se trouve après le hash
    const hashPart = window.location.hash;

    // Extraire les paramètres de la partie après le hash
    const queryString = hashPart.split('?')[1];

    if (queryString) {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const codeParam = params.get('code');
      const langParam = params.get('lang') || 'en';

      if (emailParam) setEmail(emailParam);
      if (codeParam) setCode(codeParam);
      setCurrentLang(langParam);

      // Si les deux paramètres sont présents, valider automatiquement
      if (emailParam && codeParam) {
        validateInvitation(emailParam, codeParam);
      }
    }
  }, []);

  // ------- Validation du code d'invitation -------
  const validateInvitation = async (emailToValidate, codeToValidate) => {
    setLoading(true);
    setError(null);

    try {
      // Utiliser les paramètres passés ou les valeurs d'état
      const emailValue = emailToValidate || email;
      const codeValue = codeToValidate || code;

      console.log('Validation de l\'invitation:', emailValue, codeValue);

      // Valider le code d'invitation
      const result = await invitationsService.validateInvitationCode(emailValue, codeValue);

      if (!result.valid) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Stocker les informations d'invitation
      setInvitation(result.invitation);

      // Passer à l'étape de création de compte
      setStep(STEPS.ACCOUNT_SETUP);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la validation de l\'invitation:', error);
      setError(currentLang === 'fr' 
        ? 'Une erreur est survenue lors de la validation du code d\'invitation' 
        : 'An error occurred while validating the invitation code');
      setLoading(false);
    }
  };

  // ------- Soumission du formulaire de validation -------
  const handleValidationSubmit = (e) => {
    e.preventDefault();
    validateInvitation();
  };

  // ------- Création du compte utilisateur -------
  const handleAccountSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation des mots de passe
      if (password !== confirmPassword) {
        setError(currentLang === 'fr' 
          ? 'Les mots de passe ne correspondent pas' 
          : 'Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError(currentLang === 'fr' 
          ? 'Le mot de passe doit contenir au moins 8 caractères' 
          : 'Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      // Passer à l'étape de traitement
      setStep(STEPS.PROCESSING);

      // Créer le compte utilisateur
      await invitationsService.createUserFromInvitation(invitation.id, {
        password: password
      });

      // Stocker l'ID d'invitation pour la finalisation
      localStorage.setItem('currentInvitationId', invitation.id);

      // Afficher un message de succès
      setStep(STEPS.SUCCESS);
      showNotification(
        currentLang === 'fr' 
          ? 'Compte créé! Vous allez maintenant être dirigé vers les conditions d\'utilisation.' 
          : 'Account created! You will now be directed to the terms of reference.', 
        'success', 
        5000
      );

      // Rediriger vers la page de finalisation
      setTimeout(() => {
        window.location.href = '/#finalize-invitation';
      }, 3000);
      } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      setError(error.message);
      setStep(STEPS.ACCOUNT_SETUP);
      setLoading(false);
    }
  };

  // ------- Rendus conditionnels -------

  // État de chargement
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">
          {currentLang === 'fr' ? 'Traitement en cours...' : 'Processing...'}
        </p>
      </div>
    );
  }

  // État d'erreur
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
            onClick={() => handlePageChange('home')}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors"
          >
            {currentLang === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  // État de succès
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
              : 'Your account has been successfully created. You will be redirected to the home page.'}
          </p>
          <div className="flex justify-center">
            <div className="animate-pulse h-2 w-24 bg-green-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Étape de validation du code d'invitation
  if (step === STEPS.VALIDATION) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {currentLang === 'fr' ? 'Accepter une invitation' : 'Accept invitation'}
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
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>{currentLang === 'fr' ? 'Validation en cours...' : 'Validating...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  <span>{currentLang === 'fr' ? 'Valider l\'invitation' : 'Validate invitation'}</span>
                </div>
              )}
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
  }

  // Étape de création de compte
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {currentLang === 'fr' ? 'Créer votre compte' : 'Create your account'}
        </h2>

        <p className="text-gray-600 mb-6 text-center">
          {currentLang === 'fr'
            ? `Vous rejoignez ${invitation?.organization || 'l\'organisation'} en tant que ${invitation?.role === 'validator' ? 'validateur' : 'membre'}.`
            : `You're joining ${invitation?.organization || 'the organization'} as a ${invitation?.role === 'validator' ? 'validator' : 'member'}.`}
        </p>

        <form onSubmit={handleAccountSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentLang === 'fr' ? 'Email' : 'Email'}
            </label>
            <input
              type="email"
              value={invitation?.email || email}
              className="w-full px-4 py-2 border rounded-md bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentLang === 'fr' ? 'Vous ne pouvez pas modifier cet email' : 'You cannot change this email'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentLang === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
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
              className="w-full px-4 py-2 border rounded-md"
              minLength={8}
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
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>{currentLang === 'fr' ? 'Création du compte...' : 'Creating account...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ArrowRight className="h-5 w-5 mr-2" />
                <span>{currentLang === 'fr' ? 'Créer mon compte' : 'Create my account'}</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvitationValidator;