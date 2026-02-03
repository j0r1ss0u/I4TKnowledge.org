// =============== IMPORTS ===============
import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';
import { globaltoolkitService } from '../../../services/globaltoolkitService';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, ZoomIn, Download, GitFork, Edit, FileSpreadsheet, Grid3X3, Wrench } from 'lucide-react';
import DocumentValidator from "./DocumentValidator";
import DocumentViewer from './DocumentViewer';
import DocumentMetadataEditor from './DocumentMetadataEditor';
import RecoverMissingDocument from './RecoverMissingDocument';

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
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [isMigrating, setIsMigrating] = useState(false);

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

  // =============== MIGRATION FUNCTION (TEMPORARY) ===============
  const handleMigrateGeographies = async () => {
    if (!isWebAdmin) return;
    
    try {
      setIsMigrating(true);
      setMigrationStatus(null);
      const result = await documentsService.migrateAddGeographies();
      setMigrationStatus({
        success: true,
        message: `Migration complete: ${result.updated} documents updated, ${result.skipped} already had geographies.`
      });
      // Refresh documents list
      const docs = await documentsService.getDocuments();
      setDocuments(docs.filter(Boolean));
    } catch (err) {
      console.error('Migration error:', err);
      setMigrationStatus({
        success: false,
        message: 'Migration failed: ' + err.message
      });
    } finally {
      setIsMigrating(false);
    }
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
      // Utiliser le gateway IPFS officiel qui est très fiable
      window.open(`https://ipfs.io/ipfs/${cid}`, '_blank');
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
      // Mettre à jour l'URL avec le tokenId, ce qui déclenchera le changement de page
      window.location.hash = `genealogy?tokenId=${doc.tokenId}`;
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

  // =============== CSV EXPORT FUNCTION ===============
  const handleExportCSV = () => {
    try {
      // Définir les colonnes dans l'ordre exact
      const headers = [
        'Token ID',
        'Title',
        'Authors',
        'Description',
        'Programme',
        'Collection',
        'Categories',
        'Periodic Elements',
        'References',
        'IPFS CID',
        'Creator Address',
        'Created At',
        'Validation Status',
        'Transaction Hash'
      ];

      // Fonction pour extraire et formater une valeur (toujours retourner une chaîne)
      const getValue = (doc, field) => {
        switch(field) {
          case 'Token ID':
            return String(doc.tokenId || '');
          case 'Title':
            return String(doc.title || '');
          case 'Authors':
            return String(doc.authors || doc.author || '');
          case 'Description':
            return String(doc.description || '');
          case 'Programme':
            return String(doc.programme || '');
          case 'Collection':
            return String(doc.collection || '');
          case 'Categories':
            return Array.isArray(doc.categories) ? doc.categories.join(', ') : String(doc.categories || '');
          case 'Periodic Elements':
            return Array.isArray(doc.periodicElementIds) ? doc.periodicElementIds.join(', ') : String(doc.periodicElementIds || '');
          case 'References':
            return String(doc.references || '');
          case 'IPFS CID':
            return String(doc.ipfsCid || '');
          case 'Creator Address':
            return String(doc.creatorAddress || '');
          case 'Created At':
            if (!doc.createdAt) return '';
            if (doc.createdAt.seconds) {
              return new Date(doc.createdAt.seconds * 1000).toISOString();
            }
            return new Date(doc.createdAt).toISOString();
          case 'Validation Status':
            return String(doc.validationStatus || '');
          case 'Transaction Hash':
            return String(doc.transactionHash || '');
          default:
            return '';
        }
      };

      // Fonction pour échapper et encadrer une valeur CSV
      const escapeCSV = (value) => {
        const str = String(value);
        // NETTOYER TOUS les caractères de contrôle (retours à la ligne, tabulations, etc.)
        // Utiliser une regex globale pour capturer TOUS les caractères de contrôle
        const cleaned = str
          .replace(/[\r\n\t\v\f\u0085\u2028\u2029]+/g, ' ')  // Tous types de retours à la ligne et tabulations
          .replace(/\s+/g, ' ')      // Remplacer multiples espaces par un seul
          .replace(/;/g, ',')        // Remplacer tous les point-virgules par des virgules
          .trim();                    // Enlever espaces au début/fin
        // Échapper les guillemets en les doublant
        const escaped = cleaned.replace(/"/g, '""');
        // Encadrer entre guillemets
        return `"${escaped}"`;
      };

      // Créer les lignes CSV avec séparateur point-virgule (;)
      const rows = [];
      
      // Ligne d'en-tête
      rows.push(headers.map(h => escapeCSV(h)).join(';'));
      
      // Lignes de données
      documents.forEach(doc => {
        const row = headers.map(header => {
          const value = getValue(doc, header);
          return escapeCSV(value);
        });
        rows.push(row.join(';'));
      });

      // Créer le contenu avec BOM UTF-8
      const BOM = '\uFEFF';
      const csvContent = BOM + rows.join('\n');

      // Créer et télécharger le fichier CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `i4tk-library-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Exported ${documents.length} documents to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV. Please try again.');
    }
  };

  // =============== HEATMAP CSV EXPORT FUNCTION ===============
  const [exportingHeatmap, setExportingHeatmap] = useState(false);

  const handleExportHeatmapCSV = async () => {
    try {
      setExportingHeatmap(true);
      console.log('📊 Starting Heatmap CSV export...');

      const allElements = await globaltoolkitService.getAllElements();
      console.log(`📋 Found ${allElements.length} periodic elements`);

      const sortedElements = allElements.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.id.localeCompare(b.id);
      });

      const escapeCSV = (value) => {
        const str = String(value || '');
        const cleaned = str
          .replace(/[\r\n\t\v\f\u0085\u2028\u2029]+/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/;/g, ',')
          .trim();
        const escaped = cleaned.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      const metaHeaders = ['Title', 'Authors', 'Programme', 'Collection'];
      const elementHeaders = sortedElements.map(el => el.id);
      const allHeaders = [...metaHeaders, ...elementHeaders];

      const rows = [];
      rows.push(allHeaders.map(h => escapeCSV(h)).join(';'));

      documents.forEach(doc => {
        const docElementIds = Array.isArray(doc.periodicElementIds) ? doc.periodicElementIds : [];
        
        const metaValues = [
          doc.title || '',
          doc.authors || doc.author || '',
          doc.programme || '',
          doc.collection || ''
        ];

        const elementValues = sortedElements.map(el => 
          docElementIds.includes(el.id) ? 'X' : ''
        );

        const row = [...metaValues, ...elementValues].map(v => escapeCSV(v)).join(';');
        rows.push(row);
      });

      const BOM = '\uFEFF';
      const csvContent = BOM + rows.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `i4tk-heatmap-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported ${documents.length} documents to Heatmap CSV with ${sortedElements.length} element columns`);
    } catch (error) {
      console.error('Error exporting Heatmap CSV:', error);
      alert('Error exporting Heatmap CSV. Please try again.');
    } finally {
      setExportingHeatmap(false);
    }
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
      
      {/* Admin Tools & Export Buttons */}
      {isWebAdmin && (
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={() => setShowRecoverModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Wrench className="w-5 h-5" />
              Récupérer Document Manquant
            </button>
            
            {documents.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Export CSV ({documents.length})
                </button>
                <button
                  onClick={handleExportHeatmapCSV}
                  disabled={exportingHeatmap}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Grid3X3 className="w-5 h-5" />
                  {exportingHeatmap ? 'Exporting...' : 'Export Heatmap'}
                </button>
              </div>
            )}
          </div>
          
          {/* TEMPORARY: Migration button for adding geographies to existing documents */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-orange-800">Migration: Add Geographic Scope</p>
                <p className="text-xs text-orange-600">Add all geographies to documents missing this field (one-time operation)</p>
              </div>
              <button
                onClick={handleMigrateGeographies}
                disabled={isMigrating}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isMigrating ? 'Migrating...' : 'Run Migration'}
              </button>
            </div>
            {migrationStatus && (
              <div className={`mt-2 p-2 rounded text-sm ${migrationStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {migrationStatus.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recover Missing Document Modal */}
      {showRecoverModal && (
        <RecoverMissingDocument
          onClose={() => setShowRecoverModal(false)}
          onSuccess={async () => {
            const docs = await documentsService.getDocuments();
            setDocuments(docs.filter(Boolean));
          }}
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
                  {/* Bouton pour gérer les métadonnées (visible pour l'auteur et les admins) */}
                  {(isDocumentAuthor(doc) || isWebAdmin || isWeb3Admin) ? (
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