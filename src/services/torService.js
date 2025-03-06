// =================================================================
// torService.js
// Service to manage Terms of Reference acceptances
// =================================================================

import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const torService = {

  // =================================================================
  // ACCEPT TERMS OF REFERENCE
  // Record a user's acceptance of the Terms of Reference
  // =================================================================
  async acceptToR(email, documentId) {
    try {
      console.log('Recording ToR acceptance for:', email, documentId);

      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('Error: User must be authenticated to accept ToR');
        throw new Error('User must be authenticated to accept Terms of Reference');
      }

      // Create acceptance document
      const acceptancesRef = collection(db, 'torAcceptances');
      const acceptanceDoc = {
        userId: currentUser.uid,
        documentId: documentId,
        email: email,
        acceptedAt: serverTimestamp(),
        status: 'accepted',
        organization: ""  // Required field according to database structure
      };

      const docRef = await addDoc(acceptancesRef, acceptanceDoc);
      console.log('ToR acceptance recorded successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error recording ToR acceptance:', error);
      throw error;
    }
  },

  // =================================================================
  // CHECK IF USER HAS ACCEPTED TOR
  // Verify if a user has already accepted a specific ToR document
  // =================================================================
  async hasAcceptedToR(userId, documentId) {
    try {
      const acceptancesRef = collection(db, 'torAcceptances');
      const q = query(
        acceptancesRef,
        where('userId', '==', userId),
        where('documentId', '==', documentId),
        where('status', '==', 'accepted')
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking ToR acceptance:', error);
      throw error;
    }
  },

  // =================================================================
  // GET SIGNATORIES
  // Retrieve all users who have accepted a specific ToR document
  // =================================================================
  async getSignatories(documentId) {
    try {
      console.log('Fetching signatories for document:', documentId);
      const acceptancesRef = collection(db, 'torAcceptances');
      const q = query(
        acceptancesRef,
        where('documentId', '==', documentId),
        where('status', '==', 'accepted'),
        orderBy('acceptedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const signatories = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          acceptedAt: data.acceptedAt?.toDate()
        };
      });

      console.log('Processed signatories:', signatories);
      return signatories;
    } catch (error) {
      console.error('Error fetching ToR signatories:', error);
      throw error;
    }
  }
};

export default torService;