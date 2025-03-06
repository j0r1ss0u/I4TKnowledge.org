// =================================================================
// FinalizeInvitation.jsx
// Composant simplifié de finalisation d'invitation utilisateur
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { documentsService } from '../../services/documentsService';
import { torService } from '../../services/torService';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../Components/AuthContext';
import PasswordForm from './PasswordForm';

// =================================================================
// Constantes
// =================================================================

const STEPS = {
  LOADING: 'loading',
  TOR: 'tor',
  PASSWORD: 'password',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// =================================================================
// Composant Principal
// =================================================================

const FinalizeInvitation = ({ handlePageChange }) => {
  // ------- Contexte et état local -------
  const { showNotification } = useAuth();
  const [step, setStep] = useState(STEPS.LOADING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [torDocument, setTorDocument] = useState(null);
  const [acceptTor, setAcceptTor] = useState(false);

  // ------- Initialisation -------
  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);

        // Attendre un court délai pour s'assurer que l'authentification est prête
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Vérifier si l'utilisateur est connecté
        if (!auth.currentUser) {
          // Au lieu de lancer une erreur, essayer de récupérer l'invitation directement
          const invitationId = localStorage.getItem('currentInvitationId');
          if (!invitationId) {
            throw new Error('Invitation non trouvée');
          }

          // Rediriger vers la page de connexion si nécessaire
          // Mais continuer à essayer de charger l'invitation
          console.log('Utilisateur non connecté, redirection vers la connexion');
          // handlePageChange('login'); // Commenté pour éviter la redirection immédiate
        }

        // 2. Récupérer l'ID d'invitation du localStorage
        const invitationId = localStorage.getItem('currentInvitationId');
        if (!invitationId) {
          throw new Error('Invitation non trouvée');
        }

        // 3. Valider l'invitation
        console.log('Récupération de l\'invitation:', invitationId);
        const invitationResult = await invitationsService.validateInvitation(invitationId);

        if (!invitationResult.valid) {
          throw new Error(invitationResult.message || 'Invitation invalide');
        }

        const invitationData = invitationResult.invitation;

        // 4. Vérifier l'email de l'invitation
        // Si l'utilisateur n'est pas connecté, on utilise l'email de l'invitation
        const userEmail = auth.currentUser?.email || invitationData.email;
        if (invitationData.email !== userEmail) {
          console.warn('L\'email de l\'invitation ne correspond pas à l\'utilisateur connecté');
          // On continue quand même pour permettre le flux
        }

        // 5. Récupérer le document des conditions d'utilisation
        const torResults = await documentsService.semanticSearch('TERMS OF REFERENCE');
        if (!torResults || torResults.length === 0) {
          throw new Error('Document des conditions d\'utilisation introuvable');
        }

        // 6. Mettre à jour l'état
        setInvitation(invitationData);
        setTorDocument(torResults[0]);
        setStep(STEPS.TOR);

      } catch (err) {
        console.error('Erreur lors du chargement de l\'invitation:', err);
        setError(err.message);
        setStep(STEPS.ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, []);

  // ------- Acceptation des conditions d'utilisation -------
  const handleTorAccept = async () => {
    if (!acceptTor) {
      setError('Vous devez accepter les conditions d\'utilisation pour continuer');
      return;
    }

    try {
      setStep(STEPS.PROCESSING);

      // Enregistrer l'acceptation des conditions d'utilisation
      await torService.acceptToR(invitation.email, torDocument.id);
      console.log('Conditions d\'utilisation acceptées');

      // Passer à l'étape suivante
      setStep(STEPS.PASSWORD);
      setError(null);

    } catch (err) {
      console.error('Erreur lors de l\'acceptation des conditions:', err);
      setError(err.message);
      setStep(STEPS.TOR); // Revenir à l'étape précédente
    }
  };

  // ------- Création du mot de passe et finalisation -------
  const handlePasswordSubmit = async ({ password }) => {
    try {
      setStep(STEPS.PROCESSING);

      if (!invitation || !invitation.id) {
        throw new Error('Données d\'invitation manquantes');
      }

      // Stocker les informations nécessaires pour une reconnexion
      localStorage.setItem('finalizationEmail', invitation.email);
      localStorage.setItem('pendingPassword', password);
      localStorage.setItem('finalizationCompleted', 'true');

      // 1. Finaliser l'invitation avec le mot de passe
      console.log('Finalisation de l\'invitation avec le mot de passe');
      const result = await invitationsService.acceptInvitation(invitation.id, { password });
      console.log('Résultat de l\'acceptation:', result);

      // 2. Attendre que les modifications soient appliquées
      console.log('Attente de la propagation des modifications...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. S'assurer que l'utilisateur est toujours connecté
      if (!auth.currentUser) {
        console.log('L\'utilisateur a été déconnecté, tentative de reconnexion');
        try {
          // Importer le service d'authentification
          const { firebaseAuthService } = await import('../../services/firebaseAuthService');

          // Connexion avec les identifiants stockés
          await firebaseAuthService.loginUser(invitation.email, password);
          console.log('Reconnexion réussie');
        } catch (loginError) {
          console.error('Erreur lors de la reconnexion:', loginError);
          throw new Error('Impossible de vous connecter avec vos identifiants. Veuillez réessayer.');
        }
      } else {
        // Recharger l'utilisateur pour actualiser ses informations
        await auth.currentUser.reload();
        console.log('Utilisateur rechargé avec succès');
      }

      // 4. Afficher un message de succès
      console.log('Invitation acceptée avec succès');
      setStep(STEPS.SUCCESS);
      showNotification('Votre compte a été créé avec succès!', 'success', 5000);

      // 5. Nettoyer le localStorage des données d'invitation
      localStorage.removeItem('currentInvitationId');

      // 6. Rediriger vers la page d'accueil
      setTimeout(() => {
        window.location.href = '/'; // Force un rechargement complet plutôt qu'une navigation SPA
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la finalisation de l\'invitation:', err);
      setError(err.message);
      setStep(STEPS.PASSWORD); // Revenir à l'étape du mot de passe

      // Nettoyer les données sensibles en cas d'erreur
      localStorage.removeItem('pendingPassword');
      localStorage.removeItem('finalizationCompleted');
    }
  };

  // ------- Rendus conditionnels -------

  // État de chargement
  if (step === STEPS.LOADING || step === STEPS.PROCESSING) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">
          {step === STEPS.LOADING ? 'Chargement...' : 'Traitement en cours...'}
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
            <h2 className="text-xl font-bold">Erreur</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => handlePageChange('home')}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors"
          >
            Retour à l'accueil
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
            <h2 className="text-xl font-bold">Inscription réussie!</h2>
          </div>
          <p className="text-center mb-4">
            Votre compte a été créé avec succès. Vous allez être redirigé(e) vers la page d'accueil.
          </p>
          <div className="flex justify-center">
            <div className="animate-pulse h-2 w-24 bg-green-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Étape des conditions d'utilisation
  if (step === STEPS.TOR) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              Conditions d'utilisation
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
                        Voir le document complet
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
                      J'ai lu et j'accepte les conditions d'utilisation
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
                    Continuer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Étape de création du mot de passe
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Créer un mot de passe
          </h2>

          <p className="text-gray-600 mb-6 text-center">
            Dernière étape ! Veuillez créer un mot de passe sécurisé pour votre compte.
          </p>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <PasswordForm 
            onSubmit={handlePasswordSubmit}
            buttonText="Finaliser l'inscription"
          />
        </div>
      </div>
    </div>
  );
};

export default FinalizeInvitation;