import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { projetManagementService } from '../../services/projectManagement';
import { Edit } from 'lucide-react';
import ui from '../../translations/ui';

const ProjectDetails = ({ projectId, onBack, onEdit }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user, language } = useAuth();
  const t = ui[language] ?? ui.en;
  const pd = t.projectDetails;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching project details for:', projectId);

        const projects = await projetManagementService.getProjets();
        const projectData = projects.find(p => p.id === projectId);

        if (!projectData) {
          setError(pd.projectNotFound);
          return;
        }

        const normalizedProject = {
          id: projectData.id,
          title: projectData.title || '',
          description: projectData.description || '',
          budget: projectData.budget || { amount: 0, currency: 'EUR', fundingType: 'fiat' },
          timeline: projectData.timeline || { startDate: '', endDate: '', milestones: [] },
          requiredSkills: projectData.requiredSkills || [],
          visibility: projectData.visibility || 'public',
          creator: projectData.creator || { uid: '', email: '', role: 'member' },
          status: projectData.status || { current: 'draft', lastUpdated: new Date() },
          comments: projectData.comments || {},
          createdAt: projectData.createdAt || new Date(),
          updatedAt: projectData.updatedAt || new Date()
        };

        setProject(normalizedProject);
      } catch (error) {
        console.error('Error loading project:', error);
        setError(pd.projectNotFound);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleStatusChange = async (newStatus) => {
    try {
      if (updatingStatus) return;

      setUpdatingStatus(true);
      setError(null);

      if (project.creator.uid !== user.uid) {
        setError(pd.onlyCreatorUpdate);
        return;
      }

      console.log('Updating status to:', newStatus);
      await projetManagementService.updateProjectStatus(projectId, newStatus, user.uid);

      setProject(prev => ({
        ...prev,
        status: {
          current: newStatus,
          lastUpdated: new Date()
        }
      }));

      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message || pd.onlyCreatorUpdate);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      setError(null);

      const commentData = {
        content: newComment.trim(),
        author: {
          uid: user.uid,
          email: user.email
        }
      };

      const addedComment = await projetManagementService.addComment(projectId, commentData);

      setProject(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [addedComment.id]: {
            content: addedComment.content,
            userEmail: addedComment.userEmail,
            timestamp: addedComment.timestamp
          }
        }
      }));

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(pd.projectNotFound);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{pd.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {pd.backToProjects}
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">{pd.projectNotFound}</div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {pd.backToProjects}
        </button>
      </div>
    );
  }

  const commentsArray = Object.entries(project.comments || {}).map(([id, comment]) => ({
    id,
    ...comment
  }));

  const isCreator = project.creator.uid === user.uid;
  const isAdmin = user && user.role === 'admin';
  const canEdit = isCreator || isAdmin;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="mt-2 text-sm text-gray-500">
              {pd.createdBy} {project.creator.email} • {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status.current)}`}>
              {pd.status[project.status.current] || project.status.current}
            </span>
            {isCreator && (
              <select
                value={project.status.current}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="draft">{pd.status.draft}</option>
                <option value="published">{pd.status.published}</option>
                <option value="inProgress">{pd.status.inProgress}</option>
                <option value="completed">{pd.status.completed}</option>
              </select>
            )}

            {canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                title={pd.edit}
              >
                <Edit className="h-4 w-4 mr-1" />
                {pd.edit}
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{pd.description}</h3>
          <p className="mt-2 text-gray-600">{project.description}</p>
        </div>

        {/* Budget */}
        {project.budget && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">{pd.budget}</h3>
            <div className="mt-2 text-gray-600">
              {project.budget.amount} {project.budget.currency}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {project.requiredSkills?.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">{pd.requiredSkills}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.requiredSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {pd.comments} ({commentsArray.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder={pd.commentPlaceholder}
              disabled={submittingComment}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? pd.posting : pd.postComment}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {commentsArray.length === 0 ? (
              <p className="text-center text-gray-500">{pd.noComments}</p>
            ) : (
              commentsArray.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-gray-900">
                      {comment.userEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {pd.backToProjects}
          </button>

          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {pd.editProject}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    inProgress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  };
  return colors[status] || colors.draft;
};

export default ProjectDetails;
