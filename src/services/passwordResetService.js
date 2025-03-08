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
  // ------- Password reset request -------
  async requestPasswordReset(email) {
    try {
      console.log('Starting password reset process for:', email);

      // 1. Create an entry in the passwordResets collection
      const resetDoc = {
        email: email.toLowerCase(),
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24 hours
      };

      const resetRef = await addDoc(collection(db, 'passwordResets'), resetDoc);
      console.log('Reset document created:', resetRef.id);

      // 2. Call the Cloud Function to send email via SendGrid
      // Important: Use the correct endpoint for password reset, NOT the invitation endpoint
      const response = await fetch('https://sendresetpasswordemailhttp-lwu3dhgpbq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          resetId: resetRef.id,
          language: 'en' // Changed to English
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send reset email: ${errorData.error}`);
      }

      console.log('Reset email sent successfully');
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
      console.log(`Calling validateResetCode with resetId="${resetId}" and code="${code}"`);
      const validateResetCode = httpsCallable(functions, 'validateResetCode');

      // S'assurer que le format correspond exactement à ce que la fonction attend
      const result = await validateResetCode({
        resetId,
        code
      });

      console.log('Result from validateResetCode:', result.data);

      return {
        valid: result.data.success === true,
        email: result.data.email
      };
    } catch (error) {
      console.error('Error calling validateResetCode:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  },
  
  // ------- Confirm password reset -------
  async confirmReset(resetId, newPassword) {
    try {
      console.log('Confirming password reset');

      const completePasswordReset = httpsCallable(functions, 'completePasswordReset');
      await completePasswordReset({ resetId, password: newPassword });

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