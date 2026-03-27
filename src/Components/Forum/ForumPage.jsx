// ======================================================
// IMPORTS ET DÉPENDANCES
// ======================================================
import React, { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../AuthContext';
import ui from '../../translations/ui.js';
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

  const [currentView, setCurrentView] = useState('list');
  const [selectedProject, setSelectedProject] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { language } = useAuth();
  const t = (ui[language] || ui.en).forum;

  // ======================================================
  // HOOKS & EFFETS SECONDAIRES
  // ======================================================

  useEffect(() => {
    const hashParams = parseHash();

    let projectId = hashParams.projectId;
    let shouldEdit = hashParams.edit;

    if (!projectId) {
      projectId = sessionStorage.getItem('selectedProjectId') || localStorage.getItem('selectedProjectId');
      shouldEdit = sessionStorage.getItem('editProjectMode') === 'true' || localStorage.getItem('editProjectMode') === 'true';
    }

    if (projectId) {
      console.log("Detected project ID:", projectId, "Edit mode:", shouldEdit);
      setSelectedProject(projectId);

      if (shouldEdit) {
        setEditMode(true);
        setCurrentView('new');
      } else {
        setCurrentView('details');
      }

      sessionStorage.removeItem('selectedProjectId');
      sessionStorage.removeItem('editProjectMode');
      localStorage.removeItem('selectedProjectId');
      localStorage.removeItem('editProjectMode');
      localStorage.removeItem('forceDetailsView');

      if (hashParams.projectId) {
        window.history.replaceState(null, '', '#forum');
      }
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hashParams = parseHash();
      if (hashParams.projectId) {
        setSelectedProject(hashParams.projectId);

        if (hashParams.edit) {
          setEditMode(true);
          setCurrentView('new');
        } else {
          setCurrentView('details');
        }

        window.history.replaceState(null, '', '#forum');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ======================================================
  // FONCTIONS DE RENDU CONDITIONNEL
  // ======================================================

  const renderContent = () => {
    switch (currentView) {
      case 'new':
        return <ProjectSubmission 
          projectId={editMode ? selectedProject : null} 
          onSubmit={() => {
            setCurrentView('list');
            setEditMode(false);
          }} 
        />;

      case 'details':
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
              setCurrentView('new');
            }}
          />;
        }
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
              setCurrentView('new');
            }}
          />
        );

      case 'list':
      default:
        return (
          <ProjectList 
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setCurrentView('details');
            }}
            onProjectEdit={(project) => {
              setSelectedProject(project.id);
              setEditMode(true);
              setCurrentView('new');
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              {t.pageTitle}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              {t.subtitle}
            </p>
          </div>

          {currentView === 'list' ? (
            <button
              onClick={() => {
                setCurrentView('new');
                setSelectedProject(null);
                setEditMode(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {t.newProject}
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentView('list');
                setSelectedProject(null);
                setEditMode(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              {t.backToList}
            </button>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

// ======================================================
// EXPORT DU COMPOSANT
// ======================================================

export const ProtectedForumPage = withAuth(ForumPage, ['admin', 'validator', 'member']);

export default ForumPage;
