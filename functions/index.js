const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({origin: true});
const userManagement = require('./src/userManagement');
const passwordReset = require('./src/passwordReset');

// Initialiser l'application Firebase Admin
// Cette ligne est importante - elle permet d'initialiser admin une seule fois
admin.initializeApp();

// Importer la nouvelle fonction d'authentification
const auth = require('./src/auth');

// Fonction existante pour envoyer des emails d'invitation
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

      // Vérifier que les données requises sont présentes
      if (!email || !invitationId || !code) {
        console.log('Missing required data:', { email, invitationId, code });
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      // Utiliser directement une clé en dur
      const SENDGRID_API_KEY = "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";

      // Configurer SendGrid avec la clé
      sgMail.setApiKey(SENDGRID_API_KEY);

      // Construire le lien d'invitation - IMPORTANT : définir cette variable avant de l'utiliser
      const invitationLink = `https://i4tknowledge.org/?email=${encodeURIComponent(email)}&code=${code}#register`;

      // Construire le contenu HTML en fonction de la langue
      const subject = language === 'fr' 
        ? `Invitation à rejoindre ${organizationName || 'notre organisation'}`
        : `Invitation to join ${organizationName || 'our organization'}`;
      const htmlContent = language === 'fr'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Vous avez été invité(e) à rejoindre ${organizationName || 'notre organisation'}</h2>
            <p>Vous avez reçu cette invitation pour rejoindre notre plateforme collaborative.</p>
            <p>Cliquez sur le bouton ci-dessous pour accepter cette invitation :</p>
            <a href="${invitationLink}"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accepter l'invitation
            </a>
            <p style="margin-top: 20px;">Si le bouton ci-dessus ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #333;">${invitationLink}</p>
            <p>Cette invitation expirera dans 7 jours.</p>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Si vous rencontrez des problèmes pour vous connecter après avoir accepté l'invitation, 
              veuillez vérifier votre email - un message de confirmation pourrait avoir été envoyé.
            </p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You have been invited to join ${organizationName || 'our organization'}</h2>
            <p>You have received this invitation to join our collaborative platform.</p>
            <p>Click the button below to accept this invitation:</p>
            <a href="${invitationLink}"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accept invitation
            </a>
            <p style="margin-top: 20px;">If the above button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #333;">${invitationLink}</p>
            <p>This invitation will expire in 7 days.</p>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you encounter any issues logging in after accepting the invitation, 
              please check your email - a confirmation message might have been sent.
            </p>
          </div>
        `;

      // Créer le message
      const msg = {
        to: email,
        from: {
          email: 'noreply@i4tknowledge.org',
          name: 'I4T Knowledge operation team'
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

      try {
        // Envoyer l'email
        const result = await sgMail.send(msg);
        console.log('Email sent successfully:', JSON.stringify(result));

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

// Exportation de la nouvelle fonction pour vérifier les emails
exports.verifyInvitedUserEmail = auth.verifyInvitedUserEmail;
exports.deleteAuthUserOnFirestoreDelete = userManagement.deleteAuthUserOnFirestoreDelete;
exports.handlePasswordReset = passwordReset.handlePasswordReset;
exports.confirmPasswordReset = passwordReset.confirmPasswordReset;


// Fonction pour l'envoi d'emails de réinitialisation de mot de passe
exports.sendResetPasswordEmailHttp = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    console.log('Reset password function called with data:', JSON.stringify(req.body, null, 2));

    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).send('Method Not Allowed');
        return;
      }

      // Récupérer les données
      const { email, resetId, language = 'fr' } = req.body;

      // Vérifier que les données requises sont présentes
      if (!email || !resetId) {
        console.log('Missing required data:', { email, resetId });
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      // Utiliser directement une clé en dur (même clé que pour les invitations)
      const SENDGRID_API_KEY = "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";

      // Configurer SendGrid avec la clé
      sgMail.setApiKey(SENDGRID_API_KEY);

      // Générer un code pour la validation
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                  Math.random().toString(36).substring(2, 6).toUpperCase();

      // Mettre à jour le document avec le code
      const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
      await resetRef.update({
        resetCode: code,
        codeGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Construire le lien de réinitialisation
      const resetLink = `https://i4tknowledge.org/?resetId=${resetId}&code=${code}#reset-password`;

      // Construire le contenu HTML en fonction de la langue
      const subject = language === 'fr' 
        ? `Réinitialisation de votre mot de passe I4TK`
        : `Reset your I4TK password`;

      const htmlContent = language === 'fr'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <a href="${resetLink}"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Réinitialiser mon mot de passe
            </a>
            <p style="margin-top: 20px;">Si le bouton ci-dessus ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #333;">${resetLink}</p>
            <p>Cette demande expirera dans 24 heures.</p>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
            </p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetLink}"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Reset my password
            </a>
            <p style="margin-top: 20px;">If the above button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #333;">${resetLink}</p>
            <p>This request will expire in 24 hours.</p>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you did not request this reset, you can safely ignore this email.
            </p>
          </div>
        `;

      // Créer le message
      const msg = {
        to: email,
        from: {
          email: 'noreply@i4tknowledge.org',
          name: 'I4T Knowledge operation team'
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

      console.log('Preparing to send reset password email to:', email);

      try {
        // Envoyer l'email
        const result = await sgMail.send(msg);
        console.log('Reset password email sent successfully:', JSON.stringify(result));

        // Répondre avec succès
        res.status(200).json({
          success: true,
          message: 'Reset password email sent successfully'
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

// Cloud Function pour la validation du code
exports.validateResetCodeHttp = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('validateResetCodeHttp called with body:', JSON.stringify(req.body, null, 2));

      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { resetId, code } = req.body;

      if (!resetId || !code) {
        console.error('Missing required parameters:', JSON.stringify(req.body, null, 2));
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
      }

      // Logique de validation
      const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
      const resetDoc = await resetRef.get();

      if (!resetDoc.exists) {
        console.error('Reset document not found:', resetId);
        return res.status(404).json({ success: false, error: 'Invalid reset request' });
      }

      const resetData = resetDoc.data();
      console.log('Reset data:', JSON.stringify(resetData, null, 2));

      if (resetData.resetCode !== code) {
        console.error('Code mismatch - Expected:', resetData.resetCode, 'Received:', code);
        return res.status(403).json({ success: false, error: 'Invalid reset code' });
      }

      // Vérifier l'expiration
      if (resetData.expiresAt && resetData.expiresAt.toDate() < new Date()) {
        console.log('Reset request expired');
        await resetRef.update({ status: 'expired' });
        return res.status(410).json({ success: false, error: 'Reset link expired' });
      }

      // Mise à jour du statut
      await resetRef.update({ 
        status: 'validated',
        validatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Reset code validated successfully');
      return res.status(200).json({ 
        success: true, 
        email: resetData.email 
      });
    } catch (error) {
      console.error('Error validating reset code:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });
});

// Cloud Function pour compléter la réinitialisation du mot de passe
exports.completePasswordResetHttp = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('completePasswordResetHttp called with body:', JSON.stringify(req.body, null, 2));

      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { resetId, password } = req.body;

      if (!resetId || !password) {
        console.error('Missing required parameters:', JSON.stringify(req.body, null, 2));
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
      }

      // Vérifier le document de réinitialisation
      const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
      const resetDoc = await resetRef.get();

      if (!resetDoc.exists) {
        console.error('Reset document not found:', resetId);
        return res.status(404).json({ success: false, error: 'Invalid reset request' });
      }

      const resetData = resetDoc.data();
      console.log('Reset data:', JSON.stringify(resetData, null, 2));

      // Vérifier que le statut est validé
      if (resetData.status !== 'validated') {
        console.error('Reset request not validated. Current status:', resetData.status);
        return res.status(400).json({ success: false, error: 'Reset request not validated' });
      }

      // Vérifier l'expiration
      if (resetData.expiresAt && resetData.expiresAt.toDate() < new Date()) {
        console.log('Reset request expired');
        await resetRef.update({ status: 'expired' });
        return res.status(410).json({ success: false, error: 'Reset link expired' });
      }

      // Trouver l'utilisateur par email
      console.log('Finding user by email:', resetData.email);
      const userRecord = await admin.auth().getUserByEmail(resetData.email);

      // Mettre à jour le mot de passe
      console.log('Updating password for user:', userRecord.uid);
      await admin.auth().updateUser(userRecord.uid, {
        password: password
      });

      // Marquer comme complété
      await resetRef.update({ 
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Password reset completed successfully');
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error completing password reset:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
      });
    }
  });
});