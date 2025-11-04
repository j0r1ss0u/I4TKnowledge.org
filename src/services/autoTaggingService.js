// ================================================================
// SERVICE D'AUTO-TAGGING IA
// ================================================================
// Ce service analyse les documents et suggère automatiquement
// des tags du tableau périodique en utilisant embeddings + GPT-4o-mini

import OpenAI from 'openai';
import { embeddingService } from './embeddingService';
import { pdfExtractionService } from './pdfExtractionService';
import { globaltoolkitService } from './globaltoolkitService';

// Configuration
const MAX_CANDIDATES = 8; // Nombre de candidats à présélectionner avec embeddings
const MIN_SIMILARITY = 0.3; // Similarité minimale pour considérer un élément
const CONFIDENCE_THRESHOLD = 0.6; // Seuil de confiance pour suggérer un tag

class AutoTaggingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.elementEmbeddingsCache = null;
    this.elementsCache = null;
  }

  /**
   * Pré-calcule et cache les embeddings de tous les éléments du tableau périodique
   * À appeler une seule fois au démarrage
   */
  async precomputeElementEmbeddings() {
    if (this.elementEmbeddingsCache && this.elementsCache) {
      console.log('✅ Using cached element embeddings');
      return;
    }

    console.log('🔄 Precomputing element embeddings...');
    
    try {
      // Récupérer tous les éléments
      const elements = await globaltoolkitService.getAllElements();
      this.elementsCache = elements;

      // Calculer les embeddings pour chaque élément
      const embeddingsPromises = elements.map(async (element) => {
        // Créer un texte descriptif pour l'embedding
        const elementText = `${element.name}. ${element.description}. ${element.context || ''}`;
        const embedding = await embeddingService.getEmbedding(elementText);
        
        return {
          id: element.id,
          name: element.name,
          description: element.description,
          context: element.context,
          category: element.category,
          embedding: embedding[0] // Le service retourne un tableau
        };
      });

      this.elementEmbeddingsCache = await Promise.all(embeddingsPromises);
      console.log(`✅ Precomputed ${this.elementEmbeddingsCache.length} element embeddings`);
      
    } catch (error) {
      console.error('❌ Failed to precompute element embeddings:', error);
      throw error;
    }
  }

  /**
   * Calcule la similarité cosinus entre deux vecteurs
   */
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
    
    const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
    
    return dotProduct / (norm1 * norm2);
  }

  /**
   * Étape 1 : Présélection rapide via similarité d'embeddings
   * Retourne les N éléments les plus similaires au document
   */
  async preselectCandidates(documentText) {
    // S'assurer que les embeddings sont calculés
    if (!this.elementEmbeddingsCache) {
      await this.precomputeElementEmbeddings();
    }

    // Générer l'embedding du document
    console.log('📊 Generating document embedding...');
    const docEmbedding = await embeddingService.getEmbedding(documentText);

    // Calculer la similarité avec chaque élément
    const similarities = this.elementEmbeddingsCache.map(element => ({
      ...element,
      similarity: this.cosineSimilarity(docEmbedding[0], element.embedding)
    }));

    // Trier par similarité et filtrer
    const candidates = similarities
      .filter(el => el.similarity > MIN_SIMILARITY)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_CANDIDATES);

    console.log(`🎯 Preselected ${candidates.length} candidates:`);
    candidates.forEach(c => {
      console.log(`  - ${c.id} (${c.name}): ${(c.similarity * 100).toFixed(1)}%`);
    });

    return candidates;
  }

  /**
   * Étape 2 : Validation et explication par GPT-4o-mini
   * Analyse les candidats et retourne ceux qui sont vraiment pertinents
   */
  async validateWithLLM(documentSummary, documentTitle, candidates) {
    console.log('🤖 Validating candidates with GPT-4o-mini...');

    // Préparer la liste des candidats pour le prompt
    const candidatesText = candidates.map((c, idx) => 
      `${idx + 1}. **${c.id} - ${c.name}**\n   Description: ${c.description}\n   Context: ${c.context || 'N/A'}`
    ).join('\n\n');

    const prompt = `You are an expert in digital platform governance and regulation. Analyze this document and determine which regulatory elements from the Periodic Table of Platform Regulation are most relevant.

**Document Title:** ${documentTitle}

**Document Summary:**
${documentSummary}

**Candidate Elements:**
${candidatesText}

**Instructions:**
1. Analyze which elements are truly relevant to this document's content
2. For each relevant element, provide:
   - The element ID (e.g., "EM", "RG")
   - A confidence score from 0 to 1 (1 = highly relevant, 0 = not relevant)
   - A brief explanation (1-2 sentences) of WHY this element is relevant
3. Only include elements with confidence >= ${CONFIDENCE_THRESHOLD}
4. Return a JSON array with this exact structure:

[
  {
    "elementId": "EM",
    "confidence": 0.95,
    "rationale": "The document extensively discusses enforcement mechanisms and compliance monitoring systems."
  }
]

Return ONLY the JSON array, no other text.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert analyst specializing in digital platform governance. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Bas pour plus de cohérence
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      
      // Parser la réponse JSON
      let suggestions;
      try {
        // GPT pourrait wrapper dans un objet, on gère les deux cas
        const parsed = JSON.parse(response);
        suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions || [];
      } catch (parseError) {
        console.error('Failed to parse LLM response:', response);
        // Fallback : extraire le JSON array du texte
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          suggestions = [];
        }
      }

      console.log(`✅ LLM validated ${suggestions.length} suggestions`);
      return suggestions;

    } catch (error) {
      console.error('❌ LLM validation error:', error);
      // Fallback : retourner les candidats avec similarité comme confiance
      return candidates.slice(0, 3).map(c => ({
        elementId: c.id,
        confidence: c.similarity,
        rationale: `High semantic similarity (${(c.similarity * 100).toFixed(0)}%) with document content.`
      }));
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

      // Étape 1 : Extraire le texte du PDF
      const extractionResult = await pdfExtractionService.extractTextFromPdf(ipfsCid);
      const documentText = extractionResult.summary || extractionResult.firstPage;

      if (!documentText || documentText.length < 100) {
        throw new Error('Document text too short for meaningful analysis');
      }

      // Étape 2 : Présélection par embeddings
      const candidates = await this.preselectCandidates(documentText);

      if (candidates.length === 0) {
        console.log('⚠️ No candidates found with sufficient similarity');
        return [];
      }

      // Étape 3 : Validation par LLM
      const suggestions = await this.validateWithLLM(
        documentText,
        documentTitle,
        candidates
      );

      // Enrichir avec les informations complètes des éléments
      const enrichedSuggestions = suggestions.map(sugg => {
        const element = this.elementsCache.find(el => el.id === sugg.elementId);
        return {
          ...sugg,
          elementName: element?.name || sugg.elementId,
          elementDescription: element?.description || '',
          category: element?.category || ''
        };
      });

      console.log(`✅ Auto-tagging complete: ${enrichedSuggestions.length} suggestions`);
      return enrichedSuggestions;

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
