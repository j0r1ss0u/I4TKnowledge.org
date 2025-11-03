// =================================================================
// emailService.js
// Service de gestion des emails de l'application
// =================================================================
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { invitationsService } from './invitationsService';

// Configuration de base
const BASE_URL = 'https://i4tknowledge.org';

// Configuration des liens
const actionCodeSettings = {
  url: BASE_URL,
  handleCodeInApp: false
};

// Détection de l'environnement
const isDevelopment = window.location.hostname.includes('replit.dev') || 
                     window.location.hostname.includes('localhost');

// Fonction pour obtenir l'URL du backend
const getBackendUrl = () => {
  // Si une URL explicite est configurée, l'utiliser
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl;
  }
  
  // Sinon, détecter automatiquement selon l'environnement
  const origin = window.location.origin;
  
  // Remplacer le port de l'URL actuelle par 3000
  // Cela fonctionne pour Replit (*.replit.dev) et production (www.i4tknowledge.org)
  try {
    const url = new URL(origin);
    url.port = '3000';
    return url.toString().replace(/\/$/, ''); // Enlever le slash final
  } catch (e) {
    // Fallback si quelque chose ne va pas
    return 'http://localhost:3000';
  }
};

export const emailService = {
  // ------- Envoi d'email d'invitation avec code -------
  async sendInvitationEmail(email, invitationId, organizationName) {
    try {
      console.log('Sending invitation email to:', email);

      // Générer un code d'invitation unique
      const code = await invitationsService.generateInvitationCode(invitationId);

      // Langue préférée de l'utilisateur
      const userLang = localStorage.getItem('preferredLanguage') || 'en';

      // Déterminer l'URL du backend selon l'environnement
      const backendBaseUrl = getBackendUrl();
      const backendUrl = `${backendBaseUrl}/api/send-invitation-email`;

      console.log('Calling backend email service:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          invitationId,
          organizationName,
          code,
          language: userLang
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend email service error:', errorData);
        throw new Error(errorData.error || errorData.details || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      console.log('Invitation email sent successfully via backend:', result);
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw error;
    }
  },

  // ------- Envoi d'email de réinitialisation de mot de passe -------
  async sendResetPasswordEmail(email, resetId) {
    try {
      console.log('Sending password reset email to:', email);

      // Si en environnement de développement, simuler l'envoi
      if (isDevelopment) {
        console.log('=== RESET PASSWORD EMAIL SIMULATION ===');
        console.log(`To: ${email}`);
        console.log(`Reset Link: ${BASE_URL}/reset-password?resetId=${resetId}&email=${encodeURIComponent(email)}`);
        console.log('========================================');

        // Stocker l'ID dans le localStorage pour faciliter les tests
        window.localStorage.setItem('lastResetId', resetId);
        window.localStorage.setItem('lastResetEmail', email);

        return true;
      }

      // En production, utiliser la fonction native de Firebase
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email, {
        ...actionCodeSettings,
        url: `${BASE_URL}/reset-password?resetId=${resetId}&email=${encodeURIComponent(email)}`
      });

      console.log('Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw error;
    }
  }
};

export default emailService;