// ================================================================
// SERVICE D'EXTRACTION DE TEXTE PDF
// ================================================================
// Ce service extrait le texte des PDFs hébergés sur IPFS
// pour l'analyse IA d'auto-tagging

import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const MAX_PAGES_TO_EXTRACT = 8; // Limite pour la vitesse

class PdfExtractionService {
  /**
   * Extrait le texte important d'un PDF depuis son CID IPFS
   * @param {string} ipfsCid - Le CID IPFS du document
   * @returns {Promise<Object>} - { fullText, title, summary, pages }
   */
  async extractTextFromPdf(ipfsCid) {
    try {
      console.log('📄 Starting PDF text extraction for:', ipfsCid);

      // Nettoyer le CID
      let cid = ipfsCid.replace('ipfs://', '').trim();
      if (!cid.match(/^[a-zA-Z0-9]{46,62}$/)) {
        throw new Error('Invalid IPFS CID format');
      }

      // Charger le PDF depuis IPFS
      const pdfUrl = `${IPFS_GATEWAY}${cid}`;
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;
      const numPages = Math.min(pdf.numPages, MAX_PAGES_TO_EXTRACT);

      console.log(`📖 PDF loaded: ${numPages} pages (total: ${pdf.numPages})`);

      // Extraire le texte de chaque page
      const pageTexts = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pageTexts.push({
          pageNumber: pageNum,
          text: pageText
        });
      }

      // Combiner tout le texte
      const fullText = pageTexts.map(p => p.text).join('\n\n');

      // Extraire les sections importantes
      const result = {
        fullText: fullText,
        firstPage: pageTexts[0]?.text || '',
        pages: pageTexts,
        numPages: pdf.numPages,
        extractedPages: numPages,
        summary: this.extractSummary(pageTexts)
      };

      console.log(`✅ Extracted ${fullText.length} characters from ${numPages} pages`);
      return result;

    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  /**
   * Extrait un résumé intelligent du document
   * Cherche l'abstract, l'introduction, ou prend les premières pages
   */
  extractSummary(pageTexts) {
    const fullText = pageTexts.map(p => p.text).join('\n');
    
    // Chercher un abstract
    const abstractMatch = fullText.match(/abstract[:\s]+(.*?)(?:introduction|keywords|1\.|$)/is);
    if (abstractMatch && abstractMatch[1].length > 100) {
      return abstractMatch[1].trim().substring(0, 2000);
    }

    // Chercher une introduction
    const introMatch = fullText.match(/introduction[:\s]+(.*?)(?:methodology|background|2\.|$)/is);
    if (introMatch && introMatch[1].length > 100) {
      return introMatch[1].trim().substring(0, 2000);
    }

    // Sinon prendre les premières pages (environ 2000 caractères)
    return fullText.substring(0, 2000);
  }

  /**
   * Version simplifiée pour juste obtenir un extrait rapide
   * Utile pour la preview sans charger tout le PDF
   */
  async extractQuickSummary(ipfsCid) {
    try {
      const result = await this.extractTextFromPdf(ipfsCid);
      return {
        summary: result.summary,
        firstPage: result.firstPage,
        totalPages: result.numPages
      };
    } catch (error) {
      console.error('Quick summary extraction failed:', error);
      return null;
    }
  }
}

export const pdfExtractionService = new PdfExtractionService();
