const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Fonction déclenchée lorsqu'un utilisateur est supprimé de Firestore
exports.deleteAuthUserOnFirestoreDelete = functions.firestore
  .onDocumentDeleted('users/{userId}', async (event) => {
    const userId = event.params.userId;

    try {
      console.log(`Tentative de suppression de l'utilisateur Auth pour ${userId}`);

      // Vérifier si l'utilisateur existe dans Auth
      try {
        await admin.auth().getUser(userId);

        // Si l'utilisateur existe, le supprimer
        await admin.auth().deleteUser(userId);
        console.log(`Utilisateur Auth ${userId} supprimé avec succès`);
        return true;
      } catch (authError) {
        // Si l'utilisateur n'existe pas dans Auth, c'est déjà OK
        if (authError.code === 'auth/user-not-found') {
          console.log(`Utilisateur Auth ${userId} n'existe pas ou a déjà été supprimé`);
          return true;
        }

        // Autre erreur Auth, la propager
        throw authError;
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur Auth ${userId}:`, error);
      return false;
    }
  });