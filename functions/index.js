const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({origin: true});

// Initialiser l'application Firebase Admin
admin.initializeApp();

exports.sendInvitationEmailHttp = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    console.log('Function called with data:', JSON.stringify(req.body, null, 2));

    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).send('Method Not Allowed');
        return;
      }

      // Récupérer les données
      const { email, invitationId, organizationName, code, language = 'fr' } = req.body;

      // Utiliser directement une clé en dur
      const SENDGRID_API_KEY = "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";

      // Configurer SendGrid avec la clé
      sgMail.setApiKey(SENDGRID_API_KEY);

      // Construire le contenu HTML en fonction de la langue
      const subject = language === 'fr' 
        ? `Invitation à rejoindre ${organizationName || 'notre organisation'}`
        : `Invitation to join ${organizationName || 'our organization'}`;

      const htmlContent = language === 'fr'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Vous avez été invité(e) à rejoindre ${organizationName || 'notre organisation'}</h2>
            <p>Pour accepter cette invitation, veuillez utiliser le code suivant :</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Ou cliquez directement sur ce lien :</p>
            <a href="https://i4tknowledge.org/?email=${encodeURIComponent(email)}&code=${code}#/register"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accepter l'invitation
            </a>
            <p>Cette invitation expirera dans 7 jours.</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You have been invited to join ${organizationName || 'our organization'}</h2>
            <p>To accept this invitation, please use the following code:</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Or click directly on this link:</p>
            <a href="https://i4tknowledge.org/?email=${encodeURIComponent(email)}&code=${code}#/register"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accept invitation
            </a>
            <p>This invitation will expire in 7 days.</p>
          </div>
        `;

      // Créer le message
      const msg = {
        to: email,
        from: {
          email: 'noreply@i4tknowledge.org',
          name: 'I4TK'
        },
        subject: subject,
        html: htmlContent,
        // Désactiver le suivi des clics pour éviter les problèmes de sous-domaine
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          },
          subscriptionTracking: {
            enable: false
          }
        }
      };

      console.log('Preparing to send email to:', email);

      // Variable pour éviter le double envoi
      let emailSent = false;

      try {
        // Envoyer l'email seulement si pas déjà envoyé
        if (!emailSent) {
          const result = await sgMail.send(msg);
          emailSent = true;
          console.log('Email sent successfully:', JSON.stringify(result));
        }

        // Répondre avec succès
        res.status(200).json({
          success: true,
          message: 'Email sent successfully'
        });
      } catch (sgError) {
        console.error('SendGrid error:', sgError.toString());

        // Pour un meilleur débogage
        if (sgError.response) {
          console.error('SendGrid response error:', JSON.stringify(sgError.response.body));
        }

        res.status(500).json({
          error: 'Failed to send email via SendGrid',
          details: sgError.message
        });
      }
    } catch (error) {
      console.error('General error:', error.toString());
      res.status(500).json({
        error: 'Server error',
        details: error.message
      });
    }
  });
});