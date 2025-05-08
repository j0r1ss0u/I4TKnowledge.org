import React, { useState, useEffect } from 'react';
import { Edit, X, Plus, Trash2, Mail, Linkedin } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useMembers } from './MembersContext';
import { governanceService } from '../../services/governanceService';
import { Alert } from '@/components/ui/alert';

// ... [Garder les types GOVERNANCE_TYPES et le composant EditForm inchangés]

const GovernanceView = () => {
  const { user } = useAuth();
  const { members } = useMembers();
  const [governanceData, setGovernanceData] = useState({
    [GOVERNANCE_TYPES.PRESIDENCY]: [],
    [GOVERNANCE_TYPES.STEERING]: [],
    [GOVERNANCE_TYPES.ETHICS]: [],
    [GOVERNANCE_TYPES.OPERATING]: []
  });
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données de gouvernance
  useEffect(() => {
    const loadGovernanceData = async () => {
      try {
        setIsLoading(true);
        const allMembers = await governanceService.getAllMembers();

        // Organiser les membres par type
        const organized = {
          [GOVERNANCE_TYPES.PRESIDENCY]: [],
          [GOVERNANCE_TYPES.STEERING]: [],
          [GOVERNANCE_TYPES.ETHICS]: [],
          [GOVERNANCE_TYPES.OPERATING]: []
        };

        allMembers.forEach(member => {
          if (organized[member.type]) {
            organized[member.type].push(member);
          }
        });

        setGovernanceData(organized);
      } catch (err) {
        console.error('Error loading governance data:', err);
        setError('Failed to load governance data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGovernanceData();
  }, []);

  const handleAdd = async (type) => {
    if (user?.role !== 'admin') return;

    try {
      const newMember = await governanceService.addMember({
        name: '',
        organization: '',
        type: type,
        linkedin: '',
        email: '',
        comments: ''
      });

      setGovernanceData(prev => ({
        ...prev,
        [type]: [...prev[type], newMember]
      }));

      setEditingItem(newMember);
      setEditMode(true);
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member. Please try again.');
    }
  };

  const handleEdit = (member) => {
    if (user?.role !== 'admin') return;
    setEditingItem(member);
    setEditMode(true);
  };

  const handleSave = async (type, editedMember) => {
    try {
      const updatedMember = await governanceService.updateMember(editedMember.id, editedMember);

      setGovernanceData(prev => ({
        ...prev,
        [type]: prev[type].map(m => 
          m.id === editedMember.id ? updatedMember : m
        )
      }));

      setEditMode(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member. Please try again.');
    }
  };

  const handleDelete = async (type, memberId) => {
    if (user?.role !== 'admin' || !window.confirm('Are you sure you want to delete this member?')) return;

    try {
      await governanceService.deleteMember(memberId);

      setGovernanceData(prev => ({
        ...prev,
        [type]: prev[type].filter(m => m.id !== memberId)
      }));
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('Failed to delete member. Please try again.');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'member')) {
    return (
      <div className="p-4 text-center text-gray-600">
        You need to be logged in as a member or administrator to view this page.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading governance data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        {error}
      </Alert>
    );
  }

  const sectionProps = {
    onAdd: user?.role === 'admin' ? handleAdd : null,
    onEdit: user?.role === 'admin' ? handleEdit : null,
    onDelete: user?.role === 'admin' ? handleDelete : null,
    onSave: handleSave,
    editMode,
    editingItem,
    availableOrganizations: members.map(m => m.name)
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {Object.entries(GOVERNANCE_TYPES).map(([key, title]) => (
        <GovernanceSection
          key={key}
          title={title}
          type={title}
          members={governanceData[title]}
          {...sectionProps}
        />
      ))}
    </div>
  );
};

export default GovernanceView;