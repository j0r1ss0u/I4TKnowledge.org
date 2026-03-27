import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';
import { useAuth } from '../../AuthContext';
import ui from '../../../translations/ui.js';

const ReferencesSelector = ({ value = '', onChange }) => {
  const { language } = useAuth();
  const t = (ui[language] || ui.en);
  const [publishedDocs, setPublishedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Convertir la chaîne d'entrée en tableau de nombres pour la sélection
  const selectedRefs = value ? value.split(',').map(ref => parseInt(ref.trim())) : [];

  useEffect(() => {
    const fetchPublishedDocs = async () => {
      try {
        const docs = await documentsService.getDocumentsByStatus('PUBLISHED');
        setPublishedDocs(docs);
      } catch (err) {
        console.error('Error loading docs:', err);
        setError(t.library.errorLoadingDocs);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedDocs();
  }, []);

  const handleCheckboxChange = (tokenId) => {
    const parsedTokenId = parseInt(tokenId);
    let newSelection;

    if (selectedRefs.includes(parsedTokenId)) {
      newSelection = selectedRefs.filter(id => id !== parsedTokenId);
    } else {
      newSelection = [...selectedRefs, parsedTokenId];
    }

    const formattedString = newSelection.sort((a, b) => a - b).join(',');
    onChange(formattedString);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-gray-600">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
        {t.common.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (publishedDocs.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        {t.library.noPublishedDocs}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto px-2">
      {publishedDocs.map((doc) => (
        <label key={doc.tokenId} 
               className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200 transition-colors">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selectedRefs.includes(parseInt(doc.tokenId))}
              onChange={() => handleCheckboxChange(doc.tokenId)}
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="font-medium text-gray-900">{doc.title}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                Token #{doc.tokenId}
              </div>
            </div>
            {doc.authors && (
              <div className="mt-1 text-sm text-gray-600">
                {doc.authors}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default ReferencesSelector;