// passwordResetService.js
import { auth, db, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
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
  // ------- Generate random code -------
  generateResetCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // ------- Password reset request -------
  async requestPasswordReset(email, language = 'en') {
    try {
      console.log('Starting password reset process for:', email);
      
      // 1. Générer un code de réinitialisation aléatoire
      const code = this.generateResetCode();
      console.log('Generated reset code:', code);
      
      // 2. Create an entry in the passwordResets collection
      const resetDoc = {
        email: email.toLowerCase(),
        code: code,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24 hours
      };
      const resetRef = await addDoc(collection(db, 'passwordResets'), resetDoc);
      console.log('Reset document created:', resetRef.id);
      
      // 3. Appeler la Firebase Cloud Function pour envoyer l'email via Resend
      const response = await fetch('https://us-central1-i4tk-website.cloudfunctions.net/sendResetPasswordEmailHttp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          resetId: resetRef.id,
          code: code,
          language: language
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send reset email:', errorData);
        throw new Error(`Failed to send reset email: ${errorData.error}`);
      }
      
      const result = await response.json();
      console.log('Reset email sent successfully:', result);
      
      return {
        success: true,
        id: resetRef.id
      };
    } catch (error) {
      console.error('Error during password reset request:', error);
      throw error;
    }
  },
  // ------- Reset code verification -------
  async verifyResetCode(resetId, code) {
    try {
      console.log(`Verifying reset code for resetId="${resetId}" with code="${code}"`);
      
      // Récupérer le document de réinitialisation depuis Firestore
      const resetRef = doc(db, 'passwordResets', resetId);
      const resetDoc = await getDoc(resetRef);
      
      if (!resetDoc.exists()) {
        console.log('Reset document not found');
        return {
          valid: false,
          error: 'Reset request not found'
        };
      }
      
      const resetData = resetDoc.data();
      
      // Vérifier l'expiration
      if (resetData.expiresAt && resetData.expiresAt.toDate() < new Date()) {
        console.log('Reset link expired');
        await updateDoc(resetRef, { status: 'expired' });
        return {
          valid: false,
          error: 'Reset link has expired'
        };
      }
      
      // Vérifier que le code correspond
      if (resetData.code !== code.toUpperCase()) {
        console.log('Invalid reset code:', code, 'expected:', resetData.code);
        return {
          valid: false,
          error: 'Invalid reset code'
        };
      }
      
      // Marquer comme validé
      await updateDoc(resetRef, { 
        status: 'validated',
        validatedAt: serverTimestamp()
      });
      
      console.log('Reset code validated successfully');
      return {
        valid: true,
        email: resetData.email
      };
    } catch (error) {
      console.error('Error verifying reset code:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  },
  // ------- Confirm password reset -------
  async confirmReset(resetId, newPassword) {
    try {
      console.log('Confirming password reset for resetId:', resetId);
      
      // Récupérer le document de réinitialisation
      const resetRef = doc(db, 'passwordResets', resetId);
      const resetDoc = await getDoc(resetRef);
      
      if (!resetDoc.exists()) {
        throw new Error('Reset request not found');
      }
      
      const resetData = resetDoc.data();
      
      // Vérifier que le statut est 'validated'
      if (resetData.status !== 'validated') {
        throw new Error('Reset code must be validated first');
      }
      
      // Vérifier l'expiration
      if (resetData.expiresAt && resetData.expiresAt.toDate() < new Date()) {
        await updateDoc(resetRef, { status: 'expired' });
        throw new Error('Reset link has expired');
      }
      
      // IMPORTANT: Pour changer le mot de passe, nous devons utiliser Firebase Cloud Function
      // car Firebase Auth ne permet pas de changer le mot de passe d'un utilisateur
      // sans être authentifié avec cet utilisateur
      const response = await fetch(
        'https://us-central1-i4tk-website.cloudfunctions.net/completePasswordResetHttp', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ resetId, password: newPassword })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete password reset');
      }

      console.log('Password reset completed successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('Error during password reset confirmation:', error);
      throw error;
    }
  },
  // ------- Get reset document -------
  async getResetDocument(resetId) {
    try {
      console.log('Retrieving reset document:', resetId);
      const resetRef = doc(db, 'passwordResets', resetId);
      const resetDoc = await getDoc(resetRef);
      if (!resetDoc.exists()) {
        console.log('Reset document not found');
        return null;
      }
      const data = resetDoc.data();
      // Check expiration
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        await updateDoc(resetRef, { status: 'expired' });
        console.log('Reset document expired');
        return null;
      }
      return {
        id: resetDoc.id,
        ...data
      };
    } catch (error) {
      console.error('Error retrieving reset document:', error);
      throw error;
    }
  }
};
export default passwordResetService;