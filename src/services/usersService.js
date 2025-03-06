// =================================================================
// usersService.js
// Service de gestion des utilisateurs avec synchronisation Auth et Firestore
// =================================================================
import { auth, db } from './firebase';
import { 
  collection, 
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { 
  deleteUser as authDeleteUser,
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';

export const usersService = {
  // ------- Récupérer tous les utilisateurs -------
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // ------- Mettre à jour un utilisateur -------
  async updateUser(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return {
        uid,
        ...userData
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Supprimer un utilisateur (Firestore + Auth si possible) -------
  async deleteUser(uid) {
    try {
      console.log('Suppression de l\'utilisateur:', uid);

      // 1. Récupérer les données de l'utilisateur pour référence future
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      let userData = null;

      if (userDoc.exists()) {
        userData = userDoc.data();
      }

      // 2. Supprimer de Firestore
      await deleteDoc(userRef);
      console.log('Utilisateur supprimé de Firestore');

      // 3. Ajouter aux utilisateurs supprimés pour le suivi et bloquer les reconnexions
      if (userData) {
        await setDoc(doc(db, 'deletedUsers', uid), {
          ...userData,
          deletedAt: serverTimestamp(),
          deletedBy: auth.currentUser ? auth.currentUser.uid : 'system'
        });
      }

      // 4. Tentative de suppression dans Auth (si c'est l'utilisateur actuel)
      if (auth.currentUser && auth.currentUser.uid === uid) {
        try {
          // Si l'utilisateur se supprime lui-même
          await authDeleteUser(auth.currentUser);
          console.log('Utilisateur supprimé de Auth');
        } catch (authError) {
          console.error('Erreur lors de la suppression de l\'utilisateur de Auth:', authError);
          // On continue malgré l'erreur car l'utilisateur est marqué comme supprimé dans Firestore
        }
      } else {
        // Note: La suppression côté serveur via Cloud Functions serait plus adaptée ici
        console.log('Pour une suppression complète, une fonction Cloud Functions est recommandée');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Vérifier si un utilisateur a été supprimé -------
  async checkIfUserDeleted(uid, email) {
    try {
      // Vérifier dans la collection des utilisateurs supprimés
      if (uid) {
        const deletedRef = doc(db, 'deletedUsers', uid);
        const deletedDoc = await getDoc(deletedRef);
        if (deletedDoc.exists()) {
          return true;
        }
      }

      // Vérifier par email si l'UID n'est pas fourni ou n'a pas été trouvé
      if (email) {
        const deletedRef = collection(db, 'deletedUsers');
        const q = query(deletedRef, where('email', '==', email.toLowerCase()));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de suppression:', error);
      return false; // En cas d'erreur, nous supposons que l'utilisateur n'est pas supprimé
    }
  },

  // ------- Obtenir les utilisateurs par organisation -------
  async getUsersByOrganization(organizationId) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par organisation:', error);
      throw error;
    }
  },

  // ------- Obtenir un utilisateur par ID -------
  async getUserById(uid) {
    try {
      // Vérifier d'abord si l'utilisateur a été supprimé
      const isDeleted = await this.checkIfUserDeleted(uid);
      if (isDeleted) {
        return { deleted: true };
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        return null;
      }
      return {
        uid: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Obtenir un utilisateur par email -------
  async getUserByEmail(email) {
    try {
      if (!email) return null;

      // Vérifier d'abord si l'utilisateur a été supprimé
      const isDeleted = await this.checkIfUserDeleted(null, email);
      if (isDeleted) {
        return { deleted: true };
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        uid: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
      throw error;
    }
  },

  // ------- Vérifier l'accès d'un utilisateur -------
  async verifyUserAccess(uid) {
    try {
      // Vérifier si l'utilisateur a été supprimé
      const isDeleted = await this.checkIfUserDeleted(uid);
      if (isDeleted) {
        return {
          hasAccess: false,
          reason: 'deleted'
        };
      }

      // Récupérer les données utilisateur
      const userData = await this.getUserById(uid);

      if (!userData) {
        return {
          hasAccess: false,
          reason: 'not_found'
        };
      }

      // Vérifier le statut
      if (userData.status !== 'active') {
        return {
          hasAccess: false,
          reason: 'inactive',
          status: userData.status
        };
      }

      return {
        hasAccess: true,
        userData
      };
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès:', error);
      return {
        hasAccess: false,
        reason: 'error',
        error: error.message
      };
    }
  },

  // ------- Réauthentifier l'utilisateur (pour les opérations sensibles) -------
  async reauthenticateUser(email, password) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Erreur lors de la réauthentification:', error);
      throw error;
    }
  }
};

export default usersService;