import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { ipfsService } from '../../../services/ipfsService';
import { useAuth } from '../../AuthContext';
import ui from '../../../translations/ui.js';

const DocumentUpload = ({ onMetadataExtracted }) => {
  const { language } = useAuth();
  const t = (ui[language] || ui.en);
  const [uploadState, setUploadState] = useState({
    isLoading: false,
    error: null,
    progress: 0,
    step: ''
  });

  // Main file drop handler
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('Fichier reçu:', file.name, file.type, file.size);

    if (file.type !== 'application/pdf') {
      setUploadState({
        error: t.library.onlyPdf
      });
      return;
    }

    setUploadState({
      isLoading: true,
      error: null,
      progress: 0,
      step: t.library.startingUpload
    });

    try {
      // 1. Upload to IPFS
      setUploadState(prev => ({ 
        ...prev, 
        progress: 50,
        step: t.library.uploadingIpfs
      }));

      const ipfsResult = await ipfsService.uploadFile(file);
      console.log('Résultat IPFS:', ipfsResult);

      // 2. Extract title from filename
      const title = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // 3. Send metadata back to parent component
      const metadata = {
        ipfsCid: ipfsResult.cid,
        title: title
      };

      console.log('Métadonnées à insérer:', metadata);

      setUploadState(prev => ({ 
        ...prev, 
        progress: 100,
        step: t.library.finalizing
      }));

      // Envoi des métadonnées au composant parent
      if (typeof onMetadataExtracted === 'function') {
        onMetadataExtracted(metadata);
      } else {
        console.error('onMetadataExtracted n\'est pas une fonction');
        throw new Error('Erreur de configuration du composant');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        error: error.message || 'Une erreur est survenue lors du traitement'
      }));
    } finally {
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, isLoading: false }));
      }, 500);
    }
  }, [onMetadataExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024 // 100MB max
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploadState.error ? 'border-red-500 bg-red-50' : ''}
          transition-colors cursor-pointer
        `}
      >
        <input {...getInputProps()} />

        {uploadState.isLoading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-500" />
            <div className="text-sm text-gray-600">
              {uploadState.step}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {uploadState.progress}%
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className={`w-10 h-10 mx-auto ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm text-gray-600">
                {isDragActive ? t.library.dropHere : t.library.dragDrop}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t.library.pdfMaxSize}
              </p>
            </div>
          </div>
        )}

        {uploadState.error && (
          <div className="mt-4 text-sm text-red-600">
            {uploadState.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;