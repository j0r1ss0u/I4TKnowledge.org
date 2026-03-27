// =================================================================
// AdminView.jsx
// Vue d'administration des utilisateurs et organisations
// =================================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Building2, CheckCircle2, XCircle, 
  Edit, Trash2, Search, Plus, X, Globe2, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useMembers } from './MembersContext';
import { membersService } from '../../services/membersService';
import { usersService } from '../../services/usersService';
import { invitationsService } from '../../services/invitationsService';
import { torService } from '../../services/torService';
import { createPortal } from 'react-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ui from '../../translations/ui';

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
  const { user: currentUser, language } = useAuth();
  const a = (ui[language] ?? ui.en).adminView;
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
    if (window.confirm(a.confirmDeleteOrg)) {
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
    if (window.confirm(a.confirmCancelInvite)) {
      try {
        await invitationsService.cancelInvitation(invitationId);
        loadData(); // Recharger les données
      } catch (error) {
        console.error('Error canceling invitation:', error);
      }
    }
  };

  const getInvitationStatus = (invitation) => {
    const now = new Date();
    const expiresAt = invitation.expiresAt?.toDate();

    if (!expiresAt) {
      return { status: 'unknown', label: a.invStatus.unknown, color: 'bg-gray-100 text-gray-800' };
    }

    if (invitation.status === 'accepted') {
      return { status: 'accepted', label: a.invStatus.accepted, color: 'bg-green-100 text-green-800' };
    }

    if (invitation.status === 'expired' || expiresAt < now) {
      return { status: 'expired', label: a.invStatus.expired, color: 'bg-red-100 text-red-800' };
    }

    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (expiresAt < twentyFourHoursFromNow) {
      return { status: 'expiring', label: a.invStatus.expiringSoon, color: 'bg-yellow-100 text-yellow-800' };
    }

    return { status: 'active', label: a.invStatus.active, color: 'bg-blue-100 text-blue-800' };
  };

  const formatExpirationDate = (invitation) => {
    const expiresAt = invitation.expiresAt?.toDate();
    if (!expiresAt) return 'N/A';

    const now = new Date();
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} days`;
    }
  };

  const handleResendInvitation = async (invitationId) => {
    if (window.confirm(a.confirmResendInvite)) {
      try {
        await invitationsService.resendInvitation(invitationId);
        showNotification(a.notifications.inviteResent, 'success');
        loadData();
      } catch (error) {
        console.error('Error resending invitation:', error);
        showNotification(error.message || a.notifications.inviteResendError, 'error');
      }
    }
  };
  
  // Gestion des utilisateurs
  const handleUpdateUserRole = async (uid, newRole) => {
    try {
      console.log('Tentative de mise à jour du rôle:', { uid, newRole });

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      const currentRole = userData.role;
      const upgradingFromObserver = currentRole === 'observer' && (newRole === 'member' || newRole === 'validator');

      const updateData = {
        role: newRole,
        updatedAt: serverTimestamp()
      };

      if (upgradingFromObserver) {
        const alreadySigned = await torService.hasEverAcceptedToR(uid);
        if (!alreadySigned) {
          updateData.requiresTorAcceptance = true;
        }
      }

      await updateDoc(userRef, updateData);
      await loadData();

      const needsTor = upgradingFromObserver && updateData.requiresTorAcceptance;
      const message = needsTor
        ? a.notifications.roleUpdatedWithTor.replace('{role}', newRole)
        : a.notifications.roleUpdated;
      showNotification(message, 'success');

    } catch (error) {
      console.error('Error updating role:', error);
      showNotification(a.notifications.roleUpdateError, 'error');
    }
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm(a.confirmDeleteUser)) {
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
      showNotification(a.notifications.inviteSent);
      
      // Réinitialiser le formulaire
      setInviteForm({
        email: '',
        organization: isValidator ? currentUser.organization : '',
        role: 'member'
      });
      
      // Fermer le modal AVANT de recharger les données
      setShowUserForm(false);
      
      // Recharger les données en arrière-plan (ne pas bloquer la fermeture)
      loadData().catch(err => console.error('Error reloading data:', err));
    } catch (error) {
      console.error('Error inviting user:', error);
      // Afficher un message d'erreur plus clair
      const errorMessage = error?.message || 'Une erreur est survenue lors de l\'envoi de l\'invitation';
      showNotification(errorMessage, 'error');
      // Ne pas bloquer le formulaire, le laisser ouvert pour réessayer
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
                  <h3 className="text-lg font-medium">{a.tabs.organizations}</h3>
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
                  <h3 className="text-lg font-medium">{a.tabs.users}</h3>
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
                  <h3 className="text-lg font-medium">{a.pendingInvites}</h3>
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
                  <h3 className="text-lg font-medium">{a.pendingInvitesFor} {currentUser.organization}</h3>
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
                  {a.tabs.organizations}
                </button>
                <button
                  onClick={() => setActiveTab(TABS.USERS)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === TABS.USERS
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {a.tabs.users}
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
              {a.tabs.invitations}
            </button>
          </nav>
        </div>

      {/* Barre d'outils */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`${a.searchPlaceholder} ${activeTab}...`}
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
            {activeTab === 'organizations' ? a.addOrganization : a.inviteUser}
          </button>
        </div>
      </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-lg shadow">
          <div className="w-full overflow-x-auto">
            {activeTab === 'organizations' ? (
              // Table des organisations
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">{a.th.name}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">{a.th.location}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">{a.th.category}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">{a.th.website}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">{a.th.visibility}</th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">{a.th.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredData().map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="min-w-[150px]">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          {member.fullName && (
                            <div className="text-sm text-gray-500">{member.fullName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="min-w-[120px] text-sm text-gray-900">
                          {member.city}, {member.country}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="min-w-[100px] text-sm text-gray-900">
                          {member.category}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="min-w-[120px]">
                          {member.website && (
                            <a 
                              href={`https://${member.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                              title={member.website}
                            >
                              {member.website}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="min-w-[80px] flex justify-center">
                          <button
                            onClick={() => handleVisibilityToggle(member.id)}
                            className={`p-1 rounded ${member.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {member.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="min-w-[100px] flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setShowMemberForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title={a.editOrg}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-900"
                            title={a.deleteOrg}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            ) : activeTab === 'invitations' ? (
              // Table des invitations  
              <table className="min-w-[1600px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[350px]">{a.th.email}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">{a.th.organization}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">{a.th.role}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">{a.th.status}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[220px]">{a.th.expirationDate}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px] sticky right-0 bg-white">{a.th.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredData().map((invitation) => {
                    const invitationStatus = getInvitationStatus(invitation);
                    return (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 w-[350px]">
                          <div className="text-sm text-gray-900 break-all" title={invitation.email}>
                            {invitation.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 w-[250px]">
                          <div className="text-sm text-gray-900 break-words" title={invitation.organization || 'Unknown'}>
                            {invitation.organization || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap w-[120px]">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            {invitation.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap w-[120px]">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invitationStatus.color}`}>
                            {invitationStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 w-[220px]">
                          <div className="flex flex-col">
                            <span className="text-xs">{invitation.createdAt?.toDate().toLocaleDateString()}</span>
                            <span className={`text-xs ${invitationStatus.status === 'expired' ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                              {formatExpirationDate(invitation)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium w-[150px] sticky right-0 bg-white">
                          <div className="flex items-center justify-end space-x-2">
                            {invitationStatus.status !== 'accepted' && (
                              <button
                                onClick={() => handleResendInvitation(invitation.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title={a.resendInv}
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-900"
                              title={a.cancelInv}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            ) : (
              // Table des utilisateurs
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">{a.th.email}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">{a.th.organization}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">{a.th.role}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">{a.th.status}</th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">{a.th.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="5" className="px-3 sm:px-6 py-4 text-center">{a.loadingUsers}</td>
                    </tr>
                  ) : getFilteredData().map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 min-w-[200px] truncate" title={user.email}>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 min-w-[150px] truncate" title={user.organization || 'No organization'}>
                          {user.organization || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="min-w-[140px]">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.uid, e.target.value)}
                            className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                          >
                            <option value="member">{a.roles.member}</option>
                            <option value="observer">{a.roles.observer}</option>
                            <option value="validator">{a.roles.validator}</option>
                            <option value="admin">{a.roles.admin}</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="min-w-[80px]">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="min-w-[80px] flex justify-end">
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="text-red-600 hover:text-red-900"
                            title={a.deleteUser}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Formulaires modaux */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMember ? a.orgForm.editTitle : a.orgForm.addTitle}
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
                isVisible: e.target.isVisible.checked,
                memberType: e.target.memberType.value
              };
              handleMemberSubmit(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.name}</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingMember?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.fullName}</label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={editingMember?.fullName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.city}</label>
                <input
                  name="city"
                  type="text"
                  defaultValue={editingMember?.city}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.country}</label>
                <input
                  name="country"
                  type="text"
                  defaultValue={editingMember?.country}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.website}</label>
                <input
                  name="website"
                  type="text"
                  defaultValue={editingMember?.website}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.category}</label>
                <select
                  name="category"
                  defaultValue={editingMember?.category || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                >
                  <option value="" disabled>{a.orgForm.categoryPlaceholder}</option>
                  <option value="Academic">{a.orgForm.categories.academic}</option>
                  <option value="Civil society">{a.orgForm.categories.civilSociety}</option>
                  <option value="Think tank">{a.orgForm.categories.thinkTank}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.region}</label>
                <select
                  name="region"
                  defaultValue={editingMember?.region || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                >
                  <option value="" disabled>{a.orgForm.regionPlaceholder}</option>
                  <option value="Europe">{a.orgForm.regions.europe}</option>
                  <option value="Asia-Pacific">{a.orgForm.regions.asiaPacific}</option>
                  <option value="North America">{a.orgForm.regions.northAmerica}</option>
                  <option value="South America">{a.orgForm.regions.southAmerica}</option>
                  <option value="Africa">{a.orgForm.regions.africa}</option>
                  <option value="Middle East">{a.orgForm.regions.middleEast}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.lat}</label>
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
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.lng}</label>
                <input
                  name="lng"
                  type="number"
                  step="0.000001"
                  defaultValue={editingMember?.lng}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{a.orgForm.memberType}</label>
                <select
                  name="memberType"
                  defaultValue={editingMember?.memberType || 'member'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="member">{a.roles.member}</option>
                  <option value="observer">{a.roles.observer}</option>
                </select>
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
                  {a.orgForm.visible}
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
                  {a.orgForm.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {editingMember ? a.orgForm.update : a.orgForm.add}
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
                  {a.inviteForm.title}
                </h3>
                <button onClick={() => setShowUserForm(false)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{a.inviteForm.email}</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{a.inviteForm.organization}</label>
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
                      <option value="">{a.inviteForm.selectOrg}</option>
                      {members.map(org => (
                        <option key={org.id} value={org.name}>{org.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{a.inviteForm.role}</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    required
                  >
                    <option value="member">{a.roles.member}</option>
                    <option value="observer">{a.roles.observer}</option>
                    {isAdmin && <option value="validator">{a.roles.validator}</option>}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {a.inviteForm.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    {a.inviteForm.send}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminView;