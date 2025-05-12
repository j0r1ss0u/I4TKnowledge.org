import React from 'react';
import { useAuth } from '../AuthContext';
import Globaltoolkit from './Globaltoolkit';

const ToolsPage = ({ currentLang }) => {
  const { user } = useAuth();
  // Vérification des droits administrateur
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@i4tk.org' || user.email === 'joris.galea@i4tknowledge.net');

  // Log de débogage
  console.log("User info in ToolsPage:", { 
    user, 
    isAdmin, 
    email: user?.email, 
    role: user?.role,
    isEmailAdmin: user?.email === 'admin@i4tk.org' || user?.email === 'joris.galea@i4tknowledge.net'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {currentLang === 'en' ? 'Tools' : 'Outils'}
      </h1>

      {isAdmin ? (
        <Globaltoolkit />
      ) : (
        <div className="bg-white/50 rounded-xl p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">
            {currentLang === 'en' ? 'Restricted Access' : 'Accès restreint'}
          </h2>
          <p>
            {currentLang === 'en'
              ? 'This section is under development and is only accessible to administrators.'
              : 'Cette section est en cours de développement et n\'est accessible qu\'aux administrateurs.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;