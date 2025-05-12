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

// =============== GLOBALTOOLKIT SERVICE ===============
export const globaltoolkitService = {
  /**
   * Récupère tous les éléments du toolkit
   */
  async getAllElements() {
    try {
      const toolkitRef = collection(db, COLLECTION_NAME);
      const q = query(toolkitRef, orderBy('category'), orderBy('name'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.data().id || doc.id,  // Utiliser le champ id s'il existe, sinon l'ID du document
        docId: doc.id,  // Stocker l'ID du document Firebase
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching toolkit elements:', error);
      throw error;
    }
  },

  /**
   * Récupère tous les éléments d'une catégorie
   */
  async getElementsByCategory(category) {
    try {
      const toolkitRef = collection(db, COLLECTION_NAME);
      const q = query(
        toolkitRef, 
        where('category', '==', category),
        orderBy('name')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.data().id || doc.id,  // Utiliser le champ id s'il existe, sinon l'ID du document
        docId: doc.id,  // Stocker l'ID du document Firebase
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error fetching elements by category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un élément par son ID
   */
  async getElementById(id) {
    try {
      console.log("Getting element with ID:", id);

      // D'abord, essayons de récupérer directement le document par son ID
      const docRef = doc(db, COLLECTION_NAME, id);
      let docSnap = await getDoc(docRef);

      // Si le document n'existe pas avec cet ID, cherchons par le champ 'id'
      if (!docSnap.exists()) {
        console.log(`Document with ID ${id} not found directly, trying to search by 'id' field`);

        const toolkitRef = collection(db, COLLECTION_NAME);
        const q = query(toolkitRef, where('id', '==', id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error(`No element found with id field = ${id}`);
          throw new Error(`Element with ID ${id} not found`);
        }

        // Utiliser le premier document trouvé
        docSnap = await getDoc(doc(db, COLLECTION_NAME, snapshot.docs[0].id));
      }

      console.log("Found document:", docSnap.data());

      return {
        id: docSnap.data().id || docSnap.id,
        docId: docSnap.id,  // Stocker l'ID du document Firebase
        ...docSnap.data()
      };
    } catch (error) {
      console.error(`Error fetching element with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel élément (admin only)
   */
  async createElement(elementData) {
    try {
      const toolkitRef = collection(db, COLLECTION_NAME);

      const newElement = {
        ...elementData,
        examples: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(toolkitRef, newElement);
      return {
        id: elementData.id || docRef.id,
        docId: docRef.id,
        ...newElement
      };
    } catch (error) {
      console.error('Error creating toolkit element:', error);
      throw error;
    }
  },

  /**
   * Met à jour les informations de base d'un élément (admin only)
   */
  async updateElementInfo(id, updateData) {
    try {
      // Identifier le document à mettre à jour
      let docRefToUpdate;

      // D'abord, essayons de récupérer directement le document par son ID
      const directDocRef = doc(db, COLLECTION_NAME, id);
      let docSnap = await getDoc(directDocRef);

      // Si le document n'existe pas avec cet ID, cherchons par le champ 'id'
      if (!docSnap.exists()) {
        console.log(`Document with ID ${id} not found directly, trying to search by 'id' field`);

        const toolkitRef = collection(db, COLLECTION_NAME);
        const q = query(toolkitRef, where('id', '==', id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error(`No element found with id field = ${id}`);
          throw new Error(`Element with ID ${id} not found`);
        }

        // Utiliser le premier document trouvé
        docRefToUpdate = doc(db, COLLECTION_NAME, snapshot.docs[0].id);
      } else {
        docRefToUpdate = directDocRef;
      }

      await updateDoc(docRefToUpdate, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Récupérer et retourner l'élément mis à jour
      return await this.getElementById(id);
    } catch (error) {
      console.error(`Error updating element with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un exemple à un élément (membres et admin)
   */
  async addElementExample(id, exampleData) {
    try {
      console.log("Adding example to element", id, exampleData);

      // Identifier le document à mettre à jour
      let docRefToUpdate;
      let docSnap;

      // D'abord, essayons de récupérer directement le document par son ID
      const directDocRef = doc(db, COLLECTION_NAME, id);
      docSnap = await getDoc(directDocRef);

      // Si le document n'existe pas avec cet ID, cherchons par le champ 'id'
      if (!docSnap.exists()) {
        console.log(`Document with ID ${id} not found directly, trying to search by 'id' field`);

        const toolkitRef = collection(db, COLLECTION_NAME);
        const q = query(toolkitRef, where('id', '==', id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error(`No element found with id field = ${id}`);
          throw new Error(`Element with ID ${id} not found`);
        }

        // Utiliser le premier document trouvé
        docRefToUpdate = doc(db, COLLECTION_NAME, snapshot.docs[0].id);
        docSnap = await getDoc(docRefToUpdate);
      } else {
        docRefToUpdate = directDocRef;
      }

      const currentData = docSnap.data();
      // Assurez-vous que examples est toujours un tableau
      const examples = Array.isArray(currentData.examples) ? currentData.examples : [];

      const newExample = {
        ...exampleData,
        id: Date.now().toString(), // Simple unique ID
        createdAt: new Date().toISOString()
      };

      console.log("Current examples:", examples);
      console.log("New example to add:", newExample);

      const updatedExamples = [...examples, newExample];

      console.log("Updated examples array:", updatedExamples);
      console.log("Updating document with ref:", docRefToUpdate.id);

      await updateDoc(docRefToUpdate, {
        examples: updatedExamples,
        updatedAt: serverTimestamp()
      });

      console.log("Document updated successfully");
      return newExample;
    } catch (error) {
      console.error(`Error adding example to element with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un exemple d'un élément (admin only ou auteur de l'exemple)
   */
  async deleteElementExample(elementId, exampleId, userId, userRole) {
    try {
      console.log("Deleting example", { elementId, exampleId, userId, userRole });

      // Identifier le document à mettre à jour
      let docRefToUpdate;
      let docSnap;

      // D'abord, essayons de récupérer directement le document par son ID
      const directDocRef = doc(db, COLLECTION_NAME, elementId);
      docSnap = await getDoc(directDocRef);

      // Si le document n'existe pas avec cet ID, cherchons par le champ 'id'
      if (!docSnap.exists()) {
        console.log(`Document with ID ${elementId} not found directly, trying to search by 'id' field`);

        const toolkitRef = collection(db, COLLECTION_NAME);
        const q = query(toolkitRef, where('id', '==', elementId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error(`No element found with id field = ${elementId}`);
          throw new Error(`Element with ID ${elementId} not found`);
        }

        // Utiliser le premier document trouvé
        docRefToUpdate = doc(db, COLLECTION_NAME, snapshot.docs[0].id);
        docSnap = await getDoc(docRefToUpdate);
      } else {
        docRefToUpdate = directDocRef;
      }

      const currentData = docSnap.data();
      const examples = Array.isArray(currentData.examples) ? currentData.examples : [];

      // Trouver l'index de l'exemple à supprimer
      const exampleIndex = examples.findIndex(example => example.id === exampleId);

      if (exampleIndex === -1) {
        throw new Error(`Example with ID ${exampleId} not found`);
      }

      // Vérifier si l'utilisateur est l'auteur de l'exemple ou un admin
      const isAuthor = examples[exampleIndex].userId === userId;
      const isAdmin = userRole === 'admin' || 
                     userId === 'admin@i4tk.org' || 
                     userId === 'joris.galea@i4tknowledge.net';

      console.log("Authorization check:", { isAuthor, isAdmin });

      if (!isAuthor && !isAdmin) {
        throw new Error('Unauthorized: Only admins or the author can delete an example');
      }

      // Supprimer l'exemple
      examples.splice(exampleIndex, 1);

      await updateDoc(docRefToUpdate, {
        examples: examples,
        updatedAt: serverTimestamp()
      });

      console.log("Example deleted successfully");
      return true;
    } catch (error) {
      console.error(`Error deleting example from element:`, error);
      throw error;
    }
  },

  /**
   * Supprime un élément entier (admin only)
   */
  async deleteElement(id) {
    try {
      // Identifier le document à supprimer
      let docRefToDelete;

      // D'abord, essayons de récupérer directement le document par son ID
      const directDocRef = doc(db, COLLECTION_NAME, id);
      let docSnap = await getDoc(directDocRef);

      // Si le document n'existe pas avec cet ID, cherchons par le champ 'id'
      if (!docSnap.exists()) {
        console.log(`Document with ID ${id} not found directly, trying to search by 'id' field`);

        const toolkitRef = collection(db, COLLECTION_NAME);
        const q = query(toolkitRef, where('id', '==', id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error(`No element found with id field = ${id}`);
          throw new Error(`Element with ID ${id} not found`);
        }

        // Utiliser le premier document trouvé
        docRefToDelete = doc(db, COLLECTION_NAME, snapshot.docs[0].id);
      } else {
        docRefToDelete = directDocRef;
      }

      await deleteDoc(docRefToDelete);
      return true;
    } catch (error) {
      console.error(`Error deleting element with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Initialise la collection avec les données par défaut si vide
   */
  async initializeDefaultData(defaultElements) {
    try {
      // Vérifier si la collection est vide
      const toolkitRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(toolkitRef);

      if (snapshot.empty) {
        console.log('Initializing default toolkit data...');

        // Ajouter les éléments par défaut
        const batch = [];
        for (const element of defaultElements) {
          batch.push(this.createElement(element));
        }

        await Promise.all(batch);
        console.log(`Added ${defaultElements.length} default elements`);
        return true;
      }

      return false; // Collection n'est pas vide, aucune initialisation nécessaire
    } catch (error) {
      console.error('Error initializing default toolkit data:', error);
      throw error;
    }
  }
};

export default globaltoolkitService;