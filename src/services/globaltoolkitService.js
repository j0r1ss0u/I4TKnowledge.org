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
        id: doc.id,
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
        id: doc.id,
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
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Element with ID ${id} not found`);
      }

      return {
        id: docSnap.id,
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
        id: docRef.id,
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
      const docRef = doc(db, COLLECTION_NAME, id);

      await updateDoc(docRef, {
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

      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error(`Element with ID ${id} not found`);
        throw new Error(`Element with ID ${id} not found`);
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

      await updateDoc(docRef, {
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

      const docRef = doc(db, COLLECTION_NAME, elementId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Element with ID ${elementId} not found`);
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

      await updateDoc(docRef, {
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
      await deleteDoc(doc(db, COLLECTION_NAME, id));
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