// =============== IMPORTS ===============
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// =============== CONSTANTS ===============
const COLLECTION_NAME = 'globaltoolkit';
const SUBCOLLECTION_NAME = 'resolutionPaths';

// =============== RESOLUTION PATH SERVICE ===============
export const resolutionPathService = {
  /**
   * Récupère tous les resolution paths
   */
  async getAllResolutionPaths() {
    try {
      const pathsRef = collection(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME);
      const snapshot = await getDocs(pathsRef);

      // Convertir les documents en objets avec leurs ID
      const paths = snapshot.docs.map(doc => {
        const data = doc.data();

        // Calculer la note moyenne si des notations existent
        let averageRating = 0;
        let totalRatings = 0;

        if (data.ratings && Object.keys(data.ratings).length > 0) {
          const ratings = Object.values(data.ratings);
          totalRatings = ratings.length;
          averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;
        }

        return {
          id: doc.id,
          ...data,
          averageRating,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      return paths;
    } catch (error) {
      console.error('Error fetching resolution paths:', error);
      throw error;
    }
  },

  /**
   * Récupère les resolution paths d'un utilisateur spécifique
   */
  async getUserResolutionPaths(userId) {
    try {
      const pathsRef = collection(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME);
      const q = query(
        pathsRef, 
        where('creator.uid', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      // Convertir les documents en objets avec leurs ID
      const paths = snapshot.docs.map(doc => {
        const data = doc.data();

        // Calculer la note moyenne si des notations existent
        let averageRating = 0;
        let totalRatings = 0;

        if (data.ratings && Object.keys(data.ratings).length > 0) {
          const ratings = Object.values(data.ratings);
          totalRatings = ratings.length;
          averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;
        }

        return {
          id: doc.id,
          ...data,
          averageRating,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      return paths;
    } catch (error) {
      console.error(`Error fetching resolution paths for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un resolution path par son ID
   */
  async getResolutionPathById(pathId) {
    try {
      const pathRef = doc(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME, pathId);
      const docSnap = await getDoc(pathRef);

      if (!docSnap.exists()) {
        throw new Error(`Resolution path with ID ${pathId} not found`);
      }

      const data = docSnap.data();

      // Calculer la note moyenne si des notations existent
      let averageRating = 0;
      let totalRatings = 0;

      if (data.ratings && Object.keys(data.ratings).length > 0) {
        const ratings = Object.values(data.ratings);
        totalRatings = ratings.length;
        averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;
      }

      return {
        id: docSnap.id,
        ...data,
        averageRating,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        comments: (data.comments || []).map(comment => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date()
        }))
      };
    } catch (error) {
      console.error(`Error fetching resolution path with ID ${pathId}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau resolution path
   */
  async createResolutionPath(pathData) {
    try {
      const pathsRef = collection(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME);

      const newPath = {
        ...pathData,
        ratings: {},
        comments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(pathsRef, newPath);

      // Récupérer le document créé pour avoir les timestamps corrects
      const newDocSnap = await getDoc(docRef);
      const newDocData = newDocSnap.data();

      return {
        id: docRef.id,
        ...newDocData,
        averageRating: 0,
        createdAt: newDocData.createdAt.toDate(),
        updatedAt: newDocData.updatedAt.toDate()
      };
    } catch (error) {
      console.error('Error creating resolution path:', error);
      throw error;
    }
  },

  /**
   * Met à jour un resolution path existant
   */
  async updateResolutionPath(pathId, updateData) {
    try {
      const pathRef = doc(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME, pathId);

      // Vérifier que le document existe
      const docSnap = await getDoc(pathRef);
      if (!docSnap.exists()) {
        throw new Error(`Resolution path with ID ${pathId} not found`);
      }

      // Préparer les données à mettre à jour
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Mettre à jour le document
      await updateDoc(pathRef, dataToUpdate);

      // Retourner le document mis à jour
      return await this.getResolutionPathById(pathId);
    } catch (error) {
      console.error(`Error updating resolution path with ID ${pathId}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'un resolution path (draft ou published)
   */
  async updateResolutionPathStatus(pathId, status) {
    try {
      if (status !== 'draft' && status !== 'published') {
        throw new Error('Status must be either "draft" or "published"');
      }

      return await this.updateResolutionPath(pathId, { status });
    } catch (error) {
      console.error(`Error updating status for resolution path ${pathId}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un commentaire à un resolution path
   */
  async addComment(pathId, commentData) {
    try {
      const pathRef = doc(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME, pathId);

      // Vérifier que le document existe
      const docSnap = await getDoc(pathRef);
      if (!docSnap.exists()) {
        throw new Error(`Resolution path with ID ${pathId} not found`);
      }

      const data = docSnap.data();
      const comments = Array.isArray(data.comments) ? data.comments : [];

      // Créer le nouveau commentaire
      const newComment = {
        ...commentData,
        createdAt: new Date() // Utiliser la date actuelle pour l'affichage immédiat
      };

      // Ajouter le commentaire à la liste
      const updatedComments = [...comments, newComment];

      // Mettre à jour le document
      await updateDoc(pathRef, {
        comments: updatedComments,
        updatedAt: serverTimestamp()
      });

      return newComment;
    } catch (error) {
      console.error(`Error adding comment to resolution path ${pathId}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute ou met à jour une note d'un utilisateur sur un resolution path
   */
  async ratePath(pathId, userId, rating) {
    try {
      // Validation de la note
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error('Rating must be an integer between 1 and 5');
      }

      const pathRef = doc(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME, pathId);

      // Vérifier que le document existe
      const docSnap = await getDoc(pathRef);
      if (!docSnap.exists()) {
        throw new Error(`Resolution path with ID ${pathId} not found`);
      }

      const data = docSnap.data();
      const ratings = data.ratings || {};

      // Mettre à jour la note de l'utilisateur
      ratings[userId] = rating;

      // Mettre à jour le document
      await updateDoc(pathRef, {
        ratings,
        updatedAt: serverTimestamp()
      });

      return ratings;
    } catch (error) {
      console.error(`Error rating resolution path ${pathId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un resolution path
   */
  async deleteResolutionPath(pathId) {
    try {
      const pathRef = doc(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME, pathId);

      // Vérifier que le document existe
      const docSnap = await getDoc(pathRef);
      if (!docSnap.exists()) {
        throw new Error(`Resolution path with ID ${pathId} not found`);
      }

      // Supprimer le document
      await deleteDoc(pathRef);
      return true;
    } catch (error) {
      console.error(`Error deleting resolution path with ID ${pathId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les resolution paths les plus notés
   */
  async getTopRatedPaths(limit = 5) {
    try {
      const paths = await this.getAllResolutionPaths();

      // Filtrer pour n'avoir que les paths publiés
      const publishedPaths = paths.filter(path => path.status === 'published');

      // Trier par note moyenne décroissante
      const sortedPaths = publishedPaths.sort((a, b) => b.averageRating - a.averageRating);

      // Limiter le nombre de résultats
      return sortedPaths.slice(0, limit);
    } catch (error) {
      console.error('Error getting top rated paths:', error);
      throw error;
    }
  },

  /**
   * Récupère les resolution paths les plus récents
   */
  async getRecentPaths(limit = 5) {
    try {
      const pathsRef = collection(db, COLLECTION_NAME, 'data', SUBCOLLECTION_NAME);
      const q = query(
        pathsRef,
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        orderBy('title')
      );

      const snapshot = await getDocs(q);

      const paths = snapshot.docs.map(doc => {
        const data = doc.data();

        // Calculer la note moyenne
        let averageRating = 0;
        if (data.ratings && Object.keys(data.ratings).length > 0) {
          const ratings = Object.values(data.ratings);
          averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        }

        return {
          id: doc.id,
          ...data,
          averageRating,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      return paths.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent paths:', error);
      throw error;
    }
  }
};

export default resolutionPathService;