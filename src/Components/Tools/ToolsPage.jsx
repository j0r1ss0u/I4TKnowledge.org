import React from 'react';
import { useAuth } from '../AuthContext';
import Globaltoolkit from './Globaltoolkit';

const ToolsPage = ({ currentLang }) => {
  const { user } = useAuth();

  // Suppression complète de la vérification des droits
  // Pas besoin de définir isAdmin puisqu'on n'utilise plus de condition

  // Log de débogage simplifié
  console.log("User info in ToolsPage:", { 
    user, 
    email: user?.email, 
    role: user?.role
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {currentLang === 'en' ? 'Tools' : 'Outils'}
      </h1>

      {/* Accès direct à Globaltoolkit sans condition */}
      <Globaltoolkit />
    </div>
  );
};

export default ToolsPage;