import React, { useState, useEffect } from 'react';
import { projetManagementService } from '../../services/projectManagement';
import { useAuth } from '../AuthContext';
import { Trash2, Edit } from 'lucide-react';
import ui from '../../translations/ui';

const ProjectCard = ({ project, onClick, onDelete, onEdit, t }) => {
  const { user } = useAuth();

  const isCreatorOrAdmin = user && (
    user.role === 'admin' || 
    user.email === project.creator?.email
  );

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(t.forum.deleteConfirm)) {
      onDelete(project.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(project);
  };

  if (!project) {
    console.log('ProjectCard: No project data received');
    return null;
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      inProgress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status?.current)}`}>
            {project.status?.current || 'draft'}
          </span>

          {isCreatorOrAdmin && (
            <button
              onClick={handleEdit}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title={t.common.edit}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{project.description}</p>

      <div className="mt-4">
        {project.budget && (
          <div className="text-sm text-gray-500">
            {t.forum.card.budget} {project.budget.amount} {project.budget.currency}
          </div>
        )}
        {project.requiredSkills && (
          <div className="text-sm text-gray-500">
            {t.forum.card.requiredSkills} {project.requiredSkills.join(', ')}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2">
          {t.forum.card.createdBy} {project.creator?.email}       
        </div>
      </div>
    </div>
  );
};

const ProjectList = ({ onProjectSelect, onProjectEdit }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const { user, language } = useAuth();
  const t = ui[language] ?? ui.en;

  const handleDeleteProject = async (projectId) => {
    try {
      await projetManagementService.supprimerProjet(projectId);
      const updatedProjects = await projetManagementService.getProjets();
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(t.forum.deleteError);
    }
  };

  const handleEditProject = (project) => {
    if (onProjectEdit) {
      onProjectEdit(project);
    } else {
      window.location.hash = `forum?project=${project.id}&edit=true`;
      sessionStorage.setItem('selectedProjectId', project.id);
      sessionStorage.setItem('editProjectMode', 'true');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('ProjectList: Starting fetch');
        let projectsData;

        if (filter === 'all') {
          console.log('ProjectList: Fetching all projects');
          projectsData = await projetManagementService.getProjets();
        } else {
          console.log('ProjectList: Fetching filtered projects:', filter);
          projectsData = await projetManagementService.getProjetsByStatus(filter);
        }

        console.log('ProjectList: Received data:', projectsData);
        setProjects(projectsData || []);
        console.log('ProjectList: State updated with:', projectsData);
      } catch (error) {
        console.error('ProjectList: Error fetching projects:', error);
        setError(t.forum.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filter]);

  console.log('ProjectList: Current projects state:', projects);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">{t.forum.filter.all}</option>
          <option value="draft">{t.forum.filter.draft}</option>
          <option value="published">{t.forum.filter.published}</option>
          <option value="inProgress">{t.forum.filter.inProgress}</option>
          <option value="completed">{t.forum.filter.completed}</option>
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t.forum.noProjects}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onClick={() => onProjectSelect(project.id)}
              onDelete={handleDeleteProject}
              onEdit={() => handleEditProject(project)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
