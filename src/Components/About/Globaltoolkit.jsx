// src/Components/About/Globaltoolkit.jsx
import React, { useState, useEffect } from 'react';

// Définition des catégories de couleurs
const CATEGORIES = {
  INSTITUTIONAL: { name: 'Institutional framework', color: 'bg-red-600 hover:bg-red-700' },
  LEGISLATING: { name: 'Legislating platforms', color: 'bg-cyan-600 hover:bg-cyan-700' },
  SYSTEMIC: { name: 'Systemic risks & Due Dil.', color: 'bg-green-700 hover:bg-green-800' },
  PROSOCIAL: { name: 'Pro-social design', color: 'bg-purple-500 hover:bg-purple-600' },
  CONTENT: { name: 'Content governance', color: 'bg-yellow-500 hover:bg-yellow-600' },
  ANTIDISCRIM: { name: 'Anti-discrimination', color: 'bg-orange-500 hover:bg-orange-600' }
};

// Éléments de la table périodique
const ELEMENTS = [
  // Institutional framework (rouge)
  { id: 'IR', name: 'Independence of regulator', category: 'INSTITUTIONAL', description: 'Garantir l\'indépendance des régulateurs face aux influences politiques et commerciales' },
  { id: 'IJ', name: 'Independence of judiciary', category: 'INSTITUTIONAL', description: 'Protection de l\'indépendance judiciaire dans les affaires relatives à la régulation des plateformes' },
  { id: 'HRB', name: 'HR protection bodies', category: 'INSTITUTIONAL', description: 'Organismes de protection des droits humains veillant sur les plateformes numériques' },
  { id: 'DPB', name: 'Data Protection bodies', category: 'INSTITUTIONAL', description: 'Autorités chargées de protéger les données personnelles et la vie privée' },
  { id: 'EB', name: 'Electoral bodies', category: 'INSTITUTIONAL', description: 'Institutions électorales veillant à l\'intégrité des processus démocratiques en ligne' },

  // Legislating platforms (bleu)
  { id: 'PA', name: 'Platform Accountability', category: 'LEGISLATING', description: 'Mécanismes garantissant la responsabilité des plateformes pour leur contenu et leurs algorithmes' },
  { id: 'SG', name: 'Standard-based governance', category: 'LEGISLATING', description: 'Gouvernance basée sur des normes techniques et légales communes' },
  { id: 'PE', name: 'Policy Enforcement', category: 'LEGISLATING', description: 'Application efficace des politiques de modération de contenu' },
  { id: 'MC', name: 'Must Carry', category: 'LEGISLATING', description: 'Obligations de distribution de certains contenus d\'intérêt public' },
  { id: 'MF', name: 'Media safety & freedom', category: 'LEGISLATING', description: 'Protection de la liberté et de la sécurité des médias dans l\'environnement numérique' },
  { id: 'AS', name: 'Algorithmic self-regulation', category: 'LEGISLATING', description: 'Cadres d\'autorégulation pour les systèmes algorithmiques' },

  // Systemic risks (vert)
  { id: 'MT', name: 'Multi-tier transparency', category: 'SYSTEMIC', description: 'Différents niveaux de transparence adaptés aux divers publics et besoins' },
  { id: 'DC', name: 'Due diligence during crisis', category: 'SYSTEMIC', description: 'Précautions particulières pendant les périodes de crise' },
  { id: 'MF', name: 'Media freedom due dil.', category: 'SYSTEMIC', description: 'Obligations de diligence raisonnable concernant la liberté des médias' },
  { id: 'MB', name: 'Media Bargaining redress', category: 'SYSTEMIC', description: 'Mécanismes de compensation pour les organisations médiatiques' },
  { id: 'ASR', name: 'Assessing systemic risks', category: 'SYSTEMIC', description: 'Évaluation des risques systémiques posés par les plateformes numériques' },
  { id: 'HR', name: 'Human rights compliance', category: 'SYSTEMIC', description: 'Conformité aux normes internationales des droits humains' },

  // Pro-social design (violet)
  { id: 'PC', name: 'Product Compliance', category: 'PROSOCIAL', description: 'Conformité des produits numériques aux normes de conception sociale responsable' },
  { id: 'OM', name: 'Oversight mechanisms', category: 'PROSOCIAL', description: 'Mécanismes de surveillance indépendants pour les plateformes' },
  { id: 'UA', name: 'User Agency', category: 'PROSOCIAL', description: 'Capacité des utilisateurs à exercer un contrôle sur leur expérience numérique' },
  { id: 'OA', name: 'Open access, interoperability', category: 'PROSOCIAL', description: 'Facilitation de l\'interopérabilité entre différentes plateformes' },
  { id: 'DM', name: 'Datafication & minimization', category: 'PROSOCIAL', description: 'Réduction de la collecte de données au minimum nécessaire' },

  // Content governance (jaune)
  { id: 'OS', name: 'Online safety', category: 'CONTENT', description: 'Protections contre les contenus nuisibles' },
  { id: 'CE', name: 'Content amplification', category: 'CONTENT', description: 'Analyse des mécanismes d\'amplification des contenus' },
  { id: 'CM', name: 'Content moderation', category: 'CONTENT', description: 'Processus de modération de contenu respectueux des droits' },
  { id: 'CH', name: 'Counternate escalation', category: 'CONTENT', description: 'Lutte contre l\'escalade de la haine en ligne' },
  { id: 'EC', name: 'Escalation channels', category: 'CONTENT', description: 'Canaux de signalement et d\'escalade des problèmes' },
  { id: 'RS', name: 'Recommender system', category: 'CONTENT', description: 'Systèmes de recommandation de contenu équilibrés' },
  { id: 'MP', name: 'Media prominence', category: 'CONTENT', description: 'Mise en avant des médias fiables et de qualité' },

  // Anti-discrimination (orange)
  { id: 'OS', name: 'OSINT', category: 'ANTIDISCRIM', description: 'Recherche open source pour lutter contre la discrimination' },
  { id: 'DF', name: 'Digital Fairness', category: 'ANTIDISCRIM', description: 'Équité dans la conception et le fonctionnement des plateformes' },
  { id: 'OB', name: 'Obfuscation', category: 'ANTIDISCRIM', description: 'Protection contre le profilage discriminatoire' },
  { id: 'FB', name: 'Freedom of Beliefs', category: 'ANTIDISCRIM', description: 'Protection de la liberté de croyance dans l\'espace numérique' },
  { id: 'DC', name: 'Decolonizing', category: 'ANTIDISCRIM', description: 'Décolonisation des approches de conception et de régulation' },
  { id: 'FG', name: 'Future Generation GDC', category: 'ANTIDISCRIM', description: 'Considération des impacts sur les générations futures' },
  { id: 'IH', name: 'Independent HR Monitoring', category: 'ANTIDISCRIM', description: 'Surveillance indépendante du respect des droits humains' },
  { id: 'EB', name: 'Ethical by Design', category: 'ANTIDISCRIM', description: 'Intégration de principes éthiques dès la conception' },
  { id: 'DP', name: 'Digital Public Infrastructure', category: 'ANTIDISCRIM', description: 'Infrastructures numériques publiques et inclusives' }
];

const Globaltoolkit = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les éléments en fonction de la recherche et de la catégorie sélectionnée
  const filteredElements = ELEMENTS.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          element.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? element.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Gérer l'affichage du détail d'un élément
  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  // Gérer la fermeture du détail
  const handleCloseDetail = () => {
    setSelectedElement(null);
  };

  // Gérer la sélection d'une catégorie
  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Periodic Table of Platform Regulation</h2>
        <p className="text-gray-700 mb-6">
          Le Tableau Périodique de la Régulation des Plateformes est un outil visuel qui organise les éléments clés 
          de la gouvernance des plateformes numériques. Inspiré du tableau périodique des éléments chimiques, 
          il permet d'explorer et de comprendre les différentes dimensions de la régulation des plateformes.
        </p>

        {/* Barre de recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un élément..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtre par catégorie */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(CATEGORIES).map(([key, { name, color }]) => (
            <button
              key={key}
              onClick={() => handleCategoryClick(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === key 
                  ? color + ' text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Tableau périodique */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
        {filteredElements.map((element) => (
          <button
            key={element.id}
            onClick={() => handleElementClick(element)}
            className={`p-3 rounded-md text-white transition-colors ${CATEGORIES[element.category].color} flex flex-col items-center justify-center aspect-square`}
          >
            <span className="text-lg font-bold">{element.id}</span>
            <span className="text-xs text-center mt-1">{element.name}</span>
          </button>
        ))}
      </div>

      {/* Légende des catégories */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Légende</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CATEGORIES).map(([key, { name, color }]) => (
            <div key={key} className="flex items-center">
              <div className={`w-6 h-6 rounded-md ${color.split(' ')[0]}`}></div>
              <span className="ml-2 text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de détail d'un élément */}
      {selectedElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedElement.name}</h3>
                  <p className="text-sm text-gray-600">{CATEGORIES[selectedElement.category].name}</p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={`w-full h-2 rounded-full ${CATEGORIES[selectedElement.category].color.split(' ')[0]} mb-4`}></div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedElement.description}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Contexte</h4>
                <p className="text-gray-700">
                  Cet élément fait partie du cadre global de la régulation des plateformes numériques, 
                  basé sur les principes directeurs de l'UNESCO pour la gouvernance des plateformes numériques.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exemples d'application</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Des exemples spécifiques seront ajoutés lors du développement complet de cette section.</li>
                  <li>Les exemples seront basés sur des cas réels provenant de différentes régions du monde.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section d'information et références */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">À propos de ce projet</h3>
        <p className="mb-4">
          Ce tableau périodique est un composant du Global Toolkit Methodology, développé pour offrir un cadre de compréhension
          de la gouvernance des plateformes numériques. Il est structuré autour de six catégories principales qui couvrent
          les aspects essentiels de la régulation des plateformes.
        </p>
        <p className="mb-4">
          Ce tableau est en cours de développement et sera enrichi avec des exemples concrets, des ressources et des références
          supplémentaires. L'objectif est de créer un outil interactif qui aide les régulateurs, les décideurs politiques,
          les chercheurs et la société civile à naviguer dans la complexité de la régulation des plateformes numériques.
        </p>
        <p>
          Développé dans le cadre de l'initiative I4TKnowledge, ce projet s'appuie sur les lignes directrices de l'UNESCO
          pour la gouvernance des plateformes numériques et vise à promouvoir une approche fondée sur les droits humains.
        </p>
      </div>
    </div>
  );
};

export default Globaltoolkit;