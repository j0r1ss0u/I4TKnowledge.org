// =================================================================
// invitationsService.js
// User invitations management service
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
  // ------- Create invitation / Création d'une invitation -------
  async createInvitation(invitationData) {
    try {
      console.log('Creating new invitation / Création d\'une nouvelle invitation:', invitationData);

      // Check required data / Vérification des données requises
      if (!invitationData.email || !invitationData.organization || !invitationData.role) {
        throw new Error('Email, organization and role are required / Email, organization et role sont requis');
      }

      // Check if invitation already exists for this email / Vérifier si une invitation existe déjà pour cet email
      const existingInvitation = await this.getInvitationByEmail(invitationData.email);
      if (existingInvitation) {
        throw new Error('An active invitation already exists for this email. It must expire or be canceled before creating a new one. / Une invitation active existe déjà pour cet email. Elle doit expirer ou être annulée avant d\'en créer une nouvelle.');
      }

      // Create invitation / Création de l'invitation
      const invitationsRef = collection(db, 'invitations');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days / Expire dans 7 jours

      const newInvitation = {
        email: invitationData.email.toLowerCase(),
        organization: invitationData.organization, // Store organization name directly / On stocke directement le nom de l'organisation
        role: invitationData.role,
        status: 'pending',
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        createdBy: invitationData.createdBy
      };

      const docRef = await addDoc(invitationsRef, newInvitation);
      console.log('Invitation created successfully / Invitation créée avec succès:', docRef.id);

      // Send email with organization name / Envoi de l'email avec le nom de l'organisation
      await emailService.sendInvitationEmail(
        invitationData.email,
        docRef.id,
        invitationData.organization // Use name directly / On utilise directement le nom
      );

      return {
        id: docRef.id,
        ...newInvitation
      };
    } catch (error) {
      console.error('Error creating invitation / Erreur lors de la création de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Get invitation by email / Récupération d'une invitation par email -------
  async getInvitationByEmail(email) {
    try {
      console.log('Looking for invitation for / Recherche d\'invitation pour:', email);
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      // Check if there's an active invitation / Vérifier s'il y a une invitation active
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
      console.error('Error retrieving invitation / Erreur lors de la récupération de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Get invitation by ID / Récupération d'une invitation par ID -------
  async getInvitationById(invitationId) {
    try {
      console.log('Retrieving invitation by ID / Récupération de l\'invitation par ID:', invitationId);
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
      console.error('Error retrieving invitation by ID / Erreur lors de la récupération de l\'invitation par ID:', error);
      throw error;
    }
  },

  // ------- Generate unique invitation code / Génération d'un code d'invitation unique -------
  async generateInvitationCode(invitationId) {
    try {
      console.log('Generating invitation code for / Génération d\'un code d\'invitation pour:', invitationId);

      // Generate random 8-character code (alphanumeric) / Générer un code aléatoire de 8 caractères (alphanumériques)
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                   Math.random().toString(36).substring(2, 6).toUpperCase();

      // Save code in invitation / Enregistrer le code dans l'invitation
      const invitationRef = doc(db, 'invitations', invitationId);
      await updateDoc(invitationRef, {
        invitationCode: code,
        codeGeneratedAt: serverTimestamp()
      });

      console.log('Invitation code generated / Code d\'invitation généré:', code);
      return code;
    } catch (error) {
      console.error('Error generating invitation code / Erreur lors de la génération du code d\'invitation:', error);
      throw error;
    }
  },

  // ------- Validate invitation code / Validation d'un code d'invitation -------
  async validateInvitationCode(email, code) {
    try {
      console.log('Validating invitation code / Validation du code d\'invitation:', code, 'for email / pour l\'email:', email);

      // Get invitations for this email / Récupérer les invitations pour cet email
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { valid: false, message: 'No pending invitation found for this email / Aucune invitation en attente trouvée pour cet email' };
      }

      // Find invitation with this code / Rechercher l'invitation avec ce code
      const invitation = snapshot.docs.find(doc => {
        const data = doc.data();

        // Check code and expiration date / Vérifier le code et la date d'expiration
        return data.invitationCode === code && 
               data.expiresAt.toDate() > new Date();
      });

      if (!invitation) {
        return { valid: false, message: 'Invalid or expired invitation code / Code d\'invitation invalide ou expiré' };
      }

      return { 
        valid: true, 
        invitation: {
          id: invitation.id,
          ...invitation.data()
        }
      };
    } catch (error) {
      console.error('Error validating invitation code / Erreur lors de la validation du code d\'invitation:', error);
      throw error;
    }
  },

  // ------- Create user from invitation / Création de compte utilisateur à partir d'une invitation -------
  async createUserFromInvitation(invitationId, userData) {
  try {
    console.log('Creating user from invitation / Création d\'un utilisateur à partir de l\'invitation:', invitationId);

    // 1. Validate invitation / Valider l'invitation
    const invitationResult = await this.validateInvitation(invitationId);
    if (!invitationResult.valid) {
      throw new Error(invitationResult.message);
    }

    const invitation = invitationResult.invitation;

    // 2. Create user in Firebase Auth / Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      invitation.email, 
      userData.password
    );

    const user = userCredential.user;
    console.log('User created in Firebase Auth / Utilisateur créé dans Firebase Auth:', user.uid);

    // Removed line / Ligne supprimée: await user.updateProfile({ emailVerified: true });

    // 3. Prepare user profile data / Préparer les données du profil utilisateur
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

      // 4. Create profile in Firestore and accept invitation in a transaction / Créer le profil dans Firestore et accepter l'invitation dans une transaction
      await runTransaction(db, async (transaction) => {
        // User document reference / Référence au document utilisateur
        const userRef = doc(db, 'users', user.uid);

        // Create user profile / Créer le profil utilisateur
        transaction.set(userRef, userProfile);

        // Update invitation status / Mettre à jour le statut de l'invitation
        const invitationRef = doc(db, 'invitations', invitationId);
        transaction.update(invitationRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          userId: user.uid
        });
      });

      console.log('User profile created and invitation accepted / Profil utilisateur créé et invitation acceptée');

      // 5. Return user data / Retourner les données de l'utilisateur
      return {
        uid: user.uid,
        email: user.email,
        role: invitation.role,
        organization: invitation.organization
      };
    } catch (error) {
      console.error('Error creating user / Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Accept invitation / Acceptation d'une invitation -------
  async acceptInvitation(invitationId, userData) {
    console.log('Starting acceptInvitation with / Début acceptInvitation avec:', { invitationId });
    try {
      // 1. Get current user / Récupérer l'utilisateur actuel
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not connected / Utilisateur non connecté');
      }

      // 2. Get and validate invitation / Récupérer et valider l'invitation
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitationSnap = await getDoc(invitationRef);

      if (!invitationSnap.exists()) {
        throw new Error('Invitation not found / Invitation non trouvée');
      }

      const invitation = invitationSnap.data();

      // 3. Check if invitation is valid / Vérifier que l'invitation est valide
      if (invitation.status !== 'pending') {
        throw new Error(`This invitation is no longer valid (status: ${invitation.status}) / Cette invitation n'est plus valide (statut: ${invitation.status})`);
      }

      if (invitation.expiresAt.toDate() < new Date()) {
        await updateDoc(invitationRef, { status: 'expired' });
        throw new Error('This invitation has expired / Cette invitation a expiré');
      }

      // 4. Check if email matches / Vérifier que l'email correspond
      if (currentUser.email !== invitation.email) {
        throw new Error(`This invitation is intended for ${invitation.email} and not for ${currentUser.email} / Cette invitation est destinée à ${invitation.email} et non à ${currentUser.email}`);
      }

      console.log('Invitation validated, updating password / Invitation validée, mise à jour du mot de passe...');

      // 5. Update password / Mettre à jour le mot de passe
      await updatePassword(currentUser, userData.password);
      console.log('Password updated successfully / Mot de passe mis à jour avec succès');

      // 6. Prepare user profile data / Préparer les données du profil utilisateur
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

      // 7. Create/update profile and finalize invitation in a transaction / Créer/mettre à jour le profil et finaliser l'invitation dans une transaction
      try {
        console.log('Starting Firestore transaction / Démarrage de la transaction Firestore...');
        await runTransaction(db, async (transaction) => {
          // User document reference / Référence au document utilisateur
          const userRef = doc(db, 'users', currentUser.uid);

          // Check if user already exists / Vérifier si l'utilisateur existe déjà
          const userDoc = await transaction.get(userRef);

          if (userDoc.exists()) {
            // Update existing profile / Mettre à jour le profil existant
            transaction.update(userRef, {
              ...userProfile,
              createdAt: userDoc.data().createdAt // Keep original creation date / Conserver la date de création originale
            });
          } else {
            // Create new profile / Créer un nouveau profil
            transaction.set(userRef, userProfile);
          }

          // Update invitation status / Mettre à jour le statut de l'invitation
          transaction.update(invitationRef, {
            status: 'accepted',
            acceptedAt: serverTimestamp(),
            userId: currentUser.uid
          });
        });
        console.log('Firestore transaction completed successfully / Transaction Firestore terminée avec succès');
      } catch (transactionError) {
        console.error('Error during Firestore transaction / Erreur lors de la transaction Firestore:', transactionError);
        throw new Error('Failed to create user profile / Échec de la création du profil utilisateur');
      }

      // 8. Force refresh of user / Forcer un rafraîchissement de l'utilisateur
      await currentUser.reload();
      console.log('Authentication state refreshed / État d\'authentification actualisé');

      // Force complete propagation of changes / Force une propagation complète des modifications
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 9. Store data for AuthContext / Stocker les données pour AuthContext
      const invitationData = {
        id: invitationId,
        role: invitation.role,
        organization: invitation.organization,
        email: invitation.email
      };
      localStorage.setItem('pendingInvitationData', JSON.stringify(invitationData));

      // 10. Return user data / Retourner les données de l'utilisateur
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        role: invitation.role,
        organization: invitation.organization
      };
    } catch (error) {
      console.error('Error accepting invitation / Erreur lors de l\'acceptation de l\'invitation:', error);
      throw error;
    }
  },

  // Activate user account / Activation du compte utilisateur
  async activateUserAccount(userId) {
    try {
      console.log('[DEBUG] Activating user account / Activation du compte utilisateur:', userId);
      const userRef = doc(db, 'users', userId);

      // Get current user data / Récupérer les données actuelles de l'utilisateur
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('User not found / Utilisateur non trouvé');
      }

      // Update status to 'active' if not already / Mettre à jour le statut à 'active' s'il ne l'est pas déjà
      const userData = userSnap.data();
      if (userData.status !== 'active') {
        await updateDoc(userRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        console.log('[DEBUG] User account activated successfully / Compte utilisateur activé avec succès');
      } else {
        console.log('[DEBUG] User account is already active / Le compte utilisateur est déjà actif');
      }

      return true;
    } catch (error) {
      console.error('[DEBUG] Error activating user account / Erreur lors de l\'activation du compte utilisateur:', error);
      throw error;
    }
  },


  // ------- Cancel invitation / Annulation d'une invitation -------
  async cancelInvitation(invitationId) {
    try {
      console.log('Cancelling invitation / Annulation de l\'invitation:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invitationRef);
      console.log('Invitation cancelled successfully / Invitation annulée avec succès');
    } catch (error) {
      console.error('Error cancelling invitation / Erreur lors de l\'annulation de l\'invitation:', error);
      throw error;
    }
  },

  // ------- List pending invitations for an organization / Liste des invitations en attente pour une organisation -------
  async getAllPendingInvitations() {
    try {
      console.log('Retrieving all pending invitations / Récupération de toutes les invitations en attente');
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
      console.log('Invitations found / Invitations trouvées:', invitations);
      return invitations;
    } catch (error) {
      console.error('Error retrieving invitations / Erreur lors de la récupération des invitations:', error);
      throw error;
    }
  },

  // ------- Validate invitation / Validation d'une invitation -------
  async validateInvitation(invitationId) {
    try {
      console.log('Checking invitation / Vérification de l\'invitation:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitation = await getDoc(invitationRef);

      if (!invitation.exists()) {
        return { valid: false, message: 'Invitation not found / Invitation non trouvée' };
      }

      const data = invitation.data();

      if (data.status !== 'pending') {
        return { valid: false, message: 'This invitation is no longer valid / Cette invitation n\'est plus valide' };
      }

      if (data.expiresAt.toDate() < new Date()) {
        await updateDoc(invitationRef, { status: 'expired' });
        return { valid: false, message: 'This invitation has expired / Cette invitation a expiré' };
      }

      return { 
        valid: true,
        invitation: {
          id: invitation.id,
          ...data
        }
      };
    } catch (error) {
      console.error('Error validating invitation / Erreur lors de la validation de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Validate invitation with retry / Validation d'une invitation avec retry -------
  async validateInvitationWithRetry(invitationId, maxRetries = 3, initialDelay = 800) {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        console.log(`Attempt ${attempts + 1}/${maxRetries} validating invitation / Tentative ${attempts + 1}/${maxRetries} de validation de l'invitation:`, invitationId);

        const invitationRef = doc(db, 'invitations', invitationId);
        const invitation = await getDoc(invitationRef);

        if (!invitation.exists()) {
          console.log(`Invitation not found (attempt ${attempts + 1}) / Invitation non trouvée (tentative ${attempts + 1})`);
          // Wait before next attempt (exponential delay) / Attendre avant la prochaine tentative (délai exponentiel)
          if (attempts < maxRetries - 1) {
            const delay = initialDelay * Math.pow(1.5, attempts);
            console.log(`Retrying in ${delay}ms / Nouvelle tentative dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;
            continue; // Move to next iteration / Passer à l'itération suivante
          }
          return { valid: false, message: 'Invitation not found / Invitation non trouvée' };
        }

        // Invitation exists, continue with normal validation / L'invitation existe, continuer avec la validation normale
        const data = invitation.data();

        if (data.status !== 'pending') {
          return { valid: false, message: 'This invitation is no longer valid / Cette invitation n\'est plus valide' };
        }

        if (data.expiresAt.toDate() < new Date()) {
          await updateDoc(invitationRef, { status: 'expired' });
          return { valid: false, message: 'This invitation has expired / Cette invitation a expiré' };
        }

        // Validation successful / Validation réussie
        return { 
          valid: true,
          invitation: {
            id: invitation.id,
            ...data
          }
        };
      } catch (error) {
        console.error(`Error during attempt ${attempts + 1} / Erreur lors de la tentative ${attempts + 1}:`, error);

        // Last attempt failed? / Dernière tentative échouée?
        if (attempts >= maxRetries - 1) {
          return { valid: false, message: 'Error validating invitation / Erreur lors de la validation de l\'invitation' };
        }

        // Wait and retry / Attendre et réessayer
        const delay = initialDelay * Math.pow(1.5, attempts);
        console.log(`Retrying in ${delay}ms / Nouvelle tentative dans ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
      }
    }

    // Should never get here, but just in case / Ne devrait jamais arriver ici, mais par sécurité
    return { valid: false, message: 'Invitation validation failed after multiple attempts / Validation de l\'invitation échouée après plusieurs tentatives' };
  },

  // ------- Update invitation status / Mise à jour du statut d'une invitation -------
  async updateInvitationStatus(invitationId, status, additionalData = {}) {
    try {
      console.log('Updating invitation status / Mise à jour du statut de l\'invitation:', invitationId, status);
      const invitationRef = doc(db, 'invitations', invitationId);

      await updateDoc(invitationRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      return true;
    } catch (error) {
      console.error('Error updating invitation status / Erreur lors de la mise à jour du statut de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Clean up expired invitations / Nettoyage des invitations expirées -------
  async cleanupExpiredInvitations() {
    try {
      console.log('Cleaning up expired invitations / Nettoyage des invitations expirées');
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
      console.log(`${snapshot.size} expired invitations cleaned up / invitations expirées nettoyées`);
    } catch (error) {
      console.error('Error cleaning up invitations / Erreur lors du nettoyage des invitations:', error);
      throw error;
    }
  },

  // ------- Resend invitation / Renvoyer une invitation -------
  async resendInvitation(invitationId) {
    try {
      console.log('Resending invitation / Renvoi de l\'invitation:', invitationId);
      const invitation = await this.getInvitationById(invitationId);

      if (!invitation) {
        throw new Error('Invitation not found / Invitation non trouvée');
      }

      // Update expiration date / Mettre à jour la date d'expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await updateDoc(doc(db, 'invitations', invitationId), {
        expiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp(),
        codeGeneratedAt: null, // Reset to generate a new code / Réinitialiser pour générer un nouveau code
        invitationCode: null
      });

      // Resend email with a new code / Renvoyer l'email avec un nouveau code
      await emailService.sendInvitationEmail(
        invitation.email,
        invitationId,
        invitation.organization
      );

      return true;
    } catch (error) {
      console.error('Error resending invitation / Erreur lors du renvoi de l\'invitation:', error);
      throw error;
    }
  },

  // ------- NEW FUNCTION: Explicit user account activation / NOUVELLE FONCTION: Activation explicite du compte utilisateur -------
  async activateUserAccount(userId) {
    try {
      console.log('Activating user account / Activation du compte utilisateur:', userId);
      const userRef = doc(db, 'users', userId);

      // Get current user data / Récupérer les données actuelles de l'utilisateur
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('User not found / Utilisateur non trouvé');
      }

      // Update status to 'active' if not already / Mettre à jour le statut à 'active' s'il ne l'est pas déjà
      const userData = userSnap.data();
      if (userData.status !== 'active') {
        await updateDoc(userRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        console.log('User account activated successfully / Compte utilisateur activé avec succès');
      } else {
        console.log('User account is already active / Le compte utilisateur est déjà actif');
      }

      return true;
    } catch (error) {
      console.error('Error activating user account / Erreur lors de l\'activation du compte utilisateur:', error);
      throw error;
    }
  }
};

export default invitationsService;