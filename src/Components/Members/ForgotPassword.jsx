import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';
import { auth } from '../../services/firebase';
import { passwordResetService } from '../../services/passwordResetService';
import { usersService } from '../../services/usersService';
import PasswordForm from './PasswordForm';

const ForgotPassword = () => {
  const { setAuthPage, showNotification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, reset
  const [resetInfo, setResetInfo] = useState(null);

  // Vérifier si nous sommes dans un processus de réinitialisation
  useEffect(() => {
    const checkResetStatus = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const oobCode = params.get('oobCode');
        const resetId = params.get('resetId');

        if (oobCode) {
          // Vérifier la validité du code
          const result = await passwordResetService.verifyResetCode(oobCode);

          if (result.valid) {
            setResetInfo({ 
              oobCode, 
              email: result.email,
              resetId 
            });
            setStatus('reset');
          } else {
            setError('Le lien de réinitialisation est invalide ou a expiré.');
            setStatus('error');
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut de réinitialisation:', err);
        setError('Une erreur est survenue lors de la vérification du lien de réinitialisation.');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    checkResetStatus();
  }, []);

  // Gestion de la soumission du formulaire de mot de passe
  const handlePasswordSubmit = async ({ password }) => {
    try {
      setLoading(true);
      setError('');

      if (!resetInfo || !resetInfo.oobCode) {
        throw new Error('Données de réinitialisation manquantes');
      }

      // Confirmer la réinitialisation du mot de passe
      await passwordResetService.confirmReset(
        resetInfo.oobCode,
        password,
        resetInfo.resetId
      );

      // Afficher une notification et rediriger
      showNotification('Votre mot de passe a été réinitialisé avec succès', 'success');

      // Redirection vers la page de connexion après une pause pour que l'utilisateur puisse lire la notification
      setTimeout(() => {
        setAuthPage('login');
      }, 2000);

    } catch (err) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', err);
      setError(err.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la demande de réinitialisation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      // Vérifier si l'utilisateur existe et n'est pas supprimé
      const userCheck = await usersService.getUserByEmail(email);

      if (userCheck && userCheck.deleted) {
        // Simuler un succès même si l'utilisateur est supprimé (pour des raisons de sécurité)
        setStatus('success');
        return;
      }

      if (!userCheck) {
        // Simuler un succès même si l'utilisateur n'existe pas (pour des raisons de sécurité)
        setStatus('success');
        return;
      }

      // L'utilisateur existe, procéder à la réinitialisation
      await passwordResetService.requestPasswordReset(email);
      setStatus('success');

      // Notification plus visible et qui dure plus longtemps
      showNotification(
        'Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.', 
        'success',
        5000 // 5 secondes
      );
    } catch (err) {
      console.error('Erreur lors de la demande de réinitialisation:', err);
      // Pour des raisons de sécurité, ne pas divulguer d'informations spécifiques
      setStatus('success'); // Même en cas d'erreur, afficher un succès à l'utilisateur
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      {status === 'reset' ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Définir un nouveau mot de passe
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Veuillez entrer votre nouveau mot de passe ci-dessous.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          <PasswordForm 
            onSubmit={handlePasswordSubmit}
            buttonText="Réinitialiser le mot de passe"
            loading={loading}
          />
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Réinitialiser votre mot de passe
          </h2>
          {status === 'success' ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>
                  Si un compte existe avec cette adresse email, vous recevrez des instructions pour réinitialiser votre mot de passe.
                </p>
                <p className="mt-2">
                  Veuillez vérifier votre boîte de réception et vos spams.
                </p>
              </div>
              <button
                onClick={() => setAuthPage('login')}
                className="text-amber-600 hover:text-amber-700 mt-4 flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre adresse email"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Traitement en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-4 w-4 mr-2" />
                    <span>Envoyer les instructions</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAuthPage('login')}
                className="w-full text-gray-600 hover:text-gray-700 py-2 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;