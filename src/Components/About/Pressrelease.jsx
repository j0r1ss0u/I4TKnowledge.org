// src/Components/About/Pressrelease.jsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import DocumentViewer from '../Library/components/DocumentViewer';
import LargeDocumentViewer from '../Library/components/LargeDocumentViewer';
import { ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react';

let pdfjsLib = null;
const loadPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
};

const LocalPdfViewer = ({ pdfUrl, title }) => {
  const [state, setState] = useState({ loading: true, error: null, pdfLoaded: false, currentPage: 1, numPages: 0 });
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);

  const cancelCurrentRender = () => {
    if (renderTaskRef.current && renderTaskRef.current.cancel) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    cancelCurrentRender();
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const originalViewport = page.getViewport({ scale: 1.0 });
      const scale = Math.min(750 / originalViewport.width, 1.5);
      const viewport = page.getViewport({ scale, rotation: 0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      renderTaskRef.current = page.render({ canvasContext: context, viewport, background: 'white' });
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
      if (!pdfUrl) return;
      cancelCurrentRender();
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
          cMapPacked: true
        });
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setState(prev => ({ ...prev, loading: false, pdfLoaded: true, numPages: pdf.numPages, error: null }));
        await renderPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setState(prev => ({ ...prev, loading: false, pdfLoaded: false, error }));
      }
    };
    loadPDF();
    return () => {
      cancelCurrentRender();
      if (pdfDocRef.current) { pdfDocRef.current.destroy(); pdfDocRef.current = null; }
    };
  }, [pdfUrl]);

  const changePage = async (delta) => {
    const newPage = state.currentPage + delta;
    if (newPage >= 1 && newPage <= state.numPages) {
      setState(prev => ({ ...prev, currentPage: newPage }));
      await renderPage(newPage);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      <div className="w-full overflow-hidden p-4">
        {state.loading && (
          <div className="flex justify-center items-center h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        {state.error && !state.pdfLoaded && (
          <div className="flex flex-col justify-center items-center h-[300px]">
            <p className="text-red-500 text-center max-w-md mb-4">Preview unavailable</p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              <ExternalLink className="w-4 h-4" /> Open the document
            </a>
          </div>
        )}
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="max-w-full" style={{ display: !state.loading && state.pdfLoaded ? 'block' : 'none' }} />
        </div>
      </div>
      {state.pdfLoaded && state.numPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
          <button onClick={() => changePage(-1)} disabled={state.currentPage <= 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">Page {state.currentPage} / {state.numPages}</span>
          <button onClick={() => changePage(1)} disabled={state.currentPage >= state.numPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="p-4 border-t">
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center group">
          <ExternalLink className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" /> Open the document
        </a>
      </div>
    </div>
  );
};

const PINNED_PRESS_RELEASES = [
  {
    id: 'pretoria-statement-2026',
    title: 'Contribution to the UNESCO Digital Platform Governance Conference — Pretoria Statement',
    author: 'I4T Knowledge Network',
    date: 'February 12, 2026',
    excerpt: 'Building digital platform regulatory systems through inclusion, cooperation, and trust. A shifting world order is putting international law and multilateral institutions under unprecedented strain. The I4T Global Knowledge Network proposes concrete actions to support healthy information systems and interventions in digital platform governance and regulation that are critical for the realization of democracy, protection of human rights, and social cohesion, tolerance, and peace.',
    pdfUrl: '/press-releases/I4T_kn_Pretoria_Statement_Feb_12_2026.pdf',
  },
];

const Pressrelease = () => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPressReleases = async () => {
      try {
        setIsSearching(true);
        const documentsRef = collection(db, 'web3IP');
        const q = query(documentsRef, where('categories', 'array-contains', 'Press Release'));
        const snapshot = await getDocs(q);

        const pressReleases = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          validationStatus: doc.data().validationStatus || "PENDING"
        }));

        const formattedResults = pressReleases
          .map(result => ({
            id: result.id,
            title: result.title,
            excerpt: result.description || result.excerpt,
            author: result.author || result.creatorAddress,
            ipfsCid: result.ipfsCid,
            createdAt: result.createdAt,
            date: result.createdAt 
              ? new Date(result.createdAt.seconds * 1000).toLocaleDateString()
              : new Date().toLocaleDateString()
          }))
          .sort((a, b) => {
            const dateA = a.createdAt?.seconds 
              ? new Date(a.createdAt.seconds * 1000) 
              : new Date();
            const dateB = b.createdAt?.seconds 
              ? new Date(b.createdAt.seconds * 1000) 
              : new Date();
            return dateB - dateA;
          });
        setResults(formattedResults);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error loading press releases: ' + err.message);
      } finally {
        setIsSearching(false);
      }
    };

    fetchPressReleases();
  }, []);

  const renderPinnedPressReleases = () => {
    return PINNED_PRESS_RELEASES.map((pr) => (
      <article key={pr.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-3">{pr.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>{pr.author}</span>
            <span>•</span>
            <span>{pr.date}</span>
          </div>
          <div className="flex flex-col gap-6">
            <LocalPdfViewer pdfUrl={pr.pdfUrl} title={pr.title} />
            <div className="bg-white/80 p-6 rounded-lg">
              <p className="text-gray-600">{pr.excerpt}</p>
            </div>
            <div className="flex justify-start">
              <a
                href={pr.pdfUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </article>
    ));
  };

  const renderLatestPressRelease = () => {
    const latest = results[0];
    if (!latest) return null;

    return (
      <article className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-3">{latest.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>{latest.author}</span>
            <span>•</span>
            <span>{latest.date}</span>
          </div>
          <div className="flex flex-col gap-6">
            {latest.ipfsCid && (
              <LargeDocumentViewer 
                documentCid={latest.ipfsCid.replace('ipfs://', '')} 
              />
            )}
            <div className="bg-white/80 p-6 rounded-lg">
              <p className="text-gray-600">{latest.excerpt}</p>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderOlderPressReleases = () => {
    const older = results.slice(1);
    if (older.length === 0) return null;

    return (
      <div className="grid grid-cols-1 gap-6">
        {older.map((result) => (
          <article key={result.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>{result.author}</span>
                <span>•</span>
                <span>{result.date}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="w-full md:col-span-1">
                  {result.ipfsCid && (
                    <DocumentViewer documentCid={result.ipfsCid.replace('ipfs://', '')} />
                  )}
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-600">{result.excerpt}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-serif text-2xl font-bold mb-6">Press Releases</h2>
      {error && (
        <div className="text-red-600 mb-4 text-center">{error}</div>
      )}

      {renderPinnedPressReleases()}

      {isSearching ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : results.length > 0 ? (
        <>
          {renderLatestPressRelease()}
          {renderOlderPressReleases()}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No press releases found
        </div>
      )}
    </div>
  );
};

export default Pressrelease;