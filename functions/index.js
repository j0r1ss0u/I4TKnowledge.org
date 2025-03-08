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
            <a href="https://i4tknowledge.org/?email=${encodeURIComponent(email)}&code=${code}#register"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accepter l'invitation
            </a>
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
            <p>To accept this invitation, please use the following code:</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Or click directly on this link:</p>
            <a href="https://i4tknowledge.org/?email=${encodeURIComponent(email)}&code=${code}#register"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Accept invitation
            </a>
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

// Exportation de la nouvelle fonction pour vérifier les emails
exports.verifyInvitedUserEmail = auth.verifyInvitedUserEmail;
exports.deleteAuthUserOnFirestoreDelete = userManagement.deleteAuthUserOnFirestoreDelete;
exports.handlePasswordReset = passwordReset.handlePasswordReset;
exports.confirmPasswordReset = passwordReset.confirmPasswordReset;


// Dans functions/index.js, ajoutez cette fonction

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

      // Construire le contenu HTML en fonction de la langue
      const subject = language === 'fr' 
        ? `Réinitialisation de votre mot de passe I4TK`
        : `Reset your I4TK password`;
      const htmlContent = language === 'fr'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code suivant pour confirmer :</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Ou cliquez directement sur ce lien :</p>
            <a href="https://i4tknowledge.org/?resetId=${resetId}&code=${code}#reset-password"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Réinitialiser mon mot de passe
            </a>
            <p>Cette demande expirera dans 24 heures.</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Use the following code to confirm:</p>
            <div style="padding: 15px; background-color: #f5f5f5; font-size: 20px; text-align: center; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
              ${code}
            </div>
            <p>Or click directly on this link:</p>
            <a href="https://i4tknowledge.org/?resetId=${resetId}&code=${code}#reset-password"
               style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Reset my password
            </a>
            <p>This request will expire in 24 hours.</p>
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

      console.log('Preparing to send reset password email to:', email);

      // Variable pour éviter le double envoi
      let emailSent = false;

      try {
        // Envoyer l'email seulement si pas déjà envoyé
        if (!emailSent) {
          const result = await sgMail.send(msg);
          emailSent = true;
          console.log('Reset password email sent successfully:', JSON.stringify(result));
        }

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
exports.validateResetCode = functions.https.onCall(async (data, context) => {
  try {
    // Ne pas logger l'objet data complet qui pourrait contenir des structures circulaires
    console.log('validateResetCode called with resetId:', data?.resetId, 'and code:', data?.code);

    // Extraire les valeurs nécessaires de la requête
    const resetId = data?.resetId;
    const code = data?.code;

    if (!resetId || !code) {
      console.error('Missing required parameters: resetId or code');
      throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Récupérer le document de réinitialisation
    const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
    const resetDoc = await resetRef.get();

    if (!resetDoc.exists) {
      console.error('Reset document not found for resetId:', resetId);
      throw new functions.https.HttpsError('not-found', 'Invalid reset request');
    }

    const resetData = resetDoc.data();

    // Vérifier que le code correspond
    if (resetData.resetCode !== code) {
      console.error('Code mismatch for resetId:', resetId);
      throw new functions.https.HttpsError('permission-denied', 'Invalid reset code');
    }

    // Vérifier l'expiration
    if (resetData.expiresAt.toDate() < new Date()) {
      await resetRef.update({ status: 'expired' });
      throw new functions.https.HttpsError('deadline-exceeded', 'Reset link expired');
    }

    // Marquer comme validé
    await resetRef.update({ 
      status: 'validated',
      validatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Retourner un nouvel objet simple sans référence circulaire
    return { 
      success: true,
      email: resetData.email
    };
  } catch (error) {
    // Log uniquement le message d'erreur, pas l'objet erreur complet
    console.error('Error validating reset code:', error.message);

    // Créer une nouvelle erreur HTTP avec seulement les informations nécessaires
    throw new functions.https.HttpsError(
      error.code || 'internal', 
      error.message || 'An error occurred validating the reset code'
    );
  }
});

// Cloud Function pour la réinitialisation du mot de passe
exports.completePasswordReset = functions.https.onCall(async (data, context) => {
  try {
    const { resetId, password } = data;

    if (!resetId || !password) {
      throw new Error('Missing required parameters');
    }

    console.log(`Completing password reset for resetId: ${resetId}`);

    // Vérifier le document de réinitialisation
    const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
    const resetDoc = await resetRef.get();

    if (!resetDoc.exists) {
      throw new Error('Invalid reset request');
    }

    const resetData = resetDoc.data();

    // Vérifier que le statut est validé
    if (resetData.status !== 'validated') {
      throw new Error('Reset request not validated');
    }

    // Vérifier l'expiration
    if (resetData.expiresAt.toDate() < new Date()) {
      await resetRef.update({ status: 'expired' });
      throw new Error('Reset link expired');
    }

    // Trouver l'utilisateur par email
    const userRecord = await admin.auth().getUserByEmail(resetData.email);

    // Mettre à jour le mot de passe
    await admin.auth().updateUser(userRecord.uid, {
      password: password
    });

    // Marquer comme complété
    await resetRef.update({ 
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error completing password reset:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
