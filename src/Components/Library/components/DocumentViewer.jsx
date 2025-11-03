import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText, AlertCircle, RefreshCw } from 'lucide-react';

// Dynamic PDF.js import to reduce initial bundle size
let pdfjsLib = null;
const loadPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
};

const GATEWAY = 'https://ipfs.io/ipfs/';
const CORS_PROXY = 'https://cors.eu.org/';
const FALLBACK_GATEWAY = 'https://dweb.link/ipfs/';
const FALLBACK_IMAGE = '/assets/logos/I4TK logo no text.png';

// Stocker les miniatures plutôt que les PDFs bruts
const thumbnailCache = new Map();

const DocumentViewer = ({ documentCid }) => {
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    thumbnail: null,
    useProxy: true
  });

  const loadingRef = useRef(false);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const generateThumbnail = async (pdfBuffer) => {
    try {
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: pdfBuffer,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: false
      });

      const scale = window.innerWidth < 768 ? 0.3 : 0.5;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
        background: 'white',
        intent: 'print'
      }).promise;

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);

      // Nettoyer
      canvas.width = 0;
      canvas.height = 0;
      pdf.destroy();

      return thumbnail;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  };

  const fetchDocument = async (url, useProxy = true) => {
    const finalUrl = useProxy ? `${CORS_PROXY}${url}` : url;

    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/pdf,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error('Error generating the preview - please open the document');
    return await response.arrayBuffer();
  };

  const loadDocument = async () => {
    if (loadingRef.current || unmountedRef.current) return;
    loadingRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Vérifier d'abord le cache des miniatures
      if (thumbnailCache.has(documentCid)) {
        setState({
          isLoading: false,
          error: null,
          thumbnail: thumbnailCache.get(documentCid),
          useProxy: true
        });
        return;
      }

      // Sinon, charger et générer la miniature
      const pdfBuffer = await fetchDocument(`${GATEWAY}${documentCid}`, state.useProxy)
        .catch(async () => {
          return await fetchDocument(`${GATEWAY}${documentCid}`, false)
            .catch(async () => {
              return await fetchDocument(`${FALLBACK_GATEWAY}${documentCid}`, false);
            });
        });

      if (unmountedRef.current) return;

      const thumbnail = await generateThumbnail(pdfBuffer);

      if (unmountedRef.current) return;

      // Mettre en cache la miniature
      thumbnailCache.set(documentCid, thumbnail);

      setState({
        isLoading: false,
        error: null,
        thumbnail,
        useProxy: true
      });

    } catch (error) {
      console.error('Erreur:', error);
      if (!unmountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Le document est temporairement inaccessible',
          thumbnail: null,
          useProxy: !prev.useProxy
        }));
      }
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadDocument();
  }, [documentCid]);

  const getOpenUrl = () => {
    return !state.useProxy ? `${FALLBACK_GATEWAY}${documentCid}` : `${GATEWAY}${documentCid}`;
  };

  const renderContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-500"></div>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Chargement...</p>
        </div>
      );
    }

    if (state.thumbnail) {
      return (
        <img 
          key={`${documentCid}-${Date.now()}`}
          src={state.thumbnail} 
          alt="Aperçu du document"
          className="object-contain w-full h-full"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
            e.target.onerror = null;
          }}
        />
      );
    }

    return (
      <div className="relative w-full h-full">
        <img
          src={FALLBACK_IMAGE}
          alt="Image par défaut"
          className="object-contain w-full h-full"
        />
        {state.error && (
          <button
            onClick={loadDocument}
            className="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      <div className="w-full h-24 md:h-[120px] mb-3 md:mb-4 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {renderContent()}
      </div>

      {(state.thumbnail || state.error) && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Open :</p>
          <a
            href={getOpenUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center group"
          >
            <ExternalLink className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
            Open the document
          </a>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;