// =================================================================
// GlobalToolkit.jsx - Partie 1/2
// Composant principal pour le tableau périodique de régulation des plateformes
// Inclut la configuration, les états et les gestionnaires d'événements
// =================================================================

import React, { useState, useEffect, useRef } from 'react';
import { globaltoolkitService } from '../../services/globaltoolkitService';
import { documentsService } from '../../services/documentsService';
import { useAuth } from '../AuthContext';
import ResolutionPath from './ResolutionPath'; // Importation du composant ResolutionPath
import { ExternalLink, Download } from 'lucide-react';

// =================================================================
// SECTION 1: CONFIGURATION DES CATÉGORIES
// =================================================================

const CATEGORIES = {
  INSTITUTIONAL: { 
    name: 'Institutional framework', 
    color: 'bg-green-100 hover:bg-green-200',
    borderColor: 'border-green-300',
    headerColor: 'bg-green-300'
  },
  LEGISLATING: { 
    name: 'Legislating platforms', 
    color: 'bg-green-100 hover:bg-green-200',
    borderColor: 'border-green-300',
    headerColor: 'bg-green-300'
  },
  HUMAN_RIGHTS: { 
    name: 'Human Rights and Rule of Law', 
    color: 'bg-red-100 hover:bg-red-200',
    borderColor: 'border-red-300',
    headerColor: 'bg-red-300'
  },
  CONTENT: { 
    name: 'Content governance', 
    color: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-300'
  },
  SYSTEMIC: { 
    name: 'Systemic risks +due diligence', 
    color: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-300'
  },
  PROSOCIAL: { 
    name: 'Pro-social design', 
    color: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-300'
  }
};

// =================================================================
// SECTION 2: COMPOSANT PRINCIPAL
// =================================================================

