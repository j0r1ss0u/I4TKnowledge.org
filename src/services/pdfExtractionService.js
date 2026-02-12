// ================================================================
// SERVICE D'EXTRACTION DE TEXTE PDF
// ================================================================
// Ce service extrait le texte des PDFs hébergés sur IPFS
// pour l'analyse IA d'auto-tagging

import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Multi-gateways IPFS pour robustesse
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://4everland.io/ipfs/'
];
const MAX_PAGES_TO_EXTRACT = 8; // Limite pour la vitesse

class PdfExtractionService {
  /**
   * Extrait le texte important d'un PDF depuis son CID IPFS
   * @param {string} ipfsCid - Le CID IPFS du document
   * @returns {Promise<Object>} - { fullText, title, summary, pages }
   */
  async extractTextFromPdf(ipfsCid) {
    // Nettoyer le CID
    let cid = ipfsCid.replace('ipfs://', '').trim();
    if (!cid.match(/^[a-zA-Z0-9]{46,62}$/)) {
      throw new Error('Invalid IPFS CID format');
    }

    console.log('📄 Starting PDF text extraction for:', cid);

    // Essayer d'abord depuis le navigateur avec multi-gateways
    const browserResult = await this.tryBrowserExtraction(cid);
    if (browserResult) {
      return browserResult;
    }

    // Si tous les gateways frontend échouent, fallback vers le backend
    console.log('⚠️ All browser gateways failed, falling back to backend...');
    return await this.tryBackendExtraction(cid);
  }

  async tryBrowserExtraction(cid) {
    let lastError = null;

    // Essayer chaque gateway IPFS
    for (const gateway of IPFS_GATEWAYS) {
      try {
        console.log(`  Trying gateway: ${gateway}...`);
        const pdfUrl = `${gateway}${cid}`;
        
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        });

        const pdf = await loadingTask.promise;
        const numPages = Math.min(pdf.numPages, MAX_PAGES_TO_EXTRACT);

        console.log(`📖 PDF loaded from ${gateway}: ${numPages} pages (total: ${pdf.numPages})`);

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

        const result = {
          fullText: fullText,
          firstPage: pageTexts[0]?.text || '',
          pages: pageTexts,
          numPages: pdf.numPages,
          extractedPages: numPages,
          summary: this.extractSummary(pageTexts),
          source: 'browser',
          gateway: gateway
        };

        console.log(`✅ Extracted ${fullText.length} characters from ${numPages} pages`);
        return result;

      } catch (error) {
        console.log(`  ❌ Gateway ${gateway} failed: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    console.warn('❌ All browser gateways failed:', lastError?.message);
    return null;
  }

  async tryBackendExtraction(cid) {
    try {
      console.log('📡 Requesting backend PDF extraction...');
      
      const response = await fetch('/api/extract-pdf-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ipfsCid: cid })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Backend extraction failed');
      }

      const data = await response.json();
      
      console.log(`✅ Backend extraction successful: ${data.text.length} characters`);

      return {
        fullText: data.text,
        firstPage: data.text.substring(0, 1000),
        summary: data.summary,
        source: 'backend',
        gateway: data.gateway
      };

    } catch (error) {
      console.error('❌ Backend extraction failed:', error);
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
