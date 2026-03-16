import { auth } from './firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  fetchSignInMethodsForEmail,
  updatePassword
} from 'firebase/auth';
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { emailService } from './emailService';

export const firebaseAuthService = {
  // ------- Initialisation du profil utilisateur -------
  async initializeUserRole(userId, email, invitationData = null) {
    console.log('Initialisation du rôle utilisateur pour:', email, 'avec données:', invitationData);
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      // Si l'utilisateur existe déjà
      if (userDoc.exists()) {
        console.log('Utilisateur existant, mise à jour avec données invitation:', invitationData);
        if (invitationData) {
          await updateDoc(userRef, {
            role: invitationData.role,
            organization: invitationData.organization,
            updatedAt: serverTimestamp(),
            invitationId: invitationData.id
          });
          return {
            ...userDoc.data(),
            role: invitationData.role,
            organization: invitationData.organization
          };
        }
        return userDoc.data();
      }

      // Création d'un nouvel utilisateur
      const userData = {
        email,
        emailVerified: true,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Si on a des données d'invitation, on les utilise
      if (invitationData) {
        console.log('Création utilisateur avec données invitation:', invitationData);
        Object.assign(userData, {
          role: invitationData.role,
          organization: invitationData.organization,
          invitationId: invitationData.id
        });
      } else {
        // Rôle par défaut si pas d'invitation
        console.log('Création utilisateur avec rôle par défaut');
        userData.role = 'member';
      }

      // Création du document utilisateur
      await setDoc(userRef, userData);
      console.log('Profil utilisateur créé avec succès:', userData);

      return userData;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du profil utilisateur:', error);
      throw new Error('Échec de l\'initialisation du profil utilisateur');
    }
  },

  // ------- Connexion utilisateur -------
  async loginUser(email, password) {
    try {
      console.log('Tentative de connexion pour:', email);

      // Vérifier si cet utilisateur a été créé via une invitation
      let wasInvited = false;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          wasInvited = !!userData.invitationId; // Vérifie si invitationId est défini
          console.log('Utilisateur créé via invitation:', wasInvited);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification d\'invitation:', err);
        // Continuer même en cas d'erreur
      }

      // Authentification standard
      console.log('Tentative d\'authentification standard');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      console.log('Utilisateur authentifié:', user.email);
      console.log('Email vérifié:', user.emailVerified);

      // Ignorer la vérification d'email pour les utilisateurs invités
      if (!user.emailVerified && !wasInvited) {
        console.log('Email non vérifié et utilisateur non invité, envoi de l\'email de vérification...');
        try {
          await sendEmailVerification(user);
          console.log('Email de vérification envoyé avec succès');
        } catch (verificationError) {
          console.error('Erreur lors de l\'envoi de l\'email de vérification:', verificationError);
        }
        throw { code: 'auth/email-not-verified', message: 'Please verify your email before logging in' };
      }

      // Initialiser ou récupérer le profil utilisateur
      const userData = await this.initializeUserRole(user.uid, user.email);
      console.log('Données utilisateur:', userData);

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified || wasInvited, // Considérer comme vérifié si invité
        ...userData
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // ------- Déconnexion -------
  async logoutUser() {
    console.log('Tentative de déconnexion');
    try {
      await signOut(auth);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // ------- Vérification de l'existence d'un utilisateur -------
  async getUserByEmail(email) {
    try {
      // D'abord, vérifions dans la collection users de Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const snapshot = await getDocs(q);

      console.log('Vérification utilisateur:', email);
      console.log('Document trouvé:', !snapshot.empty);

      if (!snapshot.empty) {
        // L'utilisateur existe dans notre base
        const userData = snapshot.docs[0].data();
        console.log('Données utilisateur:', userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      throw error;
    }
  },


  // ------- Password Reset Flow -------
  async resetPassword(email) {
    try {
      console.log('Starting password reset flow for:', email);
      const userExists = await this.getUserByEmail(email);
      if (!userExists) {
        throw new Error('No account found with this email address');
      }

      // Create reset document in Firestore
      const resetDoc = {
        email: email.toLowerCase(),
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      // Add document to passwordResets collection
      const resetRef = doc(collection(db, 'passwordResets'));
      await setDoc(resetRef, resetDoc);

      console.log('Reset document created with ID:', resetRef.id);

      // Send email with resetId
      await emailService.sendResetPasswordEmail(email, resetRef.id);

      return {
        id: resetRef.id,
        ...resetDoc
      };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  },

  // ------- Get Reset Document -------
  async getResetDocument(resetId) {
    try {
      console.log('Fetching reset document:', resetId);
      const resetRef = doc(db, 'passwordResets', resetId);
      const resetDoc = await getDoc(resetRef);

      if (!resetDoc.exists()) {
        console.log('Reset document not found');
        return null;
      }

      const data = resetDoc.data();

      // Check expiration
      if (data.expiresAt.toDate() < new Date()) {
        await updateDoc(resetRef, { status: 'expired' });
        return null;
      }

      return {
        id: resetDoc.id,
        ...data
      };
    } catch (error) {
      console.error('Error getting reset document:', error);
      throw error;
    }
  },

  // ------- Complete Password Reset -------
  async completePasswordReset(resetId, newPassword) {
    try {
      console.log('Completing password reset for document:', resetId);

      // Get reset document
      const resetDoc = await this.getResetDocument(resetId);
      if (!resetDoc) {
        throw new Error('Invalid or expired reset request');
      }

      if (resetDoc.status !== 'validated') {
        throw new Error('Reset link not validated');
      }

      // Update user password
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      await updatePassword(user, newPassword);

      // Update reset document status
      const resetRef = doc(db, 'passwordResets', resetId);
      await updateDoc(resetRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      console.log('Password reset completed successfully');
      return true;
    } catch (error) {
      console.error('Error completing password reset:', error);
      throw error;
    }
  },

  // ------- Récupération des données utilisateur -------
  async getUserData(uid) {
    console.log('Récupération des données pour l\'utilisateur:', uid);
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        console.log('Aucune donnée trouvée pour l\'utilisateur');
        return null;
      }
      console.log('Données utilisateur trouvées:', userDoc.data());
      return userDoc.data();
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      throw error;
    }
  },

  // ------- Création d'un nouvel utilisateur -------
  async createUser(email, password, userData) {
    console.log('Tentative de création d\'utilisateur:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      const userProfile = {
        email: user.email,
        role: 'member',
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      await sendEmailVerification(user);
      console.log('Utilisateur créé et email de vérification envoyé');

      return {
        uid: user.uid,
        ...userProfile
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Renvoi de l'email de vérification -------
  async resendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('Aucun utilisateur connecté');
        throw new Error('No user logged in');
      }
      await sendEmailVerification(user);
      console.log('Email de vérification renvoyé avec succès');
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email de vérification:', error);
      throw error;
    }
  },

  // ------- Mise à jour du mot de passe -------
  async updatePassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('Aucun utilisateur connecté');
        throw new Error('No user logged in');
      }
      await updatePassword(user, newPassword);
      console.log('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }
};

export default firebaseAuthService;