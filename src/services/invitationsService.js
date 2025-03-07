// =================================================================
// invitationsService.js
// Service de gestion des invitations utilisateurs
// =================================================================

import { auth, db } from './firebase';
import { emailService } from './emailService';
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  orderBy,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { 
  updatePassword,
  sendEmailVerification,
  createUserWithEmailAndPassword
} from 'firebase/auth';

export const invitationsService = {
  // ------- Création d'une invitation -------
  async createInvitation(invitationData) {
    try {
      console.log('Création d\'une nouvelle invitation:', invitationData);

      // Vérification des données requises
      if (!invitationData.email || !invitationData.organization || !invitationData.role) {
        throw new Error('Email, organization et role sont requis');
      }

      // Vérifier si une invitation existe déjà pour cet email
      const existingInvitation = await this.getInvitationByEmail(invitationData.email);
      if (existingInvitation) {
        throw new Error('Une invitation active existe déjà pour cet email. Elle doit expirer ou être annulée avant d\'en créer une nouvelle.');
      }

      // Création de l'invitation
      const invitationsRef = collection(db, 'invitations');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      const newInvitation = {
        email: invitationData.email.toLowerCase(),
        organization: invitationData.organization, // On stocke directement le nom de l'organisation
        role: invitationData.role,
        status: 'pending',
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        createdBy: invitationData.createdBy
      };

      const docRef = await addDoc(invitationsRef, newInvitation);
      console.log('Invitation créée avec succès:', docRef.id);

      // Envoi de l'email avec le nom de l'organisation
      await emailService.sendInvitationEmail(
        invitationData.email,
        docRef.id,
        invitationData.organization // On utilise directement le nom
      );

      return {
        id: docRef.id,
        ...newInvitation
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Récupération d'une invitation par email -------
  async getInvitationByEmail(email) {
    try {
      console.log('Recherche d\'invitation pour:', email);
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      // Vérifier si il y a une invitation active
      const activeInvitation = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.status === 'pending' && data.expiresAt.toDate() > new Date();
      });

      if (!activeInvitation) {
        return null;
      }

      return {
        id: activeInvitation.id,
        ...activeInvitation.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Récupération d'une invitation par ID -------
  async getInvitationById(invitationId) {
    try {
      console.log('Récupération de l\'invitation par ID:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitationDoc = await getDoc(invitationRef);

      if (!invitationDoc.exists()) {
        return null;
      }

      return {
        id: invitationId,
        ...invitationDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invitation par ID:', error);
      throw error;
    }
  },

  // ------- Génération d'un code d'invitation unique -------
  async generateInvitationCode(invitationId) {
    try {
      console.log('Génération d\'un code d\'invitation pour:', invitationId);

      // Générer un code aléatoire de 8 caractères (alphanumériques)
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                   Math.random().toString(36).substring(2, 6).toUpperCase();

      // Enregistrer le code dans l'invitation
      const invitationRef = doc(db, 'invitations', invitationId);
      await updateDoc(invitationRef, {
        invitationCode: code,
        codeGeneratedAt: serverTimestamp()
      });

      console.log('Code d\'invitation généré:', code);
      return code;
    } catch (error) {
      console.error('Erreur lors de la génération du code d\'invitation:', error);
      throw error;
    }
  },

  // ------- Validation d'un code d'invitation -------
  async validateInvitationCode(email, code) {
    try {
      console.log('Validation du code d\'invitation:', code, 'pour l\'email:', email);

      // Récupérer les invitations pour cet email
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { valid: false, message: 'Aucune invitation en attente trouvée pour cet email' };
      }

      // Rechercher l'invitation avec ce code
      const invitation = snapshot.docs.find(doc => {
        const data = doc.data();

        // Vérifier le code et la date d'expiration
        return data.invitationCode === code && 
               data.expiresAt.toDate() > new Date();
      });

      if (!invitation) {
        return { valid: false, message: 'Code d\'invitation invalide ou expiré' };
      }

      return { 
        valid: true, 
        invitation: {
          id: invitation.id,
          ...invitation.data()
        }
      };
    } catch (error) {
      console.error('Erreur lors de la validation du code d\'invitation:', error);
      throw error;
    }
  },

  // ------- Création de compte utilisateur à partir d'une invitation -------
  async createUserFromInvitation(invitationId, userData) {
  try {
    console.log('Création d\'un utilisateur à partir de l\'invitation:', invitationId);

    // 1. Valider l'invitation
    const invitationResult = await this.validateInvitation(invitationId);
    if (!invitationResult.valid) {
      throw new Error(invitationResult.message);
    }

    const invitation = invitationResult.invitation;

    // 2. Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      invitation.email, 
      userData.password
    );

    const user = userCredential.user;
    console.log('Utilisateur créé dans Firebase Auth:', user.uid);

    // Ligne supprimée: await user.updateProfile({ emailVerified: true });

    // 3. Préparer les données du profil utilisateur
    const userProfile = {
      email: invitation.email,
      role: invitation.role,
      organization: invitation.organization,
      status: 'active',
      emailVerified: true,
      invitationId: invitationId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

      // 4. Créer le profil dans Firestore et accepter l'invitation dans une transaction
      await runTransaction(db, async (transaction) => {
        // Référence au document utilisateur
        const userRef = doc(db, 'users', user.uid);

        // Créer le profil utilisateur
        transaction.set(userRef, userProfile);

        // Mettre à jour le statut de l'invitation
        const invitationRef = doc(db, 'invitations', invitationId);
        transaction.update(invitationRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          userId: user.uid
        });
      });

      console.log('Profil utilisateur créé et invitation acceptée');

      // 5. Retourner les données de l'utilisateur
      return {
        uid: user.uid,
        email: user.email,
        role: invitation.role,
        organization: invitation.organization
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Acceptation d'une invitation -------
  async acceptInvitation(invitationId, userData) {
    console.log('Début acceptInvitation avec:', { invitationId });
    try {
      // 1. Récupérer l'utilisateur actuel
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // 2. Récupérer et valider l'invitation
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitationSnap = await getDoc(invitationRef);

      if (!invitationSnap.exists()) {
        throw new Error('Invitation non trouvée');
      }

      const invitation = invitationSnap.data();

      // 3. Vérifier que l'invitation est valide
      if (invitation.status !== 'pending') {
        throw new Error(`Cette invitation n'est plus valide (statut: ${invitation.status})`);
      }

      if (invitation.expiresAt.toDate() < new Date()) {
        await updateDoc(invitationRef, { status: 'expired' });
        throw new Error('Cette invitation a expiré');
      }

      // 4. Vérifier que l'email correspond
      if (currentUser.email !== invitation.email) {
        throw new Error(`Cette invitation est destinée à ${invitation.email} et non à ${currentUser.email}`);
      }

      console.log('Invitation validée, mise à jour du mot de passe...');

      // 5. Mettre à jour le mot de passe
      await updatePassword(currentUser, userData.password);
      console.log('Mot de passe mis à jour avec succès');

      // 6. Préparer les données du profil utilisateur
      const userProfile = {
        email: currentUser.email,
        role: invitation.role,
        organization: invitation.organization,
        status: 'active',
        emailVerified: true,
        invitationId: invitationId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 7. Créer/mettre à jour le profil et finaliser l'invitation dans une transaction
      try {
        console.log('Démarrage de la transaction Firestore...');
        await runTransaction(db, async (transaction) => {
          // Référence au document utilisateur
          const userRef = doc(db, 'users', currentUser.uid);

          // Vérifier si l'utilisateur existe déjà
          const userDoc = await transaction.get(userRef);

          if (userDoc.exists()) {
            // Mettre à jour le profil existant
            transaction.update(userRef, {
              ...userProfile,
              createdAt: userDoc.data().createdAt // Conserver la date de création originale
            });
          } else {
            // Créer un nouveau profil
            transaction.set(userRef, userProfile);
          }

          // Mettre à jour le statut de l'invitation
          transaction.update(invitationRef, {
            status: 'accepted',
            acceptedAt: serverTimestamp(),
            userId: currentUser.uid
          });
        });
        console.log('Transaction Firestore terminée avec succès');
      } catch (transactionError) {
        console.error('Erreur lors de la transaction Firestore:', transactionError);
        throw new Error('Échec de la création du profil utilisateur');
      }

      // 8. Forcer un rafraîchissement de l'utilisateur
      await currentUser.reload();
      console.log('État d\'authentification actualisé');

      // Force une propagation complète des modifications
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 9. Stocker les données pour AuthContext
      const invitationData = {
        id: invitationId,
        role: invitation.role,
        organization: invitation.organization,
        email: invitation.email
      };
      localStorage.setItem('pendingInvitationData', JSON.stringify(invitationData));

      // 10. Retourner les données de l'utilisateur
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        role: invitation.role,
        organization: invitation.organization
      };
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      throw error;
    }
  },
  
  // Activation du compte utilisateur
  async activateUserAccount(userId) {
    try {
      console.log('[DEBUG] Activation du compte utilisateur:', userId);
      const userRef = doc(db, 'users', userId);

      // Récupérer les données actuelles de l'utilisateur
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      // Mettre à jour le statut à 'active' s'il ne l'est pas déjà
      const userData = userSnap.data();
      if (userData.status !== 'active') {
        await updateDoc(userRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        console.log('[DEBUG] Compte utilisateur activé avec succès');
      } else {
        console.log('[DEBUG] Le compte utilisateur est déjà actif');
      }

      return true;
    } catch (error) {
      console.error('[DEBUG] Erreur lors de l\'activation du compte utilisateur:', error);
      throw error;
    }
  },

  
  // ------- Annulation d'une invitation -------
  async cancelInvitation(invitationId) {
    try {
      console.log('Annulation de l\'invitation:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invitationRef);
      console.log('Invitation annulée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Liste des invitations en attente pour une organisation -------
  async getAllPendingInvitations() {
    try {
      console.log('Récupération de toutes les invitations en attente');
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const invitations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Invitations trouvées:', invitations);
      return invitations;
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      throw error;
    }
  },

  // ------- Validation d'une invitation -------
  async validateInvitation(invitationId) {
    try {
      console.log('Vérification de l\'invitation:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitation = await getDoc(invitationRef);

      if (!invitation.exists()) {
        return { valid: false, message: 'Invitation non trouvée' };
      }

      const data = invitation.data();

      if (data.status !== 'pending') {
        return { valid: false, message: 'Cette invitation n\'est plus valide' };
      }

      if (data.expiresAt.toDate() < new Date()) {
        await updateDoc(invitationRef, { status: 'expired' });
        return { valid: false, message: 'Cette invitation a expiré' };
      }

      return { 
        valid: true,
        invitation: {
          id: invitation.id,
          ...data
        }
      };
    } catch (error) {
      console.error('Erreur lors de la validation de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Mise à jour du statut d'une invitation -------
  async updateInvitationStatus(invitationId, status, additionalData = {}) {
    try {
      console.log('Mise à jour du statut de l\'invitation:', invitationId, status);
      const invitationRef = doc(db, 'invitations', invitationId);

      await updateDoc(invitationRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Nettoyage des invitations expirées -------
  async cleanupExpiredInvitations() {
    try {
      console.log('Nettoyage des invitations expirées');
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('status', '==', 'pending'),
        where('expiresAt', '<=', Timestamp.now())
      );

      const snapshot = await getDocs(q);
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { status: 'expired' });
      });

      await batch.commit();
      console.log(`${snapshot.size} invitations expirées nettoyées`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des invitations:', error);
      throw error;
    }
  },

  // ------- Renvoyer une invitation -------
  async resendInvitation(invitationId) {
    try {
      console.log('Renvoi de l\'invitation:', invitationId);
      const invitation = await this.getInvitationById(invitationId);

      if (!invitation) {
        throw new Error('Invitation non trouvée');
      }

      // Mettre à jour la date d'expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await updateDoc(doc(db, 'invitations', invitationId), {
        expiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp(),
        codeGeneratedAt: null, // Réinitialiser pour générer un nouveau code
        invitationCode: null
      });

      // Renvoyer l'email avec un nouveau code
      await emailService.sendInvitationEmail(
        invitation.email,
        invitationId,
        invitation.organization
      );

      return true;
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'invitation:', error);
      throw error;
    }
  },

  // ------- NOUVELLE FONCTION: Activation explicite du compte utilisateur -------
  async activateUserAccount(userId) {
    try {
      console.log('Activation du compte utilisateur:', userId);
      const userRef = doc(db, 'users', userId);

      // Récupérer les données actuelles de l'utilisateur
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      // Mettre à jour le statut à 'active' s'il ne l'est pas déjà
      const userData = userSnap.data();
      if (userData.status !== 'active') {
        await updateDoc(userRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        console.log('Compte utilisateur activé avec succès');
      } else {
        console.log('Le compte utilisateur est déjà actif');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation du compte utilisateur:', error);
      throw error;
    }
  }
};

export default invitationsService;