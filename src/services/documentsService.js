// =============== IMPORTS ===============
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { embeddingService } from './embeddingService';

// =============== UTILITY FUNCTIONS ===============
// Fonction pour calculer la similarité cosinus entre deux vecteurs
const calculateSimilarity = (vecA, vecB) => {
  // Calcul du produit scalaire
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  // Calcul des normes des vecteurs
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  // Calcul de la similarité cosinus
  const similarity = dotProduct / (normA * normB);
  // Normalisation de la similarité entre 0 et 1
  const normalizedSimilarity = (similarity + 1) / 2;

  console.log({
    dotProduct,
    normA,
    normB,
    similarity,
    normalizedSimilarity
  });

  return normalizedSimilarity;
};

// =============== DOCUMENT SERVICE ===============
export const documentsService = {
  // =============== ADD DOCUMENT ===============
  // Ajoute un nouveau document à Firestore
  async addDocument(documentData) {
    try {
      console.log('=== Adding Document to Firestore ===');
      console.log('1. Document data received:', documentData);

      // Vérification de la présence du tokenId
      if (!documentData.tokenId) {
        console.error('TokenId manquant dans les données du document');
        throw new Error('TokenId required');
      }

      // Génération des embeddings pour le titre et la description
      let titleEmbedding = null;
      let contentEmbedding = null;

      try {
        if (documentData.title) {
          titleEmbedding = await embeddingService.getEmbedding(documentData.title);
        }
        if (documentData.description) {
          contentEmbedding = await embeddingService.getEmbedding(documentData.description);
        }
      } catch (embeddingError) {
        console.warn('Warning: Could not generate embeddings:', embeddingError);
      }

      // Ajout du document à Firestore
      const documentsRef = collection(db, 'web3IP');
      console.log('2. Collection reference obtained');

      const docRef = await addDoc(documentsRef, {
        ...documentData,
        titleEmbedding: titleEmbedding ? titleEmbedding[0] : null,
        contentEmbedding: contentEmbedding ? contentEmbedding[0] : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        validationStatus: "0/4"
      });

      console.log('3. Document added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding document:', error);
      throw error;
    }
  },

  // =============== GET DOCUMENTS ===============
  // Récupère tous les documents de la collection
  async getDocuments() {
    try {
      console.log('=== Fetching Documents ===');
      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);
      console.log('Found', snapshot.size, 'documents');

      // Convertir les documents et les trier par date
      const documents = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        validationStatus: doc.data().validationStatus || "PENDING" 
      }));

      // Tri par date (du plus récent au plus ancien)
      return documents.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return dateB - dateA;
      });

    } catch (error) {
      console.error('❌ Error getting documents:', error);
      throw error;
    }
  },

  // =============== GET SINGLE DOCUMENT ===============
  // Récupère un document spécifique par son ID
  async getDocument(documentId) {
    try {
      console.log('=== Fetching Single Document ===');
      console.log('Document ID:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        validationStatus: docSnap.data().validationStatus || "PENDING"
      };
    } catch (error) {
      console.error('❌ Error getting document:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT ===============
  // Met à jour un document existant
  async updateDocument(documentId, updateData) {
    try {
      console.log('=== Updating Document ===');
      console.log('Params:', { documentId, updateData });

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);

      // Génération de nouveaux embeddings si le titre ou la description sont mis à jour
      let embeddings = {};
      if (updateData.title) {
        const titleEmbedding = await embeddingService.getEmbedding(updateData.title);
        embeddings.titleEmbedding = titleEmbedding[0];
      }
      if (updateData.description) {
        const contentEmbedding = await embeddingService.getEmbedding(updateData.description);
        embeddings.contentEmbedding = contentEmbedding[0];
      }

      await updateDoc(docRef, {
        ...updateData,
        ...embeddings,
        updatedAt: serverTimestamp()
      });

      console.log('Document updated successfully');
    } catch (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
  },

  // =============== DELETE DOCUMENT ===============
  // Supprime un document de la collection
  async deleteDocument(documentId) {
    try {
      console.log('=== Deleting Document ===');
      console.log('Document ID:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      await deleteDoc(docRef);

      console.log('Document deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT STATUS ===============
  // Met à jour le statut de validation d'un document
  async updateDocumentStatus(documentId, validationStatus) {
    try {
      console.log('=== Updating Document Status ===');

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      // Transformation du statut si nécessaire
      let finalStatus = validationStatus;
      if (validationStatus === "4/4") {
        finalStatus = "PUBLISHED";
      }

      const docRef = doc(db, 'web3IP', documentId);
      await updateDoc(docRef, {
        validationStatus: finalStatus,
        updatedAt: serverTimestamp()
      });

      console.log('Document status updated successfully');
    } catch (error) {
      console.error('❌ Error updating document status:', error);
      throw error;
    }
  },

  // =============== GET DOCUMENTS BY ADDRESS ===============
  // Récupère tous les documents créés par une adresse spécifique
  async getDocumentsByAddress(address) {
    try {
      console.log('=== Fetching Documents by Address ===');
      const documentsRef = collection(db, 'web3IP');
      const q = query(documentsRef, where('creatorAddress', '==', address));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        validationStatus: doc.data().validationStatus || "PENDING"
      }));
    } catch (error) {
      console.error('❌ Error getting documents by address:', error);
      throw error;
    }
  },

  // =============== GET DOCUMENTS BY STATUS ===============
  // Récupère tous les documents ayant un statut spécifique
  async getDocumentsByStatus(status) {
    try {
      console.log('=== Fetching Documents by Status ===');
      const documentsRef = collection(db, 'web3IP');
      const q = query(documentsRef, where('validationStatus', '==', status));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error getting documents by status:', error);
      throw error;
    }
  },

  // =============== GET DOCUMENT BY TOKEN ID ===============
  // Récupère un document spécifique par son tokenId
  async getDocumentByTokenId(tokenId) {
    try {
      console.log('=== Fetching Document by TokenId ===');
      console.log('TokenId:', tokenId);

      if (!tokenId) {
        throw new Error('TokenId is required');
      }

      const documentsRef = collection(db, 'web3IP');
      const q = query(documentsRef, where('tokenId', '==', tokenId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('No document found with tokenId:', tokenId);
        return null;
      }

      const docData = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...docData,
        validationStatus: docData.validationStatus || "PENDING"
      };

    } catch (error) {
      console.error('❌ Error getting document by tokenId:', error);
      throw error;
    }
  },


  // =============== ADD COMMENT ===============
  // Ajoute un commentaire à un document
  async addComment(documentId, comment) {
    try {
      console.log('=== Adding Comment ===');
      const docRef = doc(db, 'web3IP', documentId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error('Document not found');
      }

      const currentComments = docSnapshot.data().comments || [];
      await updateDoc(docRef, {
        comments: [...currentComments, comment],
        updatedAt: serverTimestamp()
      });

      console.log('Comment added successfully');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT TOKEN ID ===============
  // Met à jour le tokenId d'un document
  async updateDocumentTokenId(documentId, tokenId) {
    try {
      console.log('=== Updating Document TokenId ===');
      console.log('Params:', { documentId, tokenId });

      if (!documentId || !tokenId) {
        throw new Error('Document ID and Token ID are required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      await updateDoc(docRef, {
        tokenId,
        updatedAt: serverTimestamp()
      });

      console.log('Document tokenId updated successfully');
    } catch (error) {
      console.error('❌ Error updating document tokenId:', error);
      throw error;
    }
  },

  // =============== SEMANTIC SEARCH ===============
  // Effectue une recherche sémantique et lexicale sur les documents
  async semanticSearch(query, currentLang = 'en', limit = 10, userRoles = {}) {
    try {
      console.log('=== Performing Hybrid Search ===');
      console.log('Query:', query);

      // Préparation de la recherche sémantique
      const queryEmbedding = await embeddingService.getEmbedding(query);

      // Préparation de la recherche lexicale
      const keywords = query.toLowerCase().trim().split(/\s+/);

      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);

      const results = [];
      snapshot.forEach(doc => {
        const data = doc.data();

        // Vérification des autorisations de l'utilisateur
        if (!this.canUserViewDocument(data, userRoles)) {
          return;
        }

        let semanticScore = 0;
        let lexicalScore = 0;

        // Calcul du score sémantique
        if (data.titleEmbedding) {
          const titleSimilarity = calculateSimilarity(queryEmbedding[0], data.titleEmbedding);
          semanticScore = Math.max(semanticScore, titleSimilarity);
        }
        if (data.contentEmbedding) {
          const contentSimilarity = calculateSimilarity(queryEmbedding[0], data.contentEmbedding);
          semanticScore = Math.max(semanticScore, contentSimilarity);
        }

        // Calcul du score lexical
        const titleWords = (data.title || '').toLowerCase();
        const contentWords = (data.description || '').toLowerCase();
        const collectionWords = (data.collection || '').toLowerCase();

        const keywordMatches = keywords.filter(keyword => 
          titleWords.includes(keyword) || 
          contentWords.includes(keyword) || 
          collectionWords.includes(keyword)
        ).length;

        lexicalScore = keywordMatches / keywords.length;

        // Score combiné (50% sémantique, 50% lexical)
        const combinedScore = (semanticScore * 0.5) + (lexicalScore * 0.5);

        // Seuil minimal de pertinence
        if (combinedScore > 0.75) {
          results.push({
            id: doc.id,
            title: data.title,
            description: data.description || data.excerpt,
            author: data.author || data.authors || data.creatorAddress,
            createdAt: data.createdAt,
            relevance: combinedScore,
            validationStatus: data.validationStatus,  // Ajout du status
            ipfsCid: data.ipfsCid,
            collection: data.collection  // Ajout de la collection
          });

        }
      });

      console.log(`Found ${results.length} results before sorting`);

      // Tri par score combiné
      const sortedResults = results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);

      return sortedResults;
    } catch (error) {
      console.error('❌ Error in hybrid search:', error);
      throw error;
    }
  },

  // =============== REINDEX EMBEDDINGS ===============
  // Régénère les embeddings pour tous les documents
  async reindexEmbeddings() {
    try {
      console.log('=== Reindexing All Documents Embeddings ===');
      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);

      let updated = 0;
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const docRef = doc(db, 'web3IP', docSnapshot.id);

        let updates = {};

        if (data.title && !data.titleEmbedding) {
          const titleEmbedding = await embeddingService.getEmbedding(data.title);
          updates.titleEmbedding = titleEmbedding[0];
        }

        if (data.description && !data.contentEmbedding) {
          const contentEmbedding = await embeddingService.getEmbedding(data.description);
          updates.contentEmbedding = contentEmbedding[0];
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(docRef, updates);
          updated++;
        }
      }

      console.log(`Reindexing completed. Updated ${updated} documents`);
      return updated;
    } catch (error) {
      console.error('❌ Error in reindexing:', error);
      throw error;
    }
      },

      // =============== CHECK USER PERMISSIONS ===============
      // Vérifie si l'utilisateur a le droit de voir un document
      canUserViewDocument(document, userRoles) {
        if (document.validationStatus === "PUBLISHED") {
          return true;
        }

        if (userRoles.isWebMember || userRoles.isWebAdmin) {
          return true;
        }

        return false;
      }
    };

    export default documentsService;