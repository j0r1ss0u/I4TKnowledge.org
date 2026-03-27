import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { projetManagementService } from '../../services/projectManagement';
import { projectNotificationService } from '../../services/projectNotificationService';
import { torService } from '../../services/torService';
import { motion } from 'framer-motion';
import ui from '../../translations/ui';

const ProjectSubmission = ({ projectId, onSubmit }) => {
  const { user, language } = useAuth();
  const p = (ui[language] ?? ui.en).projectSubmission;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: [''],
    budget: {
      amount: '',
      currency: 'EUR',
      fundingType: 'fiat',
    },
    timeline: {
      startDate: '',
      endDate: '',
      milestones: [{ title: '', date: '', description: '' }]
    },
    requiredSkills: [''],
    visibility: 'members'
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        setError(null);

        const projects = await projetManagementService.getProjets();
        const projectToEdit = projects.find(pr => pr.id === projectId);

        if (!projectToEdit) {
          throw new Error('Project not found');
        }

        const normalizedProject = {
          title: projectToEdit.title || '',
          description: projectToEdit.description || '',
          objectives: projectToEdit.objectives || [''],
          budget: {
            amount: projectToEdit.budget?.amount || '',
            currency: projectToEdit.budget?.currency || 'EUR',
            fundingType: projectToEdit.budget?.fundingType || 'fiat',
          },
          timeline: {
            startDate: projectToEdit.timeline?.startDate || '',
            endDate: projectToEdit.timeline?.endDate || '',
            milestones: projectToEdit.timeline?.milestones && projectToEdit.timeline.milestones.length > 0 
              ? projectToEdit.timeline.milestones 
              : [{ title: '', date: '', description: '' }]
          },
          requiredSkills: projectToEdit.requiredSkills?.length > 0 
            ? projectToEdit.requiredSkills 
            : [''],
          visibility: projectToEdit.visibility || 'members',
          status: projectToEdit.status || { current: 'draft' }
        };

        setFormData(normalizedProject);
        setIsEditMode(true);
      } catch (err) {
        console.error('Error loading project for edit:', err);
        setError(p.loadError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const projectData = {
        ...formData,
        creator: {
          uid: user.uid,
          email: user.email,
          role: user.role
        }
      };

      if (isEditMode) {
        await projetManagementService.updateProjet(projectId, projectData);
      } else {
        const newProject = await projetManagementService.ajouterProjet(projectData);

        try {
          if (newProject && newProject.id) {
            await projectNotificationService.notifyNewProject({
              ...projectData,
              id: newProject.id
            });
          }
        } catch (notifError) {
          console.error('Error sending notifications:', notifError);
        }
      }

      onSubmit();
    } catch (error) {
      console.error('Error in project submission:', error);
      setError(isEditMode ? p.updateError : p.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillAdd = () => {
    setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, ''] });
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.requiredSkills];
    newSkills[index] = value;
    setFormData({ ...formData, requiredSkills: newSkills });
  };

  const handleSkillRemove = (index) => {
    setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter((_, i) => i !== index) });
  };

  const handleMilestoneAdd = () => {
    setFormData({
      ...formData,
      timeline: {
        ...formData.timeline,
        milestones: [...formData.timeline.milestones, { title: '', date: '', description: '' }]
      }
    });
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...formData.timeline.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData({ ...formData, timeline: { ...formData.timeline, milestones: newMilestones } });
  };

  const handleMilestoneRemove = (index) => {
    setFormData({
      ...formData,
      timeline: {
        ...formData.timeline,
        milestones: formData.timeline.milestones.filter((_, i) => i !== index)
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{p.loadingData}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? p.editTitle : p.createTitle}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode ? p.editSubtitle : p.createSubtitle}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section aria-labelledby="section-basic-info">
          <div className="border-b border-gray-200 mb-4">
            <h3 id="section-basic-info" className="text-lg font-semibold text-gray-900">{p.sections.basicInfo}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{p.fields.title}</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{p.fields.description}</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Budget */}
        <section aria-labelledby="section-budget">
          <div className="border-b border-gray-200 mb-4">
            <h3 id="section-budget" className="text-lg font-semibold text-gray-900">{p.sections.budget}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{p.fields.budgetAmount}</label>
              <input
                type="number"
                value={formData.budget.amount}
                onChange={e => setFormData({ ...formData, budget: { ...formData.budget, amount: e.target.value } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{p.fields.currency}</label>
              <select
                value={formData.budget.currency}
                onChange={e => setFormData({ ...formData, budget: { ...formData.budget, currency: e.target.value } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section aria-labelledby="section-timeline">
          <div className="border-b border-gray-200 mb-4">
            <h3 id="section-timeline" className="text-lg font-semibold text-gray-900">{p.sections.timeline}</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{p.fields.startDate}</label>
                <input
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={e => setFormData({ ...formData, timeline: { ...formData.timeline, startDate: e.target.value } })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{p.fields.endDate}</label>
                <input
                  type="date"
                  value={formData.timeline.endDate}
                  onChange={e => setFormData({ ...formData, timeline: { ...formData.timeline, endDate: e.target.value } })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{p.fields.milestones}</label>
              {formData.timeline.milestones.map((milestone, index) => (
                <motion.div 
                  key={index}
                  layout
                  className="mb-4 p-4 border rounded-md bg-gray-50"
                >
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={e => handleMilestoneChange(index, 'title', e.target.value)}
                      placeholder={p.placeholders.milestoneTitle}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={milestone.date}
                      onChange={e => handleMilestoneChange(index, 'date', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    value={milestone.description}
                    onChange={e => handleMilestoneChange(index, 'description', e.target.value)}
                    placeholder={p.placeholders.milestoneDesc}
                    rows={2}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMilestoneRemove(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      {p.removeMilestone}
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={handleMilestoneAdd}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {p.addMilestone}
              </button>
            </div>
          </div>
        </section>

        {/* Required Skills */}
        <section aria-labelledby="section-skills">
          <div className="border-b border-gray-200 mb-4">
            <h3 id="section-skills" className="text-lg font-semibold text-gray-900">{p.sections.skills}</h3>
          </div>
          <div className="space-y-2">
            {formData.requiredSkills.map((skill, index) => (
              <motion.div key={index} layout className="flex space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={e => handleSkillChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={p.placeholders.skill}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(index)}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                  >
                    {p.removeSkill}
                  </button>
                )}
              </motion.div>
            ))}
            <button
              type="button"
              onClick={handleSkillAdd}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {p.addSkill}
            </button>
          </div>
        </section>

        {/* Submit */}
        <section className="border-t border-gray-200 pt-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onSubmit()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              {p.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting 
                ? (isEditMode ? p.updating : p.creating)
                : (isEditMode ? p.updateProject : p.createProject)}
            </button>
          </div>
        </section>
      </form>
    </motion.div>
  );
};

export default ProjectSubmission;
