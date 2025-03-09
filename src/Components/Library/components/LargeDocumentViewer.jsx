import React, { useEffect, useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const GATEWAY = 'https://nftstorage.link/ipfs/';
const FALLBACK_GATEWAY = 'https://cloudflare-ipfs.com/ipfs/';

const LargeDocumentViewer = ({ documentCid, currentLang }) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    pdfLoaded: false,
    currentPage: 1,
    numPages: 0,
  });

  const canvasRef = React.useRef(null);
  const pdfDocRef = React.useRef(null);
  const renderTaskRef = React.useRef(null);

  // Messages d'erreur bilingues
  const errorMessages = {
    en: "The thumbnail display failed but you can open the document using the link below",
    fr: "L'affichage de la miniature a échoué mais vous pouvez ouvrir le document avec le lien ci-dessous"
  };

  const openDocumentText = {
    en: "Open the document",
    fr: "Ouvrir le document"
  };

  const pageText = {
    en: "Page",
    fr: "Page"
  };

  const ofText = {
    en: "of",
    fr: "sur"
  };

  const cancelCurrentRender = () => {
    if (renderTaskRef.current && renderTaskRef.current.cancel) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    // Annuler tout rendu en cours
    cancelCurrentRender();

    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Toujours utiliser la même échelle et forcer l'orientation
      const originalViewport = page.getViewport({ scale: 1.0 });
      const scale = Math.min(750 / originalViewport.width, 1.5);

      const viewport = page.getViewport({ 
        scale: scale,
        rotation: 0
      });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        background: 'white'
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

    } catch (error) {
      if (error.name !== 'RenderingCancelled') {
        console.error('Error rendering page:', error);
        setState(prev => ({ ...prev, error }));
      }
    }
  };

  useEffect(() => {
    const loadPDF = async () => {
      if (!documentCid) return;

      // Annuler tout rendu en cours lors du chargement d'un nouveau PDF
      cancelCurrentRender();

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const loadingTask = pdfjsLib.getDocument({
          url: `${GATEWAY}${documentCid}`,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        });

        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;

        setState(prev => ({ 
          ...prev, 
          loading: false, 
          pdfLoaded: true,
          numPages: pdf.numPages,
          error: null 
        }));

        await renderPage(1);

      } catch (error) {
        console.error('Error generating the preview - please open the document:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false,
          pdfLoaded: false,
          error 
        }));
      }
    };

    loadPDF();

    return () => {
      cancelCurrentRender();
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [documentCid]);

  const changePage = async (delta) => {
    const newPage = state.currentPage + delta;
    if (newPage >= 1 && newPage <= state.numPages) {
      setState(prev => ({ ...prev, currentPage: newPage }));
      await renderPage(newPage);
    }
  };

  // La langue doit être exactement 'en' (minuscules) pour être considérée comme anglais
  // Sinon on utilise le français par défaut
  const lang = currentLang && currentLang.toLowerCase() === 'en' ? 'en' : 'fr';

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      <div className="w-full overflow-hidden p-4">
        {state.loading && (
          <div className="flex justify-center items-center h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {state.error && !state.pdfLoaded && (
          <div className="flex flex-col justify-center items-center h-[600px]">
            <img 
              src="/assets/logos/I4TK logo.jpg"
              alt="I4TK Logo"
              className="w-48 h-48 object-contain mb-6"
            />
            <p className="text-red-500 text-center max-w-md">
              {errorMessages[lang]}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <canvas 
            ref={canvasRef}
            className="max-w-full"
            style={{ 
              display: !state.loading && state.pdfLoaded ? 'block' : 'none'
            }}
          />
        </div>
      </div>

      {state.pdfLoaded && state.numPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
          <button
            onClick={() => changePage(-1)}
            disabled={state.currentPage <= 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-600">
            {pageText[lang]} {state.currentPage} {ofText[lang]} {state.numPages}
          </span>

          <button
            onClick={() => changePage(1)}
            disabled={state.currentPage >= state.numPages}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="p-4 border-t">
        <a
          href={`${GATEWAY}${documentCid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm flex items-center group"
        >
          <ExternalLink className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
          {openDocumentText[lang]}
        </a>
      </div>
    </div>
  );
};

export default LargeDocumentViewer;