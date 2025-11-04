// ================================================================
// SERVICE D'AUTO-TAGGING IA (VERSION SÉCURISÉE)
// ================================================================
// Ce service analyse les documents et suggère automatiquement
// des tags du tableau périodique via le backend sécurisé

import { pdfExtractionService } from './pdfExtractionService';
import { globaltoolkitService } from './globaltoolkitService';

// Configuration - URL backend via Vite proxy
// Vite est configuré avec un proxy : /api/* → localhost:3000
// Donc on utilise simplement les chemins relatifs !
const BACKEND_URL = '';

class AutoTaggingService {
  constructor() {
    this.elementsCache = null;
  }

  /**
   * Pré-charge tous les éléments du tableau périodique en cache
   * Appelé une fois au démarrage pour optimiser les performances
   */
  async precomputeElementEmbeddings() {
    // Version sécurisée : on pré-charge juste les éléments
    // Les embeddings sont gérés côté backend
    if (this.elementsCache) {
      console.log('✅ Using cached periodic table elements');
      return;
    }

    console.log('🔄 Loading periodic table elements...');
    
    try {
      const elements = await globaltoolkitService.getAllElements();
      this.elementsCache = elements;
      console.log(`✅ Loaded ${this.elementsCache.length} periodic table elements`);
    } catch (error) {
      console.error('❌ Failed to load periodic table elements:', error);
      throw error;
    }
  }

  /**
   * Fonction principale : suggère des tags pour un document
   * @param {string} ipfsCid - Le CID IPFS du document PDF
   * @param {string} documentTitle - Titre du document
   * @returns {Promise<Array>} - Liste de suggestions avec confiance et explications
   */
  async suggestTagsForDocument(ipfsCid, documentTitle) {
    try {
      console.log('🚀 Starting auto-tagging for:', documentTitle);

      // S'assurer que les éléments sont chargés
      if (!this.elementsCache) {
        await this.precomputeElementEmbeddings();
      }

      // Étape 1 : Extraire le texte du PDF
      console.log('📄 Extracting PDF text...');
      const extractionResult = await pdfExtractionService.extractTextFromPdf(ipfsCid);
      const documentText = extractionResult.summary || extractionResult.firstPage;

      if (!documentText || documentText.length < 100) {
        throw new Error('Document text too short for meaningful analysis');
      }

      // Étape 2 : Appeler le backend pour générer les suggestions
      console.log('🤖 Calling backend AI service...');
      const response = await fetch(`${BACKEND_URL}/api/suggest-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentText,
          documentTitle,
          periodicElements: this.elementsCache
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend AI service error');
      }

      const data = await response.json();
      const suggestions = data.suggestions || [];

      console.log(`✅ Auto-tagging complete: ${suggestions.length} suggestions`);
      return suggestions;

    } catch (error) {
      console.error('❌ Auto-tagging failed:', error);
      throw error;
    }
  }

  /**
   * Version rapide pour plusieurs documents (batch)
   * Utile si on veut traiter plusieurs documents d'un coup
   */
  async suggestTagsForMultipleDocuments(documents, onProgress) {
    const results = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      try {
        const suggestions = await this.suggestTagsForDocument(doc.ipfsCid, doc.title);
        results.push({
          documentId: doc.id,
          suggestions,
          success: true
        });
      } catch (error) {
        results.push({
          documentId: doc.id,
          error: error.message,
          success: false
        });
      }

      // Callback de progression
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: documents.length,
          percentage: ((i + 1) / documents.length) * 100
        });
      }
    }

    return results;
  }
}

export const autoTaggingService = new AutoTaggingService();
