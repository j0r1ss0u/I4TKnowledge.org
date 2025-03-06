// =================================================================
// passwordResetService.js
// Service dédié à la gestion des réinitialisations de mots de passe
// =================================================================

import { auth, db } from './firebase';
import { 
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc,
  getDoc,
  updateDoc, 
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';

export const passwordResetService = {
  // ------- Demande de réinitialisation de mot de passe -------
  async requestPasswordReset(email) {
    try {
      console.log('Début du processus de réinitialisation pour:', email);

      // 1. Créer une entrée dans la collection passwordResets
      const resetDoc = {
        email: email.toLowerCase(),
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 jours
      };

      const resetRef = await addDoc(collection(db, 'passwordResets'), resetDoc);
      console.log('Document de réinitialisation créé:', resetRef.id);

      // 2. Utiliser la méthode native de Firebase pour envoyer l'email
      await sendPasswordResetEmail(auth, email, {
        url: `https://www.i4tknowledge.org/reset-password?resetId=${resetRef.id}`,
        handleCodeInApp: false // Utiliser le système de gestion de liens de Firebase
      });

      // 3. Mettre à jour le document avec l'information d'envoi
      await updateDoc(resetRef, {
        emailSent: true,
        emailSentAt: serverTimestamp()
      });

      console.log('Email de réinitialisation envoyé avec succès');
      return {
        success: true,
        id: resetRef.id
      };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      throw error;
    }
  },

  // ------- Vérification du code de réinitialisation -------
  async verifyResetCode(oobCode) {
    try {
      console.log('Vérification du code de réinitialisation');
      const email = await verifyPasswordResetCode(auth, oobCode);
      return {
        valid: true,
        email
      };
    } catch (error) {
      console.error('Code de réinitialisation invalide:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  },

  // ------- Confirmation de la réinitialisation du mot de passe -------
  async confirmReset(oobCode, newPassword, resetId) {
    try {
      console.log('Confirmation de la réinitialisation du mot de passe');

      // 1. Confirmer la réinitialisation avec Firebase Auth
      await confirmPasswordReset(auth, oobCode, newPassword);

      // 2. Mettre à jour le document de réinitialisation si un ID est fourni
      if (resetId) {
        const resetRef = doc(db, 'passwordResets', resetId);
        const resetDoc = await getDoc(resetRef);

        if (resetDoc.exists()) {
          await updateDoc(resetRef, {
            status: 'completed',
            completedAt: serverTimestamp()
          });
        }
      }

      console.log('Réinitialisation du mot de passe complétée avec succès');
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réinitialisation:', error);
      throw error;
    }
  },

  // ------- Récupération d'un document de réinitialisation -------
  async getResetDocument(resetId) {
    try {
      console.log('Récupération du document de réinitialisation:', resetId);
      const resetRef = doc(db, 'passwordResets', resetId);
      const resetDoc = await getDoc(resetRef);

      if (!resetDoc.exists()) {
        console.log('Document de réinitialisation non trouvé');
        return null;
      }

      const data = resetDoc.data();

      // Vérifier l'expiration
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        await updateDoc(resetRef, { status: 'expired' });
        console.log('Document de réinitialisation expiré');
        return null;
      }

      return {
        id: resetDoc.id,
        ...data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du document de réinitialisation:', error);
      throw error;
    }
  },

  // ------- Mise à jour du statut d'un document de réinitialisation -------
  async updateResetStatus(resetId, status, additionalData = {}) {
    try {
      console.log(`Mise à jour du statut de réinitialisation ${resetId} à ${status}`);
      const resetRef = doc(db, 'passwordResets', resetId);

      await updateDoc(resetRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de réinitialisation:', error);
      throw error;
    }
  }
};

export default passwordResetService;