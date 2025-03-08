const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Fonction pour gérer la validation et mise à jour des statuts de reset password
exports.handlePasswordReset = functions.https.onCall(async (data, context) => {
  try {
    const { resetId, email } = data;

    if (!resetId || !email) {
      throw new Error('Missing required parameters');
    }

    console.log(`Handling password reset request for ${email}, resetId: ${resetId}`);

    // Vérifier le document de réinitialisation
    const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
    const resetDoc = await resetRef.get();

    if (!resetDoc.exists) {
      console.log(`Reset document ${resetId} not found`);
      throw new Error('Invalid reset request');
    }

    const resetData = resetDoc.data();

    // Vérifier que l'email correspond
    if (resetData.email !== email.toLowerCase()) {
      console.log(`Email mismatch: ${resetData.email} vs ${email.toLowerCase()}`);
      throw new Error('Invalid reset request');
    }

    // Vérifier l'expiration
    if (resetData.expiresAt.toDate() < new Date()) {
      await resetRef.update({ status: 'expired' });
      throw new Error('Reset link expired');
    }

    // Marquer comme validé
    await resetRef.update({ 
      status: 'validated',
      validatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling password reset:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Fonction pour effectuer la réinitialisation du mot de passe
exports.confirmPasswordReset = functions.https.onCall(async (data, context) => {
  try {
    const { resetId, password } = data;

    if (!resetId || !password) {
      throw new Error('Missing required parameters');
    }

    console.log(`Confirming password reset for resetId: ${resetId}`);

    // Vérifier le document de réinitialisation
    const resetRef = admin.firestore().collection('passwordResets').doc(resetId);
    const resetDoc = await resetRef.get();

    if (!resetDoc.exists) {
      throw new Error('Invalid reset request');
    }

    const resetData = resetDoc.data();

    // Vérifier que le statut est validé
    if (resetData.status !== 'validated') {
      throw new Error('Reset link not validated');
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
    console.error('Error confirming password reset:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});