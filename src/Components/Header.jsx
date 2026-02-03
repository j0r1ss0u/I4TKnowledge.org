import React, { useState } from 'react';
import { useAuth, UserProfile, LoginForm } from './AuthContext';
import WalletConnect from './Library/WalletConnect';
import { LogIn, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

// =============== LOGIN BUTTON COMPONENT ===============
const LoginButton = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowLoginForm(true)}
        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-500 hover:bg-gray-100"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Connexion
      </button>
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <LoginForm />
            <button
              onClick={() => setShowLoginForm(false)}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// =============== NAVIGATION COMPONENT ===============
const Navigation = ({ currentPage, handlePageChange, isMobile, setIsMenuOpen }) => {
  const { user } = useAuth();

  // Définition de la hiérarchie des rôles et leurs accès
  const ROLE_ACCESS = {
    admin: ['member', 'admin', 'validator'],
    validator: ['member', 'validator'],
    member: ['member'],
  };

  const getUserAccess = (user) => {
    if (!user) return [];
    return ROLE_ACCESS[user.role] || [];
  };

  const navItems = [
    { id: "home", label: "Home", public: true },
    { id: "about", label: "About", public: true },
    { id: "members", label: "Members", public: true },
    { id: "library", label: "Library", public: true },
    { id: "press-releases", label: "Press Releases", public: true },
    { id: "forum", label: "Forum", requiredRole: 'member' },
    { id: "tools", label: "Tools", requiredRole: 'member' },
    { id: "walkthrough", label: "Guide", requiredRole: 'member' },
    { id: "draft", label: "Draft", requiredRole: 'admin' }
  ];

  const userAccess = getUserAccess(user);

  const visibleItems = navItems.filter(item => 
    item.public || 
    (user && item.requiredRole && userAccess.includes(item.requiredRole))
  );

  const handleNavClick = (itemId) => {
    handlePageChange(itemId);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Modification de la partie WalletConnect
  const showWalletConnect = user && userAccess.includes('member');

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center space-x-6'}`}>
      <nav className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-4'}`}>
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === item.id
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className={`${isMobile ? 'flex justify-center' : 'flex items-center'}`}>
        {user ? (
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center space-x-4'}`}>
            <div className="flex items-center space-x-2">
              <UserProfile />
              {user.role !== 'guest' && <NotificationBell handlePageChange={handlePageChange} />}
            </div>
            {showWalletConnect && <WalletConnect />}
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
};

// =============== HEADER COMPONENT ===============
const Header = ({ currentPage, handlePageChange, currentLang }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white bg-opacity-90 border-b" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-4">
          {/* Première rangée: Logo et Navigation */}
          <div className="flex justify-between items-center w-full">
            {/* Conteneur du logo avec taille fixe */}
            <div className="flex-shrink-0 w-48 md:w-64">
              <button 
                onClick={() => handlePageChange("home")}
                className="focus:outline-none hover:opacity-80 transition-opacity"
              >
                <img
                  src="/assets/logos/I4TK logo.jpg"
                  alt="I4TK Logo"
                  className="h-16 md:h-24 object-contain"
                />
              </button>
            </div>

            {/* Navigation sur desktop */}
            <div className="hidden md:flex flex-grow justify-end">
              <Navigation 
                currentPage={currentPage} 
                handlePageChange={handlePageChange}
                isMobile={false}
              />
            </div>

            {/* Bouton menu sur mobile */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu principal"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Menu mobile déroulant */}
          {isMenuOpen && (
            <div className="md:hidden w-full mt-4">
              <Navigation 
                currentPage={currentPage} 
                handlePageChange={handlePageChange}
                isMobile={true}
                setIsMenuOpen={setIsMenuOpen}
              />
            </div>
          )}

          {/* Deuxième rangée: Tagline */}
          <div className="text-center mt-4 max-w-3xl w-full">
            <p className="font-serif text-lg md:text-2xl font-bold mb-6">
              {currentLang === 'en' 
                ? 'Global knowledge network for an Internet for Trust'
                : 'Réseau global de connaissance pour un Internet de confiance'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;