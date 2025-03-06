// =================================================================
// emailService.js
// Service de gestion des emails de l'application
// =================================================================
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { invitationsService } from './invitationsService';
import sgMail from '@sendgrid/mail';

// Configuration de base
const BASE_URL = 'https://i4tknowledge.org';

// Configuration des liens
const actionCodeSettings = {
  url: BASE_URL,
  handleCodeInApp: false
};

// Configuration de SendGrid avec la clé API
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

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

      // Préparer le contenu de l'email
      const subject = userLang === 'fr' 
        ? `Invitation à rejoindre ${organizationName}` 
        : `Invitation to join ${organizationName}`;

      const htmlContent = userLang === 'fr'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Vous avez été invité(e) à rejoindre ${organizationName}</h2>
            <p>Pour accepter cette invitation, veuillez utiliser le code suivant :</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Ou cliquez directement sur ce lien :</p>
            <a href="${BASE_URL}/register?email=${encodeURIComponent(email)}&code=${code}" style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accepter l'invitation
            </a>
            <p>Cette invitation expirera dans 7 jours.</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You have been invited to join ${organizationName}</h2>
            <p>To accept this invitation, please use the following code:</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Or click directly on this link:</p>
            <a href="${BASE_URL}/register?email=${encodeURIComponent(email)}&code=${code}" style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accept invitation
            </a>
            <p>This invitation will expire in 7 days.</p>
          </div>
        `;

      // Si en environnement de développement, simuler l'envoi
      if (isDevelopment) {
        console.log('=== INVITATION EMAIL SIMULATION ===');
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
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

      // En production, envoyer l'email avec SendGrid
      const msg = {
        to: email,
        from: {
          email: 'noreply@i4tknowledge.org',
          name: 'I4TK'
        },
        subject: subject,
        html: htmlContent
      };

      // Envoi de l'email avec la bibliothèque SendGrid
      const response = await sgMail.send(msg);
      console.log('Invitation email sent successfully', response);
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