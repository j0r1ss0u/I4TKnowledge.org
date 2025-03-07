const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Cloud Function qui marque l'email comme vérifié pour les utilisateurs créés via invitation
exports.verifyInvitedUserEmail = functions.firestore
  .onDocumentCreated('users/{userId}', (event) => {
    const snapshot = event.data;
    const userId = event.params.userId;

    // Si pas de données ou pas de snapshot, terminer
    if (!snapshot) {
      console.log('Pas de données dans le snapshot');
      return null;
    }

    const userData = snapshot.data();

    // Vérifier si l'utilisateur a été créé via une invitation
    if (userData && userData.invitationId) {
      console.log(`Marquer l'email comme vérifié pour l'utilisateur ${userId}`);

      // Retourner une promesse pour que la fonction attende sa résolution
      return admin.auth().updateUser(userId, {
        emailVerified: true
      })
      .then(() => {
        console.log(`Email marqué comme vérifié avec succès pour ${userId}`);
        return null;
      })
      .catch(error => {
        console.error(`Erreur lors de la mise à jour de emailVerified: ${error.message}`);
        return null;
      });
    }

    return null;
  });