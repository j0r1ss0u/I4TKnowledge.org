import React, { useState, useEffect } from 'react';
import { GitFork, ArrowLeft } from 'lucide-react';
import DocumentGenealogy from './components/DocumentGenealogy';
import { documentsService } from '../../services/documentsService';

const GenealogyPage = ({ tokenId, onBack, currentLang }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');

  // Au début du composant GenealogyPage, juste après la déclaration de fonction
  console.log("GenealogyPage - Current URL:", window.location.href);
  console.log("GenealogyPage - Hash:", window.location.hash);
  console.log("GenealogyPage - Received tokenId prop:", tokenId);
  
  // Tentative d'extraction du tokenId de l'URL
  const hash = window.location.hash.slice(1);
  const parts = hash.split('?');
  if (parts.length > 1) {
    const urlParams = new URLSearchParams(parts[1]);
    const urlTokenId = urlParams.get('tokenId');
    console.log("GenealogyPage - TokenId from URL:", urlTokenId);
  }
  
  useEffect(() => {
    const fetchDocumentTitle = async () => {
      if (!tokenId) {
        setError('Token ID non fourni');
        return;
      }

      try {
        setLoading(true);
        const doc = await documentsService.getDocumentByTokenId(tokenId);
        if (doc) {
          setDocumentTitle(doc.title);
        } else {
          setError('Document non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du document:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentTitle();
  }, [tokenId]);

  if (error) {
    return (
      <div className="w-full px-4 py-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {currentLang === 'fr' 
                  ? `Erreur lors du chargement de la généalogie : ${error}`
                  : `Error loading genealogy: ${error}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header - Sticky on top */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
            <h1 className="text-xl md:text-2xl font-serif">
              {currentLang === 'en' ? 'Arbre de citations' : 'Citation tree'}
            </h1>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentLang === 'en' ? 'Retour à la bibliothèque' : 'Back to Library'}
          </button>
        </div>
      </div>

      {/* Genealogy Visualization - Full width */}
      <div className="w-full h-[50vh] md:h-[60vh] bg-white/50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <DocumentGenealogy 
            tokenId={tokenId} 
            currentLang={currentLang}
          />
        )}
      </div>

      {/* Document Details Panel - Below visualization */}
      <div className="px-4 py-4 md:px-6 md:py-6 bg-white/80">
        <div className="max-w-3xl mx-auto">
          {documentTitle && (
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-medium text-gray-900">
                {currentLang === 'fr' ? 'Détails du document' : 'Document Details'}
              </h2>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-gray-900">{documentTitle}</h3>
                {/* Add more document details here as needed */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenealogyPage;