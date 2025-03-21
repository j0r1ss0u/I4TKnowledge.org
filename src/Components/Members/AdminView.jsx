// =================================================================
// AdminView.jsx
// Vue d'administration des utilisateurs et organisations
// =================================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Building2, CheckCircle2, XCircle, 
  Edit, Trash2, Search, Plus, X, Globe2, Eye, EyeOff,
  RefreshCw, Clock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useMembers } from './MembersContext';
import { membersService } from '../../services/membersService';
import { usersService } from '../../services/usersService';
import { invitationsService } from '../../services/invitationsService';
import { createPortal } from 'react-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Constantes pour les rôles
const ROLES = {
  ADMIN: 'admin',
  VALIDATOR: 'validator',
  MEMBER: 'member'
};

// Constantes pour les tabs
const TABS = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  INVITATIONS: 'invitations'
};

// Composant Notification :
const NotificationPortal = ({ notification }) => {
  if (!notification) return null;

  return createPortal(
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[9999] animate-fade-in ${
        notification.type === 'error' 
          ? 'bg-red-100 text-red-700 border border-red-400'
          : 'bg-green-100 text-green-700 border border-green-400'
      }`}
      style={{ 
        pointerEvents: 'none',
        position: 'fixed',
        minWidth: '300px',
      }}
    >
      {notification.message}
    </div>,
    document.body
  );
};

const AdminView = () => {
  // États généraux
  const [activeTab, setActiveTab] = useState('organizations');
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [notification, setNotification] = useState(null);

  // États spécifiques aux organisations
  const { 
    members, 
    updateMember, 
    reloadMembers, 
    loading,
    error 
  } = useMembers();
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // États spécifiques aux utilisateurs
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    organization: '',
    role: 'member'
  });
  const showNotification = (message, type = 'success') => {
    console.log('Setting notification:', { message, type });
    setNotification({ message, type });
    setTimeout(() => {
      console.log('Clearing notification');
      setNotification(null);
    }, 5000);
  };

  // Vérification des permissions
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const isValidator = currentUser?.role === ROLES.VALIDATOR;

  // Détermination de l'onglet initial
  useEffect(() => {
    if (isValidator) {
      setActiveTab(TABS.INVITATIONS);
    }
  }, [isValidator]);

 
  // Chargement initial des données
  useEffect(() => {
    // Charge les données de l'onglet actif
    loadData();

    // Pour les admins, chargez aussi les statistiques des autres onglets
    if (isAdmin) {
      if (activeTab !== 'organizations') {
        reloadMembers();
      }
      if (activeTab !== 'users') {
        const loadUsers = async () => {
          try {
            const loadedUsers = await usersService.getAllUsers();
            setUsers(loadedUsers);
          } catch (error) {
            console.error('Error loading users for stats:', error);
          }
        };
        loadUsers();
      }
      if (activeTab !== 'invitations') {
        const loadInvitations = async () => {
          try {
            const pendingInvites = await invitationsService.getAllPendingInvitations();
            setPendingInvitations(pendingInvites);
          } catch (error) {
            console.error('Error loading invitations for stats:', error);
          }
        };
        loadInvitations();
      }
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    console.log('Current notification state:', notification);
  }, [notification]);
  
  const loadData = async () => {
    try {
      if (activeTab === 'organizations') {
        await reloadMembers();
      } else if (activeTab === 'users') {
        setLoadingUsers(true);
        const loadedUsers = await usersService.getAllUsers();
        setUsers(loadedUsers);
        setLoadingUsers(false);
      } else if (activeTab === 'invitations') {
        const pendingInvites = await invitationsService.getAllPendingInvitations();
        setPendingInvitations(pendingInvites);
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      // Ajoutons un log pour voir le message exact
      console.log('Error message:', error.message);
      console.log('Error type:', typeof error.message);
      showNotification(error.message || 'Une erreur est survenue', 'error');
    }
  };

  // Gestion des membres (organisations)
  const handleMemberSubmit = async (formData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
      } else {
        await membersService.addMember(formData);
        await reloadMembers();
      }
      setShowMemberForm(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await membersService.deleteMember(memberId);
        await reloadMembers();
      } catch (error) {
        console.error('Error deleting organization:', error);
      }
    }
  };

  const handleVisibilityToggle = async (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      await updateMember(memberId, {
        ...member,
        isVisible: !member.isVisible
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };
  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await invitationsService.cancelInvitation(invitationId);
        loadData(); // Recharger les données
      } catch (error) {
        console.error('Error canceling invitation:', error);
      }
    }
  };
  
  // Gestion des utilisateurs
  const handleUpdateUserRole = async (uid, newRole) => {
    try {
      console.log('Tentative de mise à jour du rôle:', { uid, newRole });

      // Récupérer les données utilisateur actuelles
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      // Mise à jour dans Firestore
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });

      // Recharger les données
      await loadData();

      showNotification(`Rôle mis à jour avec succès: ${newRole}`, 'success');

    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      showNotification('Erreur lors de la mise à jour du rôle', 'error');
    }
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersService.deleteUser(uid);
        loadData(); // Recharger les données
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      const invitationData = {
        email: inviteForm.email,
        organization: isValidator ? currentUser.organization : inviteForm.organization,
        role: inviteForm.role,
        createdBy: currentUser.uid
      };

      await invitationsService.createInvitation(invitationData);
      showNotification('Invitation sent successfully');
      await loadData();
      setInviteForm({
        email: '',
        organization: isValidator ? currentUser.organization : '',
        role: 'member'
      });
      setShowUserForm(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      showNotification(error.message, 'error');
    }
  };
  
  // État pour indiquer le chargement des invitations
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Fonction pour renvoyer une invitation
  const handleResendInvitation = async (invitationId) => {
    try {
      setLoadingInvitations(true);
      await invitationsService.resendInvitation(invitationId);
      showNotification('Invitation renvoyée avec succès', 'success');
      await loadData(); // Recharger les données
    } catch (error) {
      console.error('Error resending invitation:', error);
      showNotification('Erreur lors du renvoi de l\'invitation', 'error');
    } finally {
      setLoadingInvitations(false);
    }
  };
  
    
  // Filtrage des données
  const getFilteredData = () => {
    const searchLower = searchTerm.toLowerCase();

    if (activeTab === TABS.ORGANIZATIONS) {
      if (isValidator) return []; // Les validators ne voient pas les organisations
      return members.filter(member => (
        member.name?.toLowerCase().includes(searchLower) ||
        member.city?.toLowerCase().includes(searchLower) ||
        member.country?.toLowerCase().includes(searchLower) ||
        member.category?.toLowerCase().includes(searchLower)
      ));
    } else if (activeTab === TABS.USERS) {
      if (isValidator) return []; // Les validators ne voient pas les utilisateurs
      return users.filter(user => (
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      ));
    } else {
      // Filtre les invitations
      let filteredInvitations = pendingInvitations;

      // Si validator, ne montrer que les invitations de son organisation
      if (isValidator) {
        filteredInvitations = pendingInvitations.filter(
          invitation => invitation.organization === currentUser.organization
        );
      }

      return filteredInvitations.filter(invitation => (
        invitation.email.toLowerCase().includes(searchLower) ||
        invitation.organization.toLowerCase().includes(searchLower)
      ));
    }
  };
  
  return (
    <>
      {notification && <NotificationPortal notification={notification} />}
      <div className="space-y-6">
        
        {/* En-tête avec statistiques */}
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab(TABS.ORGANIZATIONS)}
              className={`bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg ${
                activeTab === TABS.ORGANIZATIONS ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <div className="flex items-center">
                <Building2 className={`h-8 w-8 ${
                  activeTab === TABS.ORGANIZATIONS ? 'text-amber-600' : 'text-gray-600'
                }`} />
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium">Organizations</h3>
                  <p className="text-2xl font-semibold">{members.length}</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab(TABS.USERS)}
              className={`bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg ${
                activeTab === TABS.USERS ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <div className="flex items-center">
                <Users className={`h-8 w-8 ${
                  activeTab === TABS.USERS ? 'text-amber-600' : 'text-gray-600'
                }`} />
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium">Users</h3>
                  <p className="text-2xl font-semibold">{users.length}</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab(TABS.INVITATIONS)}
              className={`bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg ${
                activeTab === TABS.INVITATIONS ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <div className="flex items-center">
                <Mail className={`h-8 w-8 ${
                  activeTab === TABS.INVITATIONS ? 'text-amber-600' : 'text-gray-600'
                }`} />
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium">Pending Invites</h3>
                  <p className="text-2xl font-semibold">{pendingInvitations.length}</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          isValidator && 
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setActiveTab(TABS.INVITATIONS)}
              className={`bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg ${
                activeTab === TABS.INVITATIONS ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <div className="flex items-center">
                <Mail className={`h-8 w-8 ${
                  activeTab === TABS.INVITATIONS ? 'text-amber-600' : 'text-gray-600'
                }`} />
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium">Pending Invites for {currentUser.organization}</h3>
                  <p className="text-2xl font-semibold">
                    {pendingInvitations.filter(inv => inv.organization === currentUser.organization).length}
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab(TABS.ORGANIZATIONS)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === TABS.ORGANIZATIONS
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Organizations
                </button>
                <button
                  onClick={() => setActiveTab(TABS.USERS)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === TABS.USERS
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Users
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab(TABS.INVITATIONS)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === TABS.INVITATIONS
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invitations
            </button>
          </nav>
        </div>

      {/* Barre d'outils */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => activeTab === 'organizations' ? setShowMemberForm(true) : setShowUserForm(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            {activeTab === 'organizations' ? 'Add Organization' : 'Invite User'}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'organizations' ? (
          // Table des organisations
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredData().map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {member.name}
                    {member.fullName && (
                      <span className="block text-sm text-gray-500">{member.fullName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{member.city}, {member.country}</td>
                  <td className="px-6 py-4">{member.category}</td>
                  <td className="px-6 py-4">
                    {member.website && (
                      <a 
                        href={`https://${member.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {member.website}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleVisibilityToggle(member.id)}
                      className={`p-1 rounded ${member.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {member.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Empêcher tout comportement par défaut
                        e.stopPropagation(); // Empêcher la propagation de l'événement

                        console.log('Edit button clicked for member:', member);

                        // Définir l'élément à éditer
                        setEditingMember({...member}); // Créer une copie pour éviter les références partagées

                        // Ouvrir le formulaire modal
                        setShowMemberForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

      ) : activeTab === 'invitations' ? (
      // Table des invitations
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Organization</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Expires At</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loadingInvitations ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center">
                <div className="flex justify-center items-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-amber-600 mr-2" />
                  Loading invitations...
                </div>
              </td>
            </tr>
          ) : getFilteredData().length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                No invitations found
              </td>
            </tr>
          ) : (
            getFilteredData().map((invitation) => {
              const isExpired = invitation.expiresAt && invitation.expiresAt.toDate() < new Date();
              return (
                <tr key={invitation.id} className={`hover:bg-gray-50 ${
                  isExpired && invitation.status === 'pending' ? 'bg-red-50' : ''
                }`}>
                  <td className="px-6 py-4 truncate">
                    <div className="text-sm text-gray-900 truncate hover:text-clip hover:overflow-visible" title={invitation.email}>
                      {invitation.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 break-words">
                      {invitation.organization || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                      {invitation.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                      invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invitation.status === 'accepted' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : isExpired ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {invitation.status === 'accepted' ? 'Accepted' : 
                       isExpired ? 'Expired' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.expiresAt?.toDate().toLocaleDateString()} {invitation.expiresAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium flex justify-end space-x-2">
                    {invitation.status === 'pending' && (
                      isExpired ? (
                        <button
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Resend Invitation"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      ) : null
                    )}
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Cancel Invitation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      ) : (
          // Table des utilisateurs
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingUsers ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">Loading users...</td>
                </tr>
              ) : getFilteredData().map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user.uid, e.target.value)}
                      className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="member">Member</option>
                      <option value="validator">Organization Validator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      
        )}
      </div>
      {/* Formulaires modaux */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMember ? 'Edit Organization' : 'Add Organization'}
              </h3>
              <button onClick={() => {
                setShowMemberForm(false);
                setEditingMember(null);
              }}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                name: e.target.name.value,
                fullName: e.target.fullName.value,
                city: e.target.city.value,
                country: e.target.country.value,
                website: e.target.website.value,
                category: e.target.category.value,
                region: e.target.region.value,
                lat: parseFloat(e.target.lat.value),
                lng: parseFloat(e.target.lng.value),
                isVisible: e.target.isVisible.checked
              };
              handleMemberSubmit(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingMember?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={editingMember?.fullName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  type="text"
                  defaultValue={editingMember?.city}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  name="country"
                  type="text"
                  defaultValue={editingMember?.country}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  name="website"
                  type="text"
                  defaultValue={editingMember?.website}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  defaultValue={editingMember?.category || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Academic">Academic</option>
                  <option value="Civil society">Civil society</option>
                  <option value="Think tank">Think tank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <select
                  name="region"
                  defaultValue={editingMember?.region || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                >
                  <option value="" disabled>Select a region</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia-Pacific">Asia-Pacific</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  name="lat"
                  type="number"
                  step="0.000001"
                  defaultValue={editingMember?.lat}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  name="lng"
                  type="number"
                  step="0.000001"
                  defaultValue={editingMember?.lng}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isVisible"
                  name="isVisible"
                  type="checkbox"
                  defaultChecked={editingMember?.isVisible}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
                  Visible
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberForm(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {editingMember ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Modal formulaire utilisateur */}
        {showUserForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Invite New User
                </h3>
                <button onClick={() => setShowUserForm(false)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization</label>
                  {isValidator ? (
                    // Pour les validators : champ en lecture seule avec leur organisation
                    <input
                      type="text"
                      value={currentUser.organization}
                      className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      disabled
                    />
                  ) : (
                    // Pour les admins : sélection de l'organisation
                    <select
                      value={inviteForm.organization}
                      onChange={(e) => setInviteForm({...inviteForm, organization: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      required
                    >
                      <option value="">Select an organization</option>
                      {members.map(org => (
                        <option key={org.id} value={org.name}>{org.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    required
                  >
                    <option value="member">Member</option>
                    {isAdmin && <option value="validator">Organization Validator</option>}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

             {/* NotificationPortal est géré séparément via createPortal */}
             <NotificationPortal notification={notification} />
           </div>
         </>
        );
        };

        export default AdminView;