import React, { useState, useEffect } from 'react';
import { Globe2, Users, Shield, Target } from 'lucide-react';
import FoundersPage from './FoundersPage';
import Pressrelease from './Pressrelease';
import Torpage from './Torpage';
import PRAI from './PRAI';
import Events from './Events';
import UNESCOReport from './UNESCOReport';
import { useAuth } from '../AuthContext';
import ui from '../../translations/ui.js';

const TABS = {
  ABOUT: 'about',
  PRESS_RELEASE: 'press-release',
  PRAI_PARTNERSHIP: 'prai-partnership',
  UNESCO_REPORT: 'unesco-report',
  TOR: 'Terms of Reference',
  FOUNDERS: 'Founding members'
};

const MissionCard = ({ title, description, icon: Icon, color }) => (
  <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[200px] flex flex-col items-center justify-center hover:bg-white/40 transition-all">
    <Icon className={`w-8 h-8 ${color} mb-4`} />
    <h3 className={`font-serif text-xl font-bold mb-2 ${color}`}>{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const AboutPage = ({ currentLang }) => {
  const [activeTab, setActiveTab] = useState(TABS.ABOUT);
  const { user, language } = useAuth();
  const t = (ui[language] || ui[currentLang] || ui.en);

  // Log de débogage pour voir exactement ce qui se passe
  console.log("User info in AboutPage:", { 
    user, 
    email: user?.email, 
    role: user?.role
  });

  // Vérifier les paramètres d'URL au chargement initial
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      console.log("URL tab parameter:", tabParam);

      if (tabParam && Object.values(TABS).includes(tabParam)) {
        console.log(`Setting active tab to ${tabParam}`);
        setActiveTab(tabParam);
      }
    };

    checkUrlParams();
  }, []);

  const missionCards = [
    {
      title: t.about.mission.knowledgeTitle,
      description: t.about.mission.knowledgeDesc,
      icon: Globe2,
      color: "text-orange-600"
    },
    {
      title: t.about.mission.collectiveTitle,
      description: t.about.mission.collectiveDesc,
      icon: Users,
      color: "text-emerald-600"
    },
    {
      title: t.about.mission.independentTitle,
      description: t.about.mission.independentDesc,
      icon: Shield,
      color: "text-blue-600"
    },
    {
      title: t.about.mission.outputTitle,
      description: t.about.mission.outputDesc,
      icon: Target,
      color: "text-purple-600"
    }
  ];

  const renderContent = () => {
    console.log("Rendering content for tab:", activeTab);

    switch (activeTab) {
      case TABS.TOR:
        return <Torpage />;
      case TABS.PRESS_RELEASE:
        return <Pressrelease />;
      case TABS.PRAI_PARTNERSHIP:
        return <PRAI />;
      case TABS.UNESCO_REPORT:
        return <UNESCOReport />;
      case TABS.FOUNDERS:
        return <FoundersPage />;
      default:
        return (
          <>
            <section className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {missionCards.map((card, index) => (
                  <MissionCard key={index} {...card} />
                ))}
              </div>
            </section>

            <section className="mb-16">
              <Events isAdmin={user && user.role === 'admin'} />
            </section>
          </>
        );
    }
  };

  // Créer les onglets de navigation
  const navigationTabs = {
    [TABS.ABOUT]:            t.about.tabs.events,
    [TABS.FOUNDERS]:         t.about.tabs.founders,
    [TABS.TOR]:              t.about.tabs.tor,
    [TABS.PRAI_PARTNERSHIP]: t.about.tabs.prai,
    [TABS.UNESCO_REPORT]:    t.about.tabs.focusCentralAm,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-gray-200">
        <nav className="relative">
          <div className="md:hidden">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-2 border rounded-md bg-white"
            >
              {Object.entries(navigationTabs).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex space-x-8">
            {Object.entries(navigationTabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {renderContent()}

      <section className="bg-white/50 rounded-xl p-8 text-center mt-12">
        <div className="space-y-4">
          <p className="text-lg">
            {t.about.contact.label}{" "}
            <a href="mailto:general.secretary@i4tknowledge.net" className="text-blue-600 hover:underline">
              general.secretary@i4tknowledge.net
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;