// ================================================================
// IMPORTS ET CONFIGURATION
// ================================================================
import { db } from './firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';
import axios from 'axios';
import { embeddingService } from './embeddingService';
import { languageDetection } from './languageService';
import { conversationRouter, ConversationRouter } from './conversationRouter';

// Constantes de configuration
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const MAX_RESULTS = 3;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// ================================================================
// BACKEND URL HELPER
// ================================================================
const getBackendURL = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  
  // Production Replit: abc.kirk.replit.dev → abc-3000.kirk.replit.dev
  return `https://${hostname.replace(/\.([^.]+\.replit\.dev)$/, '-3000.$1')}`;
};

// ================================================================
// SERVICE PRINCIPAL DE CHAT
// ================================================================
class ChatService {
  constructor() {
    this.conversations = new Map();
    this.backendURL = getBackendURL();
    console.log('🤖 Chat service initialized with backend:', this.backendURL);
  }

  // ================================================================
  // BACKEND COMMUNICATION - Appels OpenAI via backend sécurisé
  // ================================================================
  async callOpenAI(messages, temperature = 0.7, maxTokens = 800) {
    try {
      const response = await axios.post(`${this.backendURL}/api/rag-chat`, {
        messages,
        model: 'gpt-4o-mini',
        temperature,
        maxTokens
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Unknown error');
      }

      return response.data.response;
    } catch (error) {
      console.error('❌ Backend OpenAI call failed:', error);
      throw error;
    }
  }

  // ================================================================
  // GESTION IPFS - Récupération documents
  // ================================================================
  async fetchIPFSContent(ipfsCid, retries = 3) {
    try {
      let cid = ipfsCid.replace('ipfs://', '').trim();
      if (!cid.match(/^[a-zA-Z0-9]{46,62}$/)) return null;

      console.log('📥 Fetching IPFS:', cid);
      const response = await axios.get(`${IPFS_GATEWAY}${cid}`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        return this.fetchIPFSContent(ipfsCid, retries - 1);
      }
      console.error('❌ IPFS error:', error);
      return null;
    }
  }

  // ================================================================
  // RECHERCHE SÉMANTIQUE - Trouver documents pertinents
  // ================================================================
  async findRelevantDocuments(queryEmbedding) {
    const docsRef = collection(db, 'web3IP');
    const q = query(docsRef, where('validationStatus', '==', 'PUBLISHED'));
    const snapshot = await getDocs(q);

    const similarities = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.contentEmbedding) return null;
        return this.cosineSimilarity(queryEmbedding[0], data.contentEmbedding);
      })
      .filter(Boolean);

    const threshold = this.getSimilarityThreshold(similarities);

    const candidates = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.contentEmbedding) return null;
        const similarity = this.cosineSimilarity(queryEmbedding[0], data.contentEmbedding);
        return similarity > threshold ? {
          id: doc.id,
          similarity,
          title: data.title,
          description: data.description,
          authors: data.authors,
          programme: data.programme,
          ipfsCid: data.ipfsCid
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS);

    return candidates;
  }

  // ================================================================
  // UTILS - Fonctions utilitaires
  // ================================================================
  getSimilarityThreshold(similarities) {
    if (!similarities.length) return 0.1;
    const mean = similarities.reduce((a,b) => a + b) / similarities.length;
    return Math.max(0.05, mean * 0.7);
  }

  cosineSimilarity(vec1, vec2) {
    try {
      const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
      const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
      const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
      return dotProduct / (norm1 * norm2);
    } catch {
      return 0;
    }
  }

  detectLanguage(text) {
    return languageDetection.detectLanguage(text);
  }

  getGreeting(lang) {
    const hour = new Date().getHours();
    if (lang === 'fr') {
      if (hour < 12) return "Bonjour";
      if (hour < 18) return "Bon après-midi";
      return "Bonsoir";
    }
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // ================================================================
  // MÉTHODES DE CHAT
  // ================================================================

  // Gestion conversation simple
  async handleSimpleChat(message, detectedLang) {
    const messages = [
      { 
        role: "system", 
        content: conversationRouter.getSystemPrompt('chitchat', detectedLang)
      },
      { role: "user", content: message }
    ];

    const response = await this.callOpenAI(messages, 0.7, 800);

    return {
      answer: response,
      sources: []
    };
  }

  // Gestion recherche documentaire
  async handleDocumentSearch(message, detectedLang, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        const queryEmbedding = await embeddingService.getEmbedding(message);
        const relevantDocs = await this.findRelevantDocuments(queryEmbedding);

        if (relevantDocs.length === 0) {
          return {
            answer: detectedLang === 'fr'
              ? "Je ne trouve pas de documents pertinents. Pourriez-vous reformuler votre question ?"
              : "I couldn't find relevant documents. Could you rephrase your question?",
            sources: []
          };
        }

        const fullDocs = await Promise.all(
          relevantDocs.map(async doc => ({
            ...doc,
            content: await this.fetchIPFSContent(doc.ipfsCid) || doc.description
          }))
        );

        const context = fullDocs
          .map((doc, idx) => {
            const authorStr = Array.isArray(doc.authors) 
              ? doc.authors.join(', ') 
              : typeof doc.authors === 'string' 
                ? doc.authors 
                : 'N/A';
            return `[${idx + 1}] ${doc.title}\n${doc.content}\nAuthors: ${authorStr}`;
          })
          .join('\n\n');

        const messages = [
          { 
            role: "system", 
            content: conversationRouter.getSystemPrompt('research', detectedLang)
          },
          { role: "user", content: `Question: ${message}\n\nSources:\n\n${context}` }
        ];

        const response = await this.callOpenAI(messages, 0.3, 800);

        return {
          answer: response,
          sources: fullDocs.map(doc => ({
            title: doc.title,
            authors: doc.authors,
            programme: doc.programme,
            similarity: doc.similarity,
            url: `${IPFS_GATEWAY}${doc.ipfsCid.replace('ipfs://', '')}`
          }))
        };
      } catch (error) {
        if (error.status === 429 && i < retries - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAY * (i + 1)));
          continue;
        }
        throw error;
      }
    }

    throw new Error('Max retries reached');
  }

  // ================================================================
  // MÉTHODE PRINCIPALE - Point d'entrée
  // ================================================================
  async chat(message, lang = null, retries = MAX_RETRIES) {
    try {
      const detectedLang = lang || this.detectLanguage(message);
      console.log('💬 Request:', message, `(${detectedLang})`);

      // Détection du type de message
      const messageType = conversationRouter.detectIntent(message, detectedLang);
      console.log('🎯 Message type:', messageType);

      // Si c'est une salutation
      if (messageType === ConversationRouter.MESSAGE_TYPES.GREETING) {
        const greeting = this.getGreeting(detectedLang);
        return {
          answer: detectedLang === 'fr' 
            ? `${greeting} ! Je suis votre assistant I4TK. Comment puis-je vous aider aujourd'hui ?`
            : `${greeting}! I'm your I4TK assistant. How can I help you today?`,
          sources: []
        };
      }

      // Si on doit chercher dans les documents
      if (conversationRouter.shouldSearchDocuments(messageType)) {
        return await this.handleDocumentSearch(message, detectedLang, retries);
      }

      // Sinon, conversation simple
      return await this.handleSimpleChat(message, detectedLang);

    } catch (error) {
      console.error('❌ Error:', error);
      const errorLang = detectedLang || 'en';
      return {
        answer: errorLang === 'fr'
          ? "Service temporairement indisponible. Veuillez réessayer dans quelques instants."
          : "Service temporarily unavailable. Please try again in a moment.",
        sources: []
      };
    }
  }
}

export const chatService = new ChatService();