// -------------------------------------------
// MembersPage.jsx
// Page principale de gestion des membres du réseau
// Composant parent qui gère l'affichage des différentes vues
// -------------------------------------------

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { MembersProvider } from './MembersContext';
import MapView from './MapView';
import GovernanceView from './GovernanceView';
import AdminView from './AdminView'; // Import du nouveau composant AdminView

// -------------------------------------------
// Composant MapViewWrapper
// Wrapper pour la vue carte
// -------------------------------------------
const MapViewWrapper = () => <MapView />;

// -------------------------------------------
// Composant ViewSelector
// Gère la sélection des différentes vues
// -------------------------------------------
const ViewSelector = ({ viewMode, setViewMode, userRole }) => {
  console.log('ViewSelector - userRole:', userRole);  // Debug log
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setViewMode('members')}
        className={`w-full sm:w-auto px-3 py-2 rounded ${viewMode === 'members' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
      >
        Members
      </button>
      {(userRole === 'admin' || userRole === 'validator') && (
        <button
          onClick={() => setViewMode('admin')}
          className={`w-full sm:w-auto px-3 py-2 rounded ${viewMode === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
        >
          Admin View
        </button>
      )}
      {(userRole === 'admin' || userRole === 'member') && (
        <button
          onClick={() => setViewMode('governance')}
          className={`w-full sm:w-auto px-3 py-2 rounded ${viewMode === 'governance' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
        >
          Governance
        </button>
      )}
    </div>
  );
};

// -------------------------------------------
// Composant principal MembersPageWrapper
// -------------------------------------------
const MembersPageWrapper = ({ initialView }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState(initialView || 'members');
  console.log('MembersPageWrapper - user:', user);  // Debug log
  console.log('MembersPageWrapper - user.role:', user?.role);  // Debug log

  return (
    <MembersProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Network Members</h1>
          <ViewSelector viewMode={viewMode} setViewMode={setViewMode} userRole={user?.role} />
        </div>
        {viewMode === 'members' && <MapView />}
        {viewMode === 'admin' && (user?.role === 'admin' || user?.role === 'validator') && <AdminView />}
        {viewMode === 'governance' && (user?.role === 'admin' || user?.role === 'member') && <GovernanceView />}
      </div>
    </MembersProvider>
  );
};

// -------------------------------------------
// Export des composants
// -------------------------------------------
const components = {
  MapView,
  MembersPageWrapper: ({ currentLang, initialView }) => (
    <MembersPageWrapper currentLang={currentLang} initialView={initialView} />
  )
};

export default components;