// ======================================================
// IMPORTS ET DÉPENDANCES
// ======================================================
import React, { useState, useEffect } from 'react';
import { withAuth } from '../AuthContext';
import ProjectList from './ProjectList';
import ProjectSubmission from './ProjectSubmission';
import ProjectDetails from './ProjectDetails';

/**
 * Fonction utilitaire qui analyse le hash URL pour extraire les paramètres
 * Retourne un objet contenant projectId et edit
 */
const parseHash = () => {
  const hash = window.location.hash;
  if (hash.includes('?')) {
    const paramString = hash.split('?')[1];
    const params = new URLSearchParams(paramString);
    return {
      projectId: params.get('project'),
      edit: params.get('edit') === 'true'
    };
  }
  return { projectId: null, edit: false };
};

/**
 * Composant ForumPage - Page principale du forum des projets
 * Gère l'affichage des différentes vues (liste, détails, nouveau projet)
 */
const ForumPage = () => {
  // ======================================================
  // GESTION DE L'ÉTAT (STATE MANAGEMENT)
  // ======================================================

  // État pour suivre la vue actuelle ('list', 'details', ou 'new')
  const [currentView, setCurrentView] = useState('list');

  // État pour stocker le projet sélectionné (null ou ID du projet)
  const [selectedProject, setSelectedProject] = useState(null);

  // État pour suivre si nous sommes en mode édition
  const [editMode, setEditMode] = useState(false);

  // ======================================================
  // HOOKS & EFFETS SECONDAIRES
  // ======================================================

  /**
   * Hook useEffect exécuté au chargement initial du composant
   * Vérifie les paramètres de l'URL, sessionStorage et localStorage
   * pour déterminer quel projet afficher et en quel mode
   */
  useEffect(() => {
    // Essayer de récupérer des paramètres depuis l'URL hash
    const hashParams = parseHash();

    // Vérifier d'abord le hash, puis le sessionStorage/localStorage
    let projectId = hashParams.projectId;
    let shouldEdit = hashParams.edit;

    // Si rien dans le hash, essayer sessionStorage en priorité, puis localStorage
    if (!projectId) {
      projectId = sessionStorage.getItem('selectedProjectId') || localStorage.getItem('selectedProjectId');
      shouldEdit = sessionStorage.getItem('editProjectMode') === 'true' || localStorage.getItem('editProjectMode') === 'true';
    }

    if (projectId) {
      console.log("Detected project ID:", projectId, "Edit mode:", shouldEdit);
      setSelectedProject(projectId);

      // Définir l'état initial en fonction du mode détection
      if (shouldEdit) {
        setEditMode(true);
        setCurrentView('new'); // ou 'edit' si vous avez une vue spécifique
      } else {
        setCurrentView('details');
      }

      // Nettoyer le storage pour éviter des comportements inattendus
      sessionStorage.removeItem('selectedProjectId');
      sessionStorage.removeItem('editProjectMode');
      localStorage.removeItem('selectedProjectId');
      localStorage.removeItem('editProjectMode');
      localStorage.removeItem('forceDetailsView');

      // Nettoyer le hash si nécessaire sans recharger la page
      if (hashParams.projectId) {
        window.history.replaceState(null, '', '#forum');
      }
    }
  }, []); // Cet effet ne s'exécute qu'une seule fois au montage

  /**
   * Hook useEffect pour écouter les changements de hash pendant la session
   * Permet la navigation directe vers un projet via l'URL
   */
  useEffect(() => {
    const handleHashChange = () => {
      const hashParams = parseHash();
      if (hashParams.projectId) {
        setSelectedProject(hashParams.projectId);

        if (hashParams.edit) {
          setEditMode(true);
          setCurrentView('new'); // ou 'edit'
        } else {
          setCurrentView('details');
        }

        // Nettoyer le hash
        window.history.replaceState(null, '', '#forum');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ======================================================
  // FONCTIONS DE RENDU CONDITIONNEL
  // ======================================================

  /**
   * Fonction qui détermine quel composant afficher en fonction de currentView
   * - 'list': Liste des projets
   * - 'new': Formulaire de création ou d'édition de projet
   * - 'details': Détails d'un projet spécifique
   */
  const renderContent = () => {
    switch (currentView) {
      case 'new':
        // Affiche le formulaire de soumission, soit pour un nouveau projet, soit pour l'édition
        return <ProjectSubmission 
          projectId={editMode ? selectedProject : null} 
          onSubmit={() => {
            setCurrentView('list');
            setEditMode(false);
          }} 
        />;

      case 'details':
        // Vérification de sécurité - retour à la liste si aucun projet n'est sélectionné
        if (!selectedProject) {
          setCurrentView('list');
          return <ProjectList 
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setCurrentView('details');
            }}
            onProjectEdit={(project) => {
              setSelectedProject(project.id);
              setEditMode(true);
              setCurrentView('new'); // Ou 'edit' si vous créez une vue spécifique
            }}
          />;
        }
        // Affiche les détails du projet sélectionné
        return (
          <ProjectDetails 
            projectId={selectedProject} 
            onBack={() => {
              setCurrentView('list');
              setSelectedProject(null);
              setEditMode(false);
            }}
            onEdit={() => {
              setEditMode(true);
              setCurrentView('new'); // Ou 'edit' si vous créez une vue spécifique
            }}
          />
        );

      case 'list':
      default:
        // Vue par défaut - liste des projets
        return (
          <ProjectList 
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setCurrentView('details');
            }}
            onProjectEdit={(project) => {
              setSelectedProject(project.id);
              setEditMode(true);
              setCurrentView('new'); // Ou 'edit' si vous créez une vue spécifique
            }}
          />
        );
    }
  };

  // ======================================================
  // RENDU DU COMPOSANT
  // ======================================================
  return (
    <div className="bg-white bg-opacity-90 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de page avec titre et bouton d'action contextuel */}
        <div className="mb-8 flex justify-between items-center">
          {/* Titre et sous-titre */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Project Marketplace
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Support and collaborate on I4TK projects
            </p>
          </div>

          {/* Bouton contextuel - change en fonction de la vue actuelle */}
          {currentView === 'list' ? (
            // Bouton "New Project" visible uniquement sur la vue liste
            <button
              onClick={() => {
                setCurrentView('new');
                setSelectedProject(null);  // Reset selectedProject
                setEditMode(false);  // S'assurer qu'on est en mode création
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              New Project
            </button>
          ) : (
            // Bouton "Back to List" visible dans les autres vues
            <button
              onClick={() => {
                setCurrentView('list');
                setSelectedProject(null);  // Reset selectedProject
                setEditMode(false);  // Reset editMode
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              Back to List
            </button>
          )}
        </div>

        {/* Contenu principal - déterminé dynamiquement par renderContent() */}
        {renderContent()}
      </div>
    </div>
  );
};

// ======================================================
// EXPORT DU COMPOSANT
// ======================================================

// Version protégée du composant (avec vérification des rôles)
export const ProtectedForumPage = withAuth(ForumPage, ['admin', 'validator', 'member']);

// Export par défaut (sans protection)
export default ForumPage;