import React, { useState, useEffect, useRef } from 'react';
import { resolutionPathService } from '../../services/resolutionPathService';
import { useAuth } from '../AuthContext';
import Draggable from 'react-draggable';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { Globe } from 'lucide-react';
import { globaltoolkitService } from '../../services/globaltoolkitService';
import ui from '../../translations/ui';


// ===============================================================
// ==================== SECTION 1: CONFIGURATION =================
// ===============================================================

// Catégories (reprises du composant Globaltoolkit)
const CATEGORIES = {
  INSTITUTIONAL: { 
    name: 'Institutional framework', 
    nameFr: 'Cadre institutionnel',
    color: 'bg-green-100 hover:bg-green-200',
    borderColor: 'border-green-300',
    headerColor: 'bg-green-300'
  },
  LEGISLATING: { 
    name: 'Legislating platforms', 
    nameFr: 'Plateformes législatives',
    color: 'bg-green-100 hover:bg-green-200',
    borderColor: 'border-green-300',
    headerColor: 'bg-green-300'
  },
  HUMAN_RIGHTS: { 
    name: 'Human Rights and Rule of Law', 
    nameFr: 'Droits humains et État de droit',
    color: 'bg-red-100 hover:bg-red-200',
    borderColor: 'border-red-300',
    headerColor: 'bg-red-300'
  },
  CONTENT: { 
    name: 'Content governance', 
    nameFr: 'Gouvernance des contenus',
    color: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-300'
  },
  SYSTEMIC: { 
    name: 'Systemic risks +due diligence', 
    nameFr: 'Risques systémiques +diligence raisonnable',
    color: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-300'
  },
  PROSOCIAL: { 
    name: 'Pro-social design', 
    nameFr: 'Conception pro-sociale',
    color: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-300'
  }
};


