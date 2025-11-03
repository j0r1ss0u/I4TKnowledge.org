// =============== IMPORTS ===============
import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, ZoomIn, Download, GitFork, Edit } from 'lucide-react';
import DocumentValidator from "./DocumentValidator";
import DocumentViewer from './DocumentViewer';
import DocumentMetadataEditor from './DocumentMetadataEditor';

// =============== CONSTANTS ===============
const ValidationStatus = {
  PENDING: '0/4',
  VALIDATION_1: '1/4',
  VALIDATION_2: '2/4',
  VALIDATION_3: '3/4',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

// =============== MAIN COMPONENT ===============
const NetworkPublications = ({ 
  isWeb3Validator, 
  isWeb3Admin, 
  isWebMember, 
  isWebAdmin, 
  address,
  searchTerm,
  searchResults,
  isSearching,
  error: searchError,
  handlePageChange,
  setSelectedTokenId
}) => {

  // =============== STATES ===============
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);

  // =============== DATA LOADING ===============
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const docs = await documentsService.getDocuments();
        console.log("Documents chargés:", docs);
        setDocuments(docs.filter(Boolean));
      } catch (err) {
        console.error("Erreur chargement documents:", err);
        setError('Erreur lors du chargement des documents: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, [isWebMember, isWebAdmin]);

  // =============== AUTHORIZATION FUNCTIONS ===============
  const canViewDocument = (doc) => {
    const status = doc.validationStatus;
    const isPublished = status === ValidationStatus.PUBLISHED;
    return !doc ? false : isWebMember ? true : isPublished;
  };

  const canViewStatus = () => isWebMember;

  const canValidate = (doc) => {
    if (!doc || !isWebMember || (!isWeb3Validator && !isWeb3Admin)) return false;
    if (doc.creatorAddress === address) return false;
    if (doc.validators?.includes(address)) return false;
    return doc.validationStatus !== ValidationStatus.PUBLISHED;
  };

  // =============== UTILITY FUNCTIONS ===============
  const getDocumentCid = (doc) => {
    if (!doc || !doc.ipfsCid) return null;
    let cid = doc.ipfsCid;
    if (cid.startsWith('ipfs://')) {
      cid = cid.replace('ipfs://', '');
    }
    cid = cid.trim();
    return cid.match(/^[a-zA-Z0-9]{46,62}$/) ? cid : null;
  };

  const handleViewDetails = (doc) => {
    const cid = getDocumentCid(doc);
    if (cid) {
      window.open(`https://nftstorage.link/ipfs/${cid}`, '_blank');
    } else {
      console.error('Invalid or missing IPFS CID:', doc);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  // =============== UI HELPERS ===============
  const getStatusBadge = (status) => {
    const badges = {
      [ValidationStatus.PENDING]: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Pending"
      },
      [ValidationStatus.PUBLISHED]: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
        text: "Published"
      },
      [ValidationStatus.FAILED]: {
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        text: "Failed"
      }
    };

    const badge = badges[status] || badges[ValidationStatus.PENDING];

    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <badge.icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  // =============== NAVIGATION HANDLERS ===============
  const handleViewGenealogy = (doc) => {
    if (doc && doc.tokenId) {
      handlePageChange("genealogy");
      setSelectedTokenId(doc.tokenId);
    }
  };

  // =============== METADATA EDITOR HANDLERS ===============
  const handleEditMetadata = (doc) => {
    setEditingDocument(doc);
  };

  const handleCloseEditor = () => {
    setEditingDocument(null);
  };

  const handleSaveMetadata = async () => {
    const loadDocuments = async () => {
      try {
        const docs = await documentsService.getDocuments();
        setDocuments(docs.filter(Boolean));
      } catch (err) {
        console.error("Error reloading documents:", err);
      }
    };
    await loadDocuments();
    setEditingDocument(null);
  };

  const isDocumentAuthor = (doc) => {
    return address && doc.creatorAddress && 
           address.toLowerCase() === doc.creatorAddress.toLowerCase();
  };

  // =============== DOCUMENTS DISPLAY LOGIC ===============
  if (loading || isSearching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || searchError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h4 className="font-semibold">Erreur</h4>
        <p>{error || searchError}</p>
      </div>
    );
  }

  const displayedDocuments = searchTerm 
    ? searchResults.map(result => ({
        ...result,
        validationStatus: result.validationStatus || result.status || ValidationStatus.PENDING,
        excerpt: result.description || result.excerpt,
        author: result.author || result.creatorAddress
      })).filter(canViewDocument)
    : documents.filter(canViewDocument);

  if (!displayedDocuments || displayedDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No document found</h3>
        <p className="mt-2 text-sm text-gray-500">
          {searchTerm ? "No result for this search." : "Les documents apparaîtront ici une fois soumis."}
        </p>
      </div>
    );
  }

  // =============== MAIN RENDER ===============
  return (
    <>
      {editingDocument && (
        <DocumentMetadataEditor
          document={editingDocument}
          onClose={handleCloseEditor}
          onSave={handleSaveMetadata}
        />
      )}
      <div className="grid grid-cols-1 gap-6">
        {displayedDocuments.map((doc) => {
        if (!doc) return null;
        const documentCid = getDocumentCid(doc);

        return (
          <article key={doc.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* En-tête avec titre et statut */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-serif font-bold text-gray-900">{doc.title}</h3>
                {canViewStatus() && getStatusBadge(doc.validationStatus)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>{doc.author || doc.authors || doc.creatorAddress || 'Auteur inconnu'}</span>
                <span className="mx-2">•</span>
                <span>Créé le: {formatDate(doc.createdAt)}</span>
              </div>
            </div>

            {/* Contenu principal avec grille responsive */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {/* Miniature (1/4 sur desktop, pleine largeur sur mobile) */}
              <div className="w-full md:col-span-1">
                {documentCid && (
                  <div className="border rounded-lg overflow-hidden">
                    <DocumentViewer documentCid={documentCid} />
                  </div>
                )}
              </div>

              {/* Contenu (3/4 sur desktop, pleine largeur sur mobile) */}
              <div className="md:col-span-3">
                <div className="prose prose-sm max-w-none mb-4">
                  <p>{doc.description || doc.excerpt || 'Pas de description disponible'}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  {/* Bouton pour gérer les métadonnées (visible uniquement pour l'auteur) */}
                  {isDocumentAuthor(doc) ? (
                    <button
                      onClick={() => handleEditMetadata(doc)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors bg-amber-100 text-amber-700 hover:bg-amber-200"
                    >
                      <Edit className="w-4 h-4" />
                      Manage metadata
                    </button>
                  ) : null}
                  
                  {/* Nouveau bouton pour la généalogie */}
                  {isWebAdmin || isWeb3Admin ? (
                    <button
                      onClick={() => handleViewGenealogy(doc)}
                      disabled={!doc.tokenId}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        doc.tokenId
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <GitFork className="w-4 h-4" />
                      Document Genealogy
                    </button>
                  ) : null}
                </div>

                {/* Validation si autorisé */}
                {canValidate(doc) && (
                  <div className="mt-4">
                    <DocumentValidator
                      document={doc}
                      documentsService={documentsService}
                    />
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
      </div>
    </>
  );
};

export default NetworkPublications;