const Globaltoolkit = () => {
  // =================================================================
  // SECTION 3: ÉTATS (STATE HOOKS)
  // =================================================================

  // États pour les éléments et la recherche
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentCounts, setDocumentCounts] = useState({});

  // États pour l'édition des éléments
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newExample, setNewExample] = useState('');
  const [newExampleUrl, setNewExampleUrl] = useState('');
  const [newExampleTitle, setNewExampleTitle] = useState('');
  const [expandedExampleId, setExpandedExampleId] = useState(null);
  
  // États pour les documents liés
  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // État pour l'export CSV
  const [exportingCSV, setExportingCSV] = useState(false);

  // États pour le zoom et le déplacement
  const [scale, setScale] = useState(1);
  const tableContainerRef = useRef(null);
  const tablePanZoomRef = useRef(null);
  const isPanning = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const transform = useRef({ x: 0, y: 0, scale: 1 });

  // =================================================================
  // SECTION 4: AUTHENTIFICATION ET PERMISSIONS
  // =================================================================

  // Hook d'authentification
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@i4tk.org' || user.email === 'joris.galea@i4tknowledge.net');

  // =================================================================
  // SECTION 5: EFFETS (EFFECTS)
  // =================================================================

  // Chargement initial des données
  useEffect(() => {
    const fetchElements = async () => {
      try {
        setLoading(true);

        // Récupérer tous les éléments
        const fetchedElements = await globaltoolkitService.getAllElements();
        setElements(fetchedElements);
        setError(null);

        // Récupérer tous les documents pour compter les références
        try {
          const allDocuments = await documentsService.getDocuments();
          const counts = {};
          
          fetchedElements.forEach(element => {
            const count = allDocuments.filter(doc => 
              doc.periodicElementIds && doc.periodicElementIds.includes(element.id)
            ).length;
            counts[element.id] = count;
          });
          
          setDocumentCounts(counts);
          console.log('Document counts per element:', counts);
        } catch (docErr) {
          console.error("Error fetching documents for counts:", docErr);
        }
      } catch (err) {
        console.error("Error fetching toolkit elements:", err);
        setError("Failed to load toolkit elements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchElements();
  }, []);

  // Effet pour le zoom avec la molette de la souris
  useEffect(() => {
    const handleWheel = (e) => {
      if (!tableContainerRef.current || !tablePanZoomRef.current) return;

      e.preventDefault();

      // Get mouse position relative to the container
      const rect = tableContainerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate the position of the mouse relative to the content
      const contentX = mouseX - transform.current.x;
      const contentY = mouseY - transform.current.y;

      // Adjust zoom level based on wheel direction
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newScale = Math.max(0.5, Math.min(2, transform.current.scale + delta));
      const scaleFactor = newScale / transform.current.scale;

      // Calculate new transform to zoom toward mouse position
      const newX = mouseX - contentX * scaleFactor;
      const newY = mouseY - contentY * scaleFactor;

      // Update transform values
      transform.current = {
        x: newX,
        y: newY,
        scale: newScale
      };

      // Apply transform to the element
      updateTransform();

      // Update scale state for UI display
      setScale(newScale);
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  // =================================================================
  // SECTION 6: GESTIONNAIRES POUR LE ZOOM ET LE DÉPLACEMENT
  // =================================================================

  // Gestionnaire pour le début du déplacement
  const handleMouseDown = (e) => {
    // Only start panning on middle mouse button (wheel) or with Alt/Option key
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      isPanning.current = true;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      // Change cursor
      if (tableContainerRef.current) {
        tableContainerRef.current.style.cursor = 'grabbing';
      }
    }
  };

  // Gestionnaire pour le déplacement
  const handleMouseMove = (e) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMousePosition.current.x;
      const dy = e.clientY - lastMousePosition.current.y;

      transform.current.x += dx;
      transform.current.y += dy;

      updateTransform();

      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Gestionnaire pour la fin du déplacement
  const handleMouseUp = () => {
    if (isPanning.current) {
      isPanning.current = false;

      // Reset cursor
      if (tableContainerRef.current) {
        tableContainerRef.current.style.cursor = 'default';
      }
    }
  };

  // Appliquer la transformation
  const updateTransform = () => {
    if (tablePanZoomRef.current) {
      tablePanZoomRef.current.style.transform = 
        `translate(${transform.current.x}px, ${transform.current.y}px) scale(${transform.current.scale})`;
    }
  };

  // Réinitialiser la vue
  const resetView = () => {
    transform.current = { x: 0, y: 0, scale: 1 };
    updateTransform();
    setScale(1);
  };

  // Zoom avant
  const zoomIn = () => {
    const newScale = Math.min(transform.current.scale + 0.1, 2);
    transform.current.scale = newScale;
    updateTransform();
    setScale(newScale);
  };

  // Zoom arrière
  const zoomOut = () => {
    const newScale = Math.max(transform.current.scale - 0.1, 0.5);
    transform.current.scale = newScale;
    updateTransform();
    setScale(newScale);
  };

  // =================================================================
  // SECTION 7: FILTRAGE DES ÉLÉMENTS
  // =================================================================

  // Filtre les éléments en fonction de la recherche et de la catégorie
  const filteredElements = elements.filter(element => {
    const matchesSearch = 
      element.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      element.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? element.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  // =================================================================
  // SECTION 8: GESTIONNAIRES D'ÉVÉNEMENTS
  // =================================================================

  // Gestionnaire pour le clic sur un élément
  const handleElementClick = async (element) => {
    if (isPanning.current) return; // Don't select elements while panning

    console.log("Element clicked:", element);

    setSelectedElement(element);
    setEditMode(false);
    setFormData({
      id: element.id,
      name: element.name,
      category: element.category,
      description: element.description,
      context: element.context || ''
    });
    setExpandedExampleId(null);

    // Charger les documents liés à cet élément
    setLoadingDocuments(true);
    setLinkedDocuments([]);
    try {
      const docs = await documentsService.getDocumentsByPeriodicElement(element.id);
      setLinkedDocuments(docs);
      console.log(`Found ${docs.length} documents linked to element ${element.id}`);
    } catch (err) {
      console.error('Error loading linked documents:', err);
      setLinkedDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Gestionnaire pour fermer les détails d'un élément
  const handleCloseDetail = () => {
    setSelectedElement(null);
    setEditMode(false);
    setFormData({});
    setNewExample('');
    setNewExampleUrl('');
    setNewExampleTitle('');
    setExpandedExampleId(null);
  };

  // Gestionnaire pour le clic sur une catégorie
  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  // Gestionnaire pour activer/désactiver le mode édition
  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  // Gestionnaire pour les changements dans le formulaire
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =================================================================
  // SECTION 9: GESTIONNAIRES POUR L'ÉDITION DES ÉLÉMENTS
  // =================================================================

  // Gestionnaire pour sauvegarder un élément
  const handleSaveElement = async () => {
    try {
      setLoading(true);

      const updatedElement = await globaltoolkitService.updateElementInfo(
        selectedElement.id, 
        {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          context: formData.context
        }
      );

      // Mettre à jour l'élément dans la liste locale
      setElements(elements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      ));

      // Mettre à jour l'élément sélectionné
      setSelectedElement(updatedElement);
      setEditMode(false);

    } catch (err) {
      console.error("Error updating element:", err);
      setError("Failed to update element. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire pour ajouter un exemple
  const handleAddExample = async () => {
    if (!newExample.trim() || !newExampleTitle.trim()) return;

    try {
      setLoading(true);

      const exampleData = {
        title: newExampleTitle,
        text: newExample,
        url: newExampleUrl || null,
        userId: user.uid,
        userName: user.displayName || user.email,
      };

      console.log("Adding example with data:", exampleData);

      await globaltoolkitService.addElementExample(selectedElement.id, exampleData);

      // Recharger l'élément pour obtenir l'exemple mis à jour
      const updatedElement = await globaltoolkitService.getElementById(selectedElement.id);

      // Mettre à jour l'élément dans la liste locale
      setElements(elements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      ));

      // Mettre à jour l'élément sélectionné
      setSelectedElement(updatedElement);

      // Réinitialiser le formulaire
      setNewExampleTitle('');
      setNewExample('');
      setNewExampleUrl('');

    } catch (err) {
      console.error("Error adding example:", err);
      setError("Failed to add example. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire pour supprimer un exemple
  const handleDeleteExample = async (exampleId) => {
    try {
      setLoading(true);

      await globaltoolkitService.deleteElementExample(
        selectedElement.id, 
        exampleId, 
        user.uid,
        user.role
      );

      // Recharger l'élément pour obtenir la liste d'exemples mise à jour
      const updatedElement = await globaltoolkitService.getElementById(selectedElement.id);

      // Mettre à jour l'élément dans la liste locale
      setElements(elements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      ));

      // Mettre à jour l'élément sélectionné
      setSelectedElement(updatedElement);

      // Réinitialiser l'exemple développé
      setExpandedExampleId(null);

    } catch (err) {
      console.error("Error deleting example:", err);
      setError("Failed to delete example. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Vérifie si l'utilisateur peut supprimer un exemple
  const canDeleteExample = (example) => {
    // Seul l'admin ou l'auteur de l'exemple peut le supprimer
    return isAdmin || (user && example.userId === user.uid);
  };

  // Toggle l'état d'expansion d'un exemple
  const toggleExampleExpansion = (exampleId) => {
    if (expandedExampleId === exampleId) {
      setExpandedExampleId(null);
    } else {
      setExpandedExampleId(exampleId);
    }
  };

  // =================================================================
  // SECTION 9bis: EXPORT CSV
  // =================================================================

  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const exportToCSV = async () => {
    try {
      setExportingCSV(true);
      console.log('📊 Starting CSV export...');

      const allDocuments = await documentsService.getDocuments();
      console.log(`📄 Found ${allDocuments.length} documents`);

      const csvRows = [];
      csvRows.push([
        'Nom',
        'Symbole',
        'Description',
        'Context',
        'Application Examples',
        'Related Documents'
      ].join(';'));

      for (const element of elements) {
        const exampleTitles = (element.examples || [])
          .map(ex => ex.title || ex.description || '')
          .filter(t => t)
          .join(', ');

        const relatedDocs = allDocuments.filter(doc => 
          doc.periodicElementIds && doc.periodicElementIds.includes(element.id)
        );
        const relatedDocTitles = relatedDocs
          .map(doc => doc.title || '')
          .filter(t => t)
          .join(', ');

        const row = [
          escapeCSVField(element.name || ''),
          escapeCSVField(element.id || ''),
          escapeCSVField(element.description || ''),
          escapeCSVField(element.context || ''),
          escapeCSVField(exampleTitles),
          escapeCSVField(relatedDocTitles)
        ].join(';');

        csvRows.push(row);
      }

      const csvContent = '\uFEFF' + csvRows.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `periodic_table_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ CSV export completed successfully');
    } catch (err) {
      console.error('❌ CSV export error:', err);
      alert('Export failed: ' + err.message);
    } finally {
      setExportingCSV(false);
    }
  };

  // =================================================================
  // SECTION 10: ORGANISATION DES ÉLÉMENTS
  // =================================================================

  // Organisation des éléments par colonne et catégorie
  const organizeElementsByCategory = () => {
    const categoryColumns = {};

    // Initialiser les colonnes avec des arrays vides
    Object.keys(CATEGORIES).forEach(categoryKey => {
      categoryColumns[categoryKey] = [];
    });

    // Distribuer les éléments filtrés dans leurs catégories respectives
    filteredElements.forEach(element => {
      if (categoryColumns[element.category]) {
        categoryColumns[element.category].push(element);
      }
    });

    return categoryColumns;
  };

  const organizedElements = organizeElementsByCategory();

  // =================================================================
  // SECTION 11: AFFICHAGE DES ÉTATS DE CHARGEMENT ET D'ERREUR
  // =================================================================

  // Affichage pendant le chargement
  if (loading && elements.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error && elements.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // =================================================================
  // GlobalToolkit.jsx - Partie 2/2
  // Rendu du composant (JSX)
  // Cette partie contient tout le JSX pour le rendu de l'interface utilisateur
  // =================================================================

    // =================================================================
    // SECTION 12: RENDU DU COMPOSANT
    // =================================================================

    // Rendu principal du composant
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        {/* =================================================================
            SECTION 13: EN-TÊTE ET CONTRÔLES
            ================================================================= */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Periodic Table of Platform Regulation</h2>
          <p className="text-gray-700 mb-6">
            The Periodic Table of Platform Regulation is a visual tool that organizes the key elements
            of digital platform governance. Inspired by the periodic table of chemical elements,
            it allows you to explore and understand the different dimensions of platform regulation.
          </p>

          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search for an element..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Contrôles de zoom et export */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Bouton Export CSV - Admin only */}
            {isAdmin ? (
              <button
                onClick={exportToCSV}
                disabled={exportingCSV || elements.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                title="Export to CSV"
              >
                <Download className="h-4 w-4" />
                {exportingCSV ? 'Exporting...' : 'Export CSV'}
              </button>
            ) : (
              <div></div>
            )}

            {/* Contrôles de zoom */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                title="Zoom Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m-9-7v4m7-4v4M3 10h12" />
                </svg>
              </button>
              <span className="text-xs text-gray-700 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={zoomIn}
                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                title="Zoom In"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m-9-7v4m7-4v4M12 10V6m0 4v4m0-4h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={resetView}
                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                title="Reset View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-3 text-center">
            Scroll to zoom • Hold Alt/Option + drag to pan • Double-click to reset view
          </div>
        </div>

        {/* =================================================================
            SECTION 14: TABLEAU PÉRIODIQUE INTERACTIF
            ================================================================= */}
        <div 
          className="mb-8 overflow-hidden"
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={resetView}
          style={{ minHeight: '500px' }}
        >
          <div 
            ref={tablePanZoomRef}
            className="origin-center"
            style={{ 
              transformOrigin: 'center center',
              transition: 'transform 0.05s ease-out'
            }}
          >
            {/* Table content with category headers and cells */}
            <div className="grid grid-cols-6 gap-1">
              {/* Render elements by category in columns */}
              {Object.entries(CATEGORIES).map(([categoryKey, category], colIndex) => (
                <div key={categoryKey} className="flex flex-col gap-1">

                  {/* Category header */}
                  <div 
                    className={`${CATEGORIES[categoryKey].color} border ${CATEGORIES[categoryKey].borderColor} 
                               rounded-md p-3 flex flex-col items-center justify-center
                               text-center font-semibold text-sm h-20`}
                  >
                    {category.name}
                  </div>

                  {/* Elements in this category */}
                  {organizedElements[categoryKey].map((element, rowIndex) => (
                    <button
                      key={element.id}
                      onClick={() => handleElementClick(element)}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', element.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className={`${CATEGORIES[element.category].color} border ${CATEGORIES[element.category].borderColor} 
                                rounded-md p-3 flex flex-col items-center justify-center h-24 transition-transform 
                                hover:scale-105 hover:shadow-md text-center relative`}
                    >
                      <span className="font-mono text-lg font-bold mb-1">{element.id}</span>
                      <span className="text-xs line-clamp-2">{element.name}</span>
                      <span className="absolute bottom-1 left-2 text-xs font-semibold text-gray-700">
                        {documentCounts[element.id] || 0}
                      </span>
                      <span className="absolute bottom-1 right-2 text-xs font-semibold text-gray-700">
                        {element.examples?.length || 0}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =================================================================
            SECTION 15: SECTION D'INFORMATION ET RÉFÉRENCES
            ================================================================= */}
        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">About this project</h3>
          <p className="mb-4">
            This periodic table is a component of the Global Toolkit Methodology, developed to provide a framework for understanding
            digital platform governance. It is structured around six main categories that cover
            the essential aspects of platform regulation.
          </p>
          <p className="mb-4">
            This tool allows members of the I4TK network to contribute examples and references to enrich the understanding
            of each element. The goal is to create a comprehensive knowledge base that helps regulators, policy makers,
            researchers, and civil society navigate the complexity of digital platform regulation.
          </p>
          <p>
            Developed as part of the I4TKnowledge initiative, this project builds on UNESCO's guidelines
            for digital platform governance and aims to promote a human rights-based approach.
          </p>
        </div>

        {/* =================================================================
            SECTION 16: REGULATION PATHWAYS
            ================================================================= */}
        {/* Regulation Pathways section (visible pour tous les membres) */}
        {user && (
          <div className="mt-12">
            <ResolutionPath elements={elements} />
          </div>
        )}

        {/* =================================================================
            SECTION 17: MODAL POUR LES DÉTAILS D'UN ÉLÉMENT
            ================================================================= */}
        {selectedElement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* En-tête du modal */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow">
                    {editMode && isAdmin ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="text-2xl font-bold w-full p-1 border rounded mb-1"
                      />
                    ) : (
                      <h3 className="text-2xl font-bold">{selectedElement.name}</h3>
                    )}
                    <p className="text-sm text-gray-600">
                      {editMode && isAdmin ? (
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="p-1 border rounded"
                        >
                          {Object.entries(CATEGORIES).map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        CATEGORIES[selectedElement.category].name
                      )}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {isAdmin && (
                      <button
                        onClick={handleEditToggle}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {editMode ? 'Cancel' : 'Edit'}
                      </button>
                    )}

                    <button
                      onClick={handleCloseDetail}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={`w-full h-2 rounded-full ${CATEGORIES[selectedElement.category].headerColor} mb-4`}></div>

                {/* Section Description */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Description</h4>
                  {editMode && isAdmin ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded min-h-[80px]"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedElement.description}</p>
                  )}
                </div>

                {/* Section Contexte */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Context</h4>
                  {editMode && isAdmin ? (
                    <textarea
                      name="context"
                      value={formData.context}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded min-h-[80px]"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedElement.context || 'No context provided'}</p>
                  )}
                </div>

                {/* Section Exemples d'application */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Application Examples</h4>

                  {/* Liste des exemples existants */}
                  {selectedElement.examples && selectedElement.examples.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {selectedElement.examples.map((example, index) => (
                        <li key={example.id || index} className="py-3">
                          <div className="flex flex-col">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleExampleExpansion(example.id)}
                            >
                              <h5 className="font-medium">
                                {example.title || 'Example'}

                                {/* Icône pour indiquer l'expansion */}
                                <span className="inline-block ml-2 transform transition-transform">
                                  {expandedExampleId === example.id ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </span>
                              </h5>

                              {/* Bouton de suppression (admin uniquement ou auteur) */}
                              {canDeleteExample(example) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Éviter de déclencher le toggleExampleExpansion
                                    handleDeleteExample(example.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Contenu de l'exemple (visible uniquement lorsqu'il est développé) */}
                            {expandedExampleId === example.id && (
                              <div className="mt-2 pl-2 border-l-2 border-gray-200">
                                <div className="text-gray-700 mb-2">
                                  {example.text}
                                </div>

                                {example.url && (
                                  <div className="mb-2">
                                    <a 
                                      href={example.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-500 hover:underline text-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Source: {example.url}
                                    </a>
                                  </div>
                                )}

                                {example.userName && (
                                  <div className="text-xs text-gray-500">
                                    Contributed by: {example.userName}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic mb-4">No examples provided yet.</p>
                  )}

                  {/* Formulaire d'ajout de nouvel exemple (pour les utilisateurs authentifiés) */}
                  {user && (
                    <div className="mt-4 border-t pt-4">
                      <h5 className="font-medium mb-2">Add new example</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={newExampleTitle}
                            onChange={(e) => setNewExampleTitle(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Brief title for your example"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Description</label>
                          <textarea
                            value={newExample}
                            onChange={(e) => setNewExample(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows="3"
                            placeholder="Describe a real-world application example..."
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Reference URL (optional)</label>
                          <input
                            type="url"
                            value={newExampleUrl}
                            onChange={(e) => setNewExampleUrl(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="https://example.com/reference"
                          />
                        </div>
                        <button
                          onClick={handleAddExample}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                          disabled={!newExample.trim() || !newExampleTitle.trim()}
                        >
                          Add Example
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Documents liés */}
                <div className="mb-4 border-t pt-4">
                  <h4 className="font-semibold mb-2">Related Documents from Library</h4>
                  
                  {loadingDocuments ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                    </div>
                  ) : linkedDocuments && linkedDocuments.length > 0 ? (
                    <ul className="space-y-2">
                      {linkedDocuments.map((doc) => (
                        <li key={doc.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                          <ExternalLink className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <a
                              href={`/#library`}
                              className="text-blue-600 hover:underline font-medium"
                              onClick={() => {
                                window.location.hash = 'library';
                              }}
                            >
                              {doc.title}
                            </a>
                            <p className="text-xs text-gray-600 mt-1">
                              {doc.authors || doc.creatorAddress} • {doc.validationStatus}
                            </p>
                            {doc.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No documents reference this element yet.</p>
                  )}
                </div>

                {/* Bouton de sauvegarde pour le mode édition admin */}
                {editMode && isAdmin && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveElement}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =================================================================
  // SECTION 18: EXPORTATION DU COMPOSANT
  // =================================================================

  export default Globaltoolkit;