const ResolutionPath = ({ elements, onBack }) => {
  // ===============================================================
  // ==================== SECTION 2: STATE HOOKS ===================
  // ===============================================================

  // Liste des resolution paths
  const [resolutionPaths, setResolutionPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la fenêtre de création
  const [showCreateWindow, setShowCreateWindow] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft'
  });

  // États pour la recherche et le tri
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  // États pour la visualisation d'un path
  const [selectedPathForView, setSelectedPathForView] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [selectedElementForView, setSelectedElementForView] = useState(null);
  const [showElementModal, setShowElementModal] = useState(false);

  // États mobile
  const [isMobile, setIsMobile] = useState(false);
  const [elementSearchTerm, setElementSearchTerm] = useState('');

  // Références
  const createWindowRef = useRef(null);
  const draggedElementRef = useRef(null);

  // ===== AUTH HOOK AND LANGUAGE =====
  const { user, language: authLanguage, toggleLanguage } = useAuth();
  const [language, setLanguage] = useState(authLanguage || 'en');
  const t = (ui[language] ?? ui.en).resolutionPath;
  const cat = (ui[language] ?? ui.en).categories;
  const toolsT = (ui[language] ?? ui.en).tools;

  // Update local language when auth language changes
  useEffect(() => {
    setLanguage(authLanguage || 'en');
  }, [authLanguage]);

  // Détection mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@i4tk.org' || user.email === 'joris.galea@i4tknowledge.net');

  // ===============================================================
  // ==================== SECTION 3: EFFECTS ======================
  // ===============================================================

  // Chargement initial des paths
  useEffect(() => {
    const fetchResolutionPaths = async () => {
      try {
        setLoading(true);
        const paths = await resolutionPathService.getAllResolutionPaths();
        setResolutionPaths(paths);
        setError(null);
      } catch (err) {
        console.error("Error fetching resolution paths:", err);
        setError(t.loadingError);
      } finally {
        setLoading(false);
      }
    };

    fetchResolutionPaths();
  }, [language, t]);

  // Effet pour marquer les changements non sauvegardés
  useEffect(() => {
    if (showCreateWindow && (formData.title || formData.description || selectedElements.length > 0)) {
      setHasUnsavedChanges(true);
    }
  }, [formData, selectedElements, showCreateWindow]);

  // ===============================================================
  // ================ SECTION 4: HANDLERS - CREATION ===============
  // ===============================================================

  // Ouvre la fenêtre de création
  const handleCreatePath = () => {
    setFormData({
      title: '',
      description: '',
      status: 'draft'
    });
    setSelectedElements([]);
    setHasUnsavedChanges(false);
    setShowCreateWindow(true);
  };

  // Ferme la fenêtre de création
  const handleCloseCreateWindow = () => {
    if (hasUnsavedChanges) {
      setShowSavePrompt(true);
    } else {
      setShowCreateWindow(false);
    }
  };

  // Gère les actions du prompt de sauvegarde
  const handleSavePromptAction = (action) => {
    setShowSavePrompt(false);

    if (action === 'save') {
      handleSavePath();
    } else if (action === 'discard') {
      setShowCreateWindow(false);
      setHasUnsavedChanges(false);
    }
    // If action is 'cancel', just close the prompt and keep the window open
  };

  // Gère les changements dans le formulaire
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Sauvegarde un nouveau path ou met à jour un path existant
  const handleSavePath = async () => {
    if (!formData.title) {
      alert(t.titleRequiredAlert);
      return;
    }

    if (formData.status === 'published' && selectedElements.length === 0) {
      alert(t.elementRequiredForPublished);
      return;
    }

    try {
      setLoading(true);

      const pathData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        elements: selectedElements.map((el, index) => ({
          ...el,
          order: index
        }))
      };

      let savedPath;

      // Vérifier si on est en mode édition (si selectedElement a un ID)
      const isEditing = selectedPathForView !== null;

      if (isEditing) {
        // Mise à jour d'un chemin existant
        savedPath = await resolutionPathService.updateResolutionPath(
          selectedPathForView.id, 
          pathData
        );

        // Mettre à jour la liste locale
        setResolutionPaths(resolutionPaths.map(path => 
          path.id === savedPath.id ? savedPath : path
        ));
      } else {
        // Création d'un nouveau chemin
        pathData.creator = {
          uid: user?.uid,
          name: user?.displayName || user?.email
        };

        savedPath = await resolutionPathService.createResolutionPath(pathData);

        // Ajouter le nouveau chemin à la liste locale
        setResolutionPaths([...resolutionPaths, savedPath]);
      }

      // Réinitialiser et fermer la fenêtre
      setShowCreateWindow(false);
      setHasUnsavedChanges(false);
      setSelectedElements([]);
      setFormData({
        title: '',
        description: '',
        status: 'draft'
      });
      setSelectedPathForView(null); // Réinitialiser le chemin sélectionné

    } catch (err) {
      console.error("Error saving resolution path:", err);
      alert(t.saveError);
    } finally {
      setLoading(false);
    }
  };

  // ===============================================================
  // ============= SECTION 5: HANDLERS - DRAG & DROP ==============
  // ===============================================================

  // Commence le drag d'un élément
  const handleDragStart = (e, element) => {
    // Stocker l'élément pour récupération lors du drop
    draggedElementRef.current = element;
    // Définir les données de transfert (requis pour les navigateurs)
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Permet le drop sur la zone
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Gère le drop d'un élément
  const handleDrop = (e) => {
    e.preventDefault();

    // Récupérer l'ID de l'élément depuis les données de transfert
    const elementId = e.dataTransfer.getData('text/plain');
    if (!elementId) return;

    // Trouver l'élément complet à partir de son ID
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Vérifier si l'élément est déjà dans la liste
    const isAlreadySelected = selectedElements.some(el => el.id === element.id);
    if (isAlreadySelected) {
      alert(t.alreadySelected);
      return;
    }

    // Vérifier si on a atteint la limite de 15 éléments
    if (selectedElements.length >= 15) {
      alert(t.limitReached);
      return;
    }

    // Ajouter l'élément à la liste avec un commentaire vide
    setSelectedElements([...selectedElements, { ...element, comment: '' }]);
    draggedElementRef.current = null;
  };

  // Réorganiser les éléments dans la liste
  const moveElement = (fromIndex, toIndex) => {
    const updatedElements = [...selectedElements];
    const [movedItem] = updatedElements.splice(fromIndex, 1);
    updatedElements.splice(toIndex, 0, movedItem);
    setSelectedElements(updatedElements);
  };

  // Supprimer un élément de la liste
  const removeElement = (index) => {
    const updatedElements = [...selectedElements];
    updatedElements.splice(index, 1);
    setSelectedElements(updatedElements);
  };

  // Mettre à jour le commentaire d'un élément
  const updateElementComment = (index, comment) => {
    const updated = [...selectedElements];
    updated[index] = { ...updated[index], comment };
    setSelectedElements(updated);
  };

  // Ajouter un élément par tap (mobile)
  const handleAddElementFromPicker = (element) => {
    if (selectedElements.some(el => el.id === element.id)) { alert(t.alreadySelected); return; }
    if (selectedElements.length >= 15) { alert(t.limitReached); return; }
    setSelectedElements(prev => [...prev, { ...element, comment: '' }]);
  };

  // ===============================================================
  // ========= SECTION 6: HANDLERS - RESOLUTION PATH LIST ==========
  // ===============================================================

  // Affiche les détails d'un path
  const handleViewPath = async (pathId) => {
    try {
      setLoading(true);
      const pathDetails = await resolutionPathService.getResolutionPathById(pathId);
      setSelectedPathForView(pathDetails);
      setShowViewModal(true);
      setUserRating(0); // Réinitialiser la notation de l'utilisateur

      // Vérifier si l'utilisateur a déjà noté ce path
      if (user && pathDetails?.ratings && pathDetails.ratings[user.uid]) {
        setUserRating(pathDetails.ratings[user.uid]);
      }

    } catch (err) {
      console.error("Error fetching resolution path details:", err);
      alert(t.fetchDetailsError);
    } finally {
      setLoading(false);
    }
  };

  // Ajoute un commentaire
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setLoading(true);

      const newComment = {
        text: commentText,
        userId: user?.uid,
        userName: user?.displayName || user?.email
      };

      await resolutionPathService.addComment(selectedPathForView.id, newComment);

      // Mettre à jour les détails localement
      const updatedPath = await resolutionPathService.getResolutionPathById(selectedPathForView.id);
      setSelectedPathForView(updatedPath);

      // Mettre à jour la liste principale
      setResolutionPaths(resolutionPaths.map(path => 
        path.id === updatedPath.id ? updatedPath : path
      ));

      // Réinitialiser le formulaire
      setCommentText('');

    } catch (err) {
      console.error("Error adding comment:", err);
      alert(t.addCommentError);
    } finally {
      setLoading(false);
    }
  };

  // Ajoute une note
  const handleRatePath = async (rating) => {
    try {
      setLoading(true);

      await resolutionPathService.ratePath(selectedPathForView.id, user?.uid, rating);

      // Mettre à jour les détails localement
      const updatedPath = await resolutionPathService.getResolutionPathById(selectedPathForView.id);
      setSelectedPathForView(updatedPath);

      // Mettre à jour la liste principale
      setResolutionPaths(resolutionPaths.map(path => 
        path.id === updatedPath.id ? updatedPath : path
      ));

      setUserRating(rating);

    } catch (err) {
      console.error("Error rating path:", err);
      alert(t.ratingError);
    } finally {
      setLoading(false);
    }
  };

  // Change le tri
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Si on clique sur le même champ, on inverse la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, on change le champ et on met la direction par défaut
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Supprime un path
  const handleDeletePath = async (pathId) => {
    if (!confirm(t.deleteConfirm)) {
      return;
    }

    try {
      setLoading(true);

      await resolutionPathService.deleteResolutionPath(pathId);

      // Mettre à jour la liste locale
      setResolutionPaths(resolutionPaths.filter(path => path.id !== pathId));

      // Si c'est le path en cours de visualisation, fermer la modale
      if (selectedPathForView && selectedPathForView.id === pathId) {
        setShowViewModal(false);
        setSelectedPathForView(null);
      }

    } catch (err) {
      console.error("Error deleting resolution path:", err);
      alert(t.deleteError);
    } finally {
      setLoading(false);
    }
  };

  // Édite un path existant
  const handleEditPath = (path) => {
    if (!path) return;

    setFormData({
      title: path.title || '',
      description: path.description || '',
      status: path.status || 'draft'
    });

    // Trier les éléments par ordre
    const sortedElements = [...(path.elements || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    setSelectedElements(sortedElements);

    setShowCreateWindow(true);
    setHasUnsavedChanges(false);
  };

  // Publie un path
  const handlePublishPath = async (pathId) => {
    if (!pathId) return;

    try {
      setLoading(true);

      await resolutionPathService.updateResolutionPathStatus(pathId, 'published');

      // Mettre à jour la liste locale
      setResolutionPaths(resolutionPaths.map(path => 
        path.id === pathId ? { ...path, status: 'published' } : path
      ));

      // Si c'est le path en cours de visualisation, mettre à jour ses détails
      if (selectedPathForView && selectedPathForView.id === pathId) {
        setSelectedPathForView({ ...selectedPathForView, status: 'published' });
      }

    } catch (err) {
      console.error("Error publishing resolution path:", err);
      alert(t.publishError);
    } finally {
      setLoading(false);
    }
  };

  // Affiche les détails d'un élément avec tous ses attributs
  const handleViewElementDetails = async (element) => {
    if (!element || !element.id) return;

    try {
      setLoading(true);
      // Charger les détails complets de l'élément, incluant les exemples
      const fullElementDetails = await globaltoolkitService.getElementById(element.id);

      // Log pour debugging
      console.log("Full element details:", fullElementDetails);

      setSelectedElementForView(fullElementDetails);
      setShowElementModal(true);
    } catch (err) {
      console.error("Error fetching element details:", err);
      // Utiliser l'élément de base en cas d'erreur
      setSelectedElementForView(element);
      setShowElementModal(true);
    } finally {
      setLoading(false);
    }
  };



  // ===============================================================
  // ================ SECTION 7: FILTER & SORT ====================
  // ===============================================================

  // Filtre les paths selon les critères
  const filteredPaths = resolutionPaths.filter(path => {
    // Filtre par texte
    const matchesSearch = 
      (path.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (path.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Filtre par statut
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'mine' && path.creator?.uid === user?.uid) ||
      (filterStatus === 'published' && path.status === 'published') ||
      (filterStatus === 'draft' && path.status === 'draft' && (isAdmin || path.creator?.uid === user?.uid));

    return matchesSearch && matchesStatus;
  });

  // Tri des paths
  const sortedPaths = [...filteredPaths].sort((a, b) => {
    let valueA, valueB;

    // Déterminer les valeurs à comparer
    if (sortBy === 'createdAt') {
      valueA = new Date(a.createdAt).getTime();
      valueB = new Date(b.createdAt).getTime();
    } else if (sortBy === 'rating') {
      valueA = a.averageRating || 0;
      valueB = b.averageRating || 0;
    } else if (sortBy === 'title') {
      valueA = (a.title?.toLowerCase() || '');
      valueB = (b.title?.toLowerCase() || '');
    } else {
      valueA = a[sortBy];
      valueB = b[sortBy];
    }

    // Appliquer le tri selon la direction
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // ===============================================================
  // ================ SECTION 8: HELPER FUNCTIONS =================
  // ===============================================================

  // Calcul du nombre d'étoiles à afficher (arrondi au 0.5 près)
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    // Étoile à moitié
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    // Étoiles vides
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  // Get element details and apply language
  const getElementDetails = (elementId) => {
    const element = elements?.find(el => el.id === elementId) || { name: toolsT.unknownElement, category: 'CONTENT' };

    // If we have a category, get the appropriate name based on language
    if (element.category && CATEGORIES[element.category]) {
      const categoryDetails = CATEGORIES[element.category];
      // Apply localized category name if needed
      element.categoryName = cat[element.category] ?? categoryDetails.name;
    }

    return element;
  };

  // Affichage du loading spinner
  if (loading && resolutionPaths.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ===============================================================
  // ================ SECTION 9: RENDER COMPONENT ===================
  // ===============================================================

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-3xl font-bold">{t.title}</h2>

        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.backButton}
          </button>
        )}
      </div>

      <p className="text-gray-700 mb-6">
        {t.description}
      </p>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-1/2">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:w-1/4">
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{t.allPaths}</option>
            <option value="published">{t.publishedOnly}</option>
            <option value="mine">{t.myPaths}</option>
            {(isAdmin || user) && <option value="draft">{t.drafts}</option>}
          </select>
        </div>

        <div className="md:w-1/4 flex justify-end">
          <button
            onClick={handleCreatePath}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-md font-semibold"
            disabled={!user}
          >
            {t.newPath}
          </button>
        </div>
      </div>

      {/* Message si aucun path trouvé */}
      {filteredPaths.length === 0 && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">{t.noPathsFound}</p>
          {user && (
            <button
              onClick={handleCreatePath}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-semibold"
            >
              {t.createFirstPath}
            </button>
          )}
          {!user && (
            <p className="text-gray-500">{t.loginToCreate}</p>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* ================ SECTION 10: RESOLUTION PATHS LIST ============= */}
      {/* =============================================================== */}

      {filteredPaths.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSortChange('title')}
                >
                  {t.titleHeader} {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">{t.creatorHeader}</th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSortChange('rating')}
                >
                  {t.ratingHeader} {sortBy === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSortChange('createdAt')}
                >
                  {t.dateHeader} {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">{t.statusHeader}</th>
                <th className="px-4 py-3 text-center">{t.actionsHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPaths.map(path => (
                <tr key={path.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => handleViewPath(path.id)}>
                      {path.title}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {path.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {path.creator?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        {renderStars(path.averageRating || 0)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {path.averageRating
                          ? `${path.averageRating.toFixed(1)}/5 · ${Object.keys(path.ratings || {}).length} ${t.votes}`
                          : t.notRated}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(path.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {path.status === 'published' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {t.published}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {t.draft}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewPath(path.id)}
                        className="text-blue-500 hover:text-blue-700"
                        title={t.viewDetails}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Edit button (for owner or admin) */}
                      {(isAdmin || (user && path.creator?.uid === user?.uid)) && (
                        <button
                          onClick={() => handleEditPath(path)}
                          className="text-amber-500 hover:text-amber-700"
                          title={t.edit}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}

                      {/* Publish button (for draft, owner or admin) */}
                      {path.status === 'draft' && (isAdmin || (user && path.creator?.uid === user?.uid)) && (
                        <button
                          onClick={() => handlePublishPath(path.id)}
                          className="text-green-500 hover:text-green-700"
                          title={t.publish}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}

                      {/* Delete button (for owner or admin) */}
                      {(isAdmin || (user && path.creator?.uid === user?.uid)) && (
                        <button
                          onClick={() => handleDeletePath(path.id)}
                          className="text-red-500 hover:text-red-700"
                          title={t.delete}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =============================================================== */}
            {/* ================ SECTION 11: CREATION WINDOW ================== */}
            {/* =============================================================== */}

            {showCreateWindow && (() => {
              /* Champs communs réutilisés dans mobile et desktop */
              const formFields = (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.titleLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={t.titleLabel}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.descriptionLabel}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows="3"
                      placeholder={t.descriptionLabel}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.statusLabel}
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={handleFormChange} className="form-radio h-4 w-4 text-amber-500" />
                        <span className="ml-2 text-gray-700">{t.draft}</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="status" value="published" checked={formData.status === 'published'} onChange={handleFormChange} className="form-radio h-4 w-4 text-amber-500" />
                        <span className="ml-2 text-gray-700">{t.published}</span>
                      </label>
                    </div>
                  </div>
                </>
              );

              /* Liste des éléments sélectionnés avec commentaires (commune mobile/desktop) */
              const elementList = selectedElements.map((element, index) => (
                <div key={`${element?.id || index}-${index}`} className="bg-white rounded-md border border-gray-200 p-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2/5">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full text-xs font-bold mr-2 flex-shrink-0">{index + 1}</span>
                        <span className="text-sm font-semibold leading-tight">{element?.name || "Unknown element"}</span>
                      </div>
                      {element?.id && <div className="font-mono text-xs text-gray-500 mb-2 pl-8">{element.id}</div>}
                      <div className="flex items-center space-x-1 pl-8">
                        {index > 0 && (
                          <button onClick={() => moveElement(index, index - 1)} className="text-gray-500 hover:text-amber-600 p-1 rounded hover:bg-amber-50" title={t.moveUp}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          </button>
                        )}
                        {index < selectedElements.length - 1 && (
                          <button onClick={() => moveElement(index, index + 1)} className="text-gray-500 hover:text-amber-600 p-1 rounded hover:bg-amber-50" title={t.moveDown}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}
                        <button onClick={() => removeElement(index)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 ml-1" title={t.remove}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea value={element.comment || ''} onChange={(e) => updateElementComment(index, e.target.value)} placeholder={t.elementCommentPlaceholder} rows={3} className="w-full text-sm border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none bg-amber-50 placeholder-gray-400" />
                    </div>
                  </div>
                </div>
              ));

              /* Boutons d'action communs */
              const actionButtons = (
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={handleCloseCreateWindow} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">{t.cancel}</button>
                  <button onClick={handleSavePath} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600" disabled={!formData.title}>
                    {t.save}
                  </button>
                </div>
              );

              /* ======= MOBILE: plein écran avec sélecteur intégré ======= */
              if (isMobile) {
                return (
                  <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="bg-amber-500 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
                      <h3 className="font-semibold truncate pr-2">{formData.title ? `${t.editing}: ${formData.title}` : t.newResolutionPath}</h3>
                      <button onClick={handleCloseCreateWindow} className="text-white hover:text-gray-200 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {formFields}
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.selectedElements} ({selectedElements.length}/15)
                        </label>
                        <div className="relative mb-2">
                          <input
                            type="text"
                            value={elementSearchTerm}
                            onChange={(e) => setElementSearchTerm(e.target.value)}
                            placeholder={toolsT.searchElementPlaceholder}
                            className="w-full p-2 pl-9 border border-amber-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50"
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        {elementSearchTerm.length > 0 && (
                          <div className="border border-gray-200 rounded-md mb-3 max-h-52 overflow-y-auto shadow-sm">
                            {elements.filter(el =>
                              el.name.toLowerCase().includes(elementSearchTerm.toLowerCase()) ||
                              el.id.toLowerCase().includes(elementSearchTerm.toLowerCase())
                            ).slice(0, 20).map(el => {
                              const alreadyAdded = selectedElements.some(s => s.id === el.id);
                              return (
                                <button
                                  key={el.id}
                                  onClick={() => { handleAddElementFromPicker(el); setElementSearchTerm(''); }}
                                  disabled={alreadyAdded}
                                  className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 flex items-center gap-2 ${alreadyAdded ? 'bg-gray-50 text-gray-400 cursor-default' : 'hover:bg-amber-50 active:bg-amber-100'}`}
                                >
                                  <span className="font-mono font-bold text-gray-500 w-12 flex-shrink-0">{el.id}</span>
                                  <span className="flex-1 leading-tight">{el.name}</span>
                                  {alreadyAdded ? <span className="text-green-500 text-xs font-bold">✓</span> : <span className="text-amber-500 font-bold">+</span>}
                                </button>
                              );
                            })}
                            {elements.filter(el =>
                              el.name.toLowerCase().includes(elementSearchTerm.toLowerCase()) ||
                              el.id.toLowerCase().includes(elementSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <p className="px-3 py-4 text-sm text-gray-400 text-center">
                                {toolsT.noElementFound}
                              </p>
                            )}
                          </div>
                        )}
                        {elementSearchTerm.length === 0 && selectedElements.length === 0 && (
                          <p className="text-sm text-gray-400 italic mb-3">
                            {toolsT.searchHint}
                          </p>
                        )}
                        <div className="space-y-2">{elementList}</div>
                        <p className="text-xs text-gray-500 mt-1">{t.tip}</p>
                      </div>
                      {actionButtons}
                    </div>
                  </div>
                );
              }

              /* ======= DESKTOP: panneau draggable ======= */
              return (
                <Draggable handle=".handle" bounds="parent">
                  <div
                    ref={createWindowRef}
                    className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-300"
                    style={{ top: '50px', left: '50%', transform: 'translateX(-50%)', width: 'min(90vw, 760px)', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
                  >
                    <div className="handle bg-amber-500 text-white px-4 py-3 rounded-t-lg flex justify-between items-center cursor-move">
                      <h3 className="font-semibold">{formData.title ? `${t.editing}: ${formData.title}` : t.newResolutionPath}</h3>
                      <button onClick={handleCloseCreateWindow} className="text-white hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="p-4">
                      {formFields}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectedElements} ({selectedElements.length}/15)</label>
                        <div className="border-2 border-dashed border-amber-300 rounded-lg p-3 bg-amber-50 min-h-[100px]" onDrop={handleDrop} onDragOver={handleDragOver}>
                          {selectedElements.length === 0 ? (
                            <p className="text-gray-500 text-center py-6">{t.dragElements}</p>
                          ) : (
                            <div className="space-y-2">{elementList}</div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t.tip}</p>
                      </div>
                      {actionButtons}
                    </div>
                  </div>
                </Draggable>
              );
            })()}

            {/* =============================================================== */}
            {/* ================ SECTION 12: MODALS ========================== */}
            {/* =============================================================== */}

            {/* Dialogue de confirmation pour sauvegarder */}
            {showSavePrompt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
                  <h3 className="text-xl font-bold mb-4">{t.saveChanges}</h3>
                  <p className="mb-6">
                    {t.savePromptMessage}
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleSavePromptAction('cancel')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => handleSavePromptAction('discard')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      {t.dontSave}
                    </button>
                    <button
                      onClick={() => handleSavePromptAction('save')}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modale de visualisation d'un Resolution Path */}
            {showViewModal && selectedPathForView && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedPathForView.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span>{t.by} {selectedPathForView.creator?.name || "Unknown"}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(selectedPathForView.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        {selectedPathForView.status === 'published' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                            {t.published}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {t.draft}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Description */}
                  {selectedPathForView.description && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">{t.descriptionLabel}</h4>
                      <p className="text-gray-700">{selectedPathForView.description}</p>
                    </div>
                  )}

                  {/* Séquence d'éléments — colonne avec commentaires */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">{t.sequence}</h4>
                    <div className="space-y-3">
                      {(selectedPathForView.elements || [])
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((element, index) => {
                          const elementDetails = getElementDetails(element?.id);
                          const categoryColors = CATEGORIES[elementDetails?.category] || {};
                          return (
                            <div
                              key={`${element?.id || index}-${index}`}
                              className={`flex gap-4 border rounded-lg overflow-hidden ${categoryColors.borderColor || 'border-gray-300'}`}
                            >
                              {/* Bande de couleur + numéro */}
                              <div className={`flex-shrink-0 w-12 flex flex-col items-center justify-center py-3 ${categoryColors.headerColor || 'bg-gray-200'}`}>
                                <span className="w-7 h-7 flex items-center justify-center bg-white bg-opacity-80 rounded-full text-xs font-bold text-gray-800">
                                  {index + 1}
                                </span>
                              </div>
                              {/* Contenu élément */}
                              <div
                                className="flex-1 py-3 pr-3 cursor-pointer"
                                onClick={() => {
                                  const fullElement = elements.find(el => el.id === element?.id);
                                  handleViewElementDetails(fullElement || elementDetails);
                                }}
                              >
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="font-mono text-sm font-bold text-gray-500">{elementDetails?.id}</span>
                                  <span className="font-semibold text-gray-900">{elementDetails?.name || "Unknown element"}</span>
                                </div>
                                <span className="text-xs text-gray-500">{elementDetails?.categoryName || categoryColors.name}</span>
                              </div>
                              {/* Commentaire de l'auteur */}
                              {element?.comment && (
                                <div className="flex-1 border-l border-dashed border-gray-200 py-3 px-4 bg-amber-50">
                                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                                    {toolsT.justification}
                                  </p>
                                  <p className="text-sm text-gray-700 italic">"{element.comment}"</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Section de notation et commentaires — visible pour tous sur pathway publié */}
                  {selectedPathForView.status === 'published' && (
                    <div className="mb-6 border-t border-b py-4">
                      <h4 className="text-lg font-semibold mb-3">{t.ratingHeader} & {t.comments}</h4>

                      {/* Note moyenne — toujours visible */}
                      {selectedPathForView.averageRating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">{renderStars(selectedPathForView.averageRating)}</div>
                          <span className="text-sm text-gray-600 font-medium">
                            {selectedPathForView.averageRating.toFixed(1)}/5
                          </span>
                          <span className="text-sm text-gray-400">
                            ({Object.keys(selectedPathForView.ratings || {}).length} {t.votes})
                          </span>
                        </div>
                      )}

                      {user ? (
                        <>
                          {/* Étoiles pour noter */}
                          <div className="flex items-center gap-2 mb-4">
                            <p className="text-sm text-gray-700">{t.rating}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => handleRatePath(star)}
                                  className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                                >
                                  {userRating >= star ? (
                                    <FaStar className="text-yellow-400" />
                                  ) : (
                                    <FaRegStar className="text-yellow-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                            {userRating > 0 && (
                              <span className="text-sm text-gray-500">({userRating}/5)</span>
                            )}
                          </div>

                          {/* Ajout de commentaire */}
                          <div>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              rows="2"
                              placeholder={t.addComment}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={handleAddComment}
                                className="px-4 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm"
                                disabled={!commentText.trim()}
                              >
                                {t.commentButton}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">{t.loginToRate}</p>
                      )}
                    </div>
                  )}

                  {/* Liste des commentaires */}
                  {selectedPathForView.comments && selectedPathForView.comments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">
                        {t.comments} ({selectedPathForView.comments.length})
                      </h4>
                      <ul className="space-y-4">
                        {selectedPathForView.comments.map((comment, index) => (
                          <li key={index} className="border-b pb-3">
                            <div className="flex justify-between">
                              <span className="font-medium">{comment?.userName || "Unknown"}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment?.createdAt || Date.now()).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-700">{comment?.text || ""}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-end mt-4 space-x-3">
                    {(isAdmin || (user && selectedPathForView.creator?.uid === user?.uid)) && (
                      <>
                        <button
                          onClick={() => handleEditPath(selectedPathForView)}
                          className="px-4 py-2 border border-amber-500 text-amber-500 rounded-md hover:bg-amber-50"
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => {
                            handleDeletePath(selectedPathForView.id);
                            setShowViewModal(false);
                          }}
                          className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                        >
                          {t.delete}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              </div>
            )}
      {/* Modal pour afficher les détails d'un élément - à ajouter à la fin du composant, avec les autres modals */}
      {showElementModal && selectedElementForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête du modal */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedElementForView.name}</h3>
                  <p className="text-sm text-gray-600">
                    {CATEGORIES[selectedElementForView.category]?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowElementModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={`w-full h-2 rounded-full ${CATEGORIES[selectedElementForView.category]?.headerColor || 'bg-gray-300'} mb-4`}></div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedElementForView.description || 'No description available'}</p>
              </div>

              {/* Contexte */}
              {selectedElementForView.context && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Context</h4>
                  <p className="text-gray-700">{selectedElementForView.context}</p>
                </div>
              )}

              {/* Exemples, si disponibles */}
              {selectedElementForView.examples && selectedElementForView.examples.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Examples</h4>
                  <ul className="divide-y divide-gray-200">
                    {selectedElementForView.examples.map((example, index) => (
                      <li key={index} className="py-2">
                        <h5 className="font-medium">{example.title || 'Example'}</h5>
                        <p className="text-gray-700 text-sm mt-1">{example.text}</p>
                        {example.url && (
                          <a 
                            href={example.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                          >
                            Source: {example.url}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowElementModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        );
      };

      // ===============================================================
      // ================ SECTION 13: EXPORT ========================== 
      // ===============================================================

      export default ResolutionPath;