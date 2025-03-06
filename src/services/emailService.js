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

export const emailService = {
  // ------- Envoi d'email d'invitation avec code -------
  async sendInvitationEmail(email, invitationId, organizationName) {
    try {
      console.log('Sending invitation email to:', email);

      // Générer un code d'invitation unique
      const code = await invitationsService.generateInvitationCode(invitationId);

      // Langue préférée de l'utilisateur
      const userLang = localStorage.getItem('preferredLanguage') || 'en';

      // Si en environnement de développement, simuler l'envoi
      if (isDevelopment) {
        console.log('=== INVITATION EMAIL SIMULATION ===');
        console.log(`To: ${email}`);
        console.log(`Subject: ${userLang === 'fr' ? `Invitation à rejoindre ${organizationName}` : `Invitation to join ${organizationName}`}`);
        console.log(`Code: ${code}`);
        console.log(`Link: ${BASE_URL}/register?email=${encodeURIComponent(email)}&code=${code}`);
        console.log('===================================');

        // Stocker le code dans le localStorage pour faciliter les tests
        window.localStorage.setItem('lastInvitationCode', code);
        window.localStorage.setItem('lastInvitationEmail', email);

        // Afficher une alerte avec le code pour faciliter le test
        alert(`Code d'invitation pour ${email}: ${code}`);

        return true;
      }

      // En production, appeler la fonction HTTP
      const response = await fetch('https://us-central1-i4tk-website.cloudfunctions.net/sendInvitationEmailHttp', {
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
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      console.log('Invitation email sent successfully', result);
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