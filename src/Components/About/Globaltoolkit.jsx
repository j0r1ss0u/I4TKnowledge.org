// src/Components/About/Globaltoolkit.jsx
import React, { useState, useEffect } from 'react';

// Definition of color categories
const CATEGORIES = {
  INSTITUTIONAL: { name: 'Institutional framework', color: 'bg-red-600 hover:bg-red-700' },
  LEGISLATING: { name: 'Legislating platforms', color: 'bg-cyan-600 hover:bg-cyan-700' },
  SYSTEMIC: { name: 'Systemic risks & Due Dil.', color: 'bg-green-700 hover:bg-green-800' },
  PROSOCIAL: { name: 'Pro-social design', color: 'bg-purple-500 hover:bg-purple-600' },
  CONTENT: { name: 'Content governance', color: 'bg-yellow-500 hover:bg-yellow-600' },
  ANTIDISCRIM: { name: 'Anti-discrimination', color: 'bg-orange-500 hover:bg-orange-600' }
};

// Elements of the periodic table
const ELEMENTS = [
  // Institutional framework (red)
  { id: 'IR', name: 'Independence of regulator', category: 'INSTITUTIONAL', description: 'Ensure the independence of regulators from political and commercial influences' },
  { id: 'IJ', name: 'Independence of judiciary', category: 'INSTITUTIONAL', description: 'Protection of judicial independence in cases related to platform regulation' },
  { id: 'HRB', name: 'HR protection bodies', category: 'INSTITUTIONAL', description: 'Human rights protection bodies overseeing digital platforms' },
  { id: 'DPB', name: 'Data Protection bodies', category: 'INSTITUTIONAL', description: 'Authorities responsible for protecting personal data and privacy' },
  { id: 'EB', name: 'Electoral bodies', category: 'INSTITUTIONAL', description: 'Electoral institutions ensuring the integrity of democratic processes online' },

  // Legislating platforms (blue)
  { id: 'PA', name: 'Platform Accountability', category: 'LEGISLATING', description: 'Mechanisms ensuring platform accountability for their content and algorithms' },
  { id: 'SG', name: 'Standard-based governance', category: 'LEGISLATING', description: 'Governance based on common technical and legal standards' },
  { id: 'PE', name: 'Policy Enforcement', category: 'LEGISLATING', description: 'Effective enforcement of content moderation policies' },
  { id: 'MC', name: 'Must Carry', category: 'LEGISLATING', description: 'Obligations to distribute certain content of public interest' },
  { id: 'MF', name: 'Media safety & freedom', category: 'LEGISLATING', description: 'Protection of media freedom and safety in the digital environment' },
  { id: 'AS', name: 'Algorithmic self-regulation', category: 'LEGISLATING', description: 'Self-regulatory frameworks for algorithmic systems' },

  // Systemic risks (green)
  { id: 'MT', name: 'Multi-tier transparency', category: 'SYSTEMIC', description: 'Different levels of transparency adapted to various audiences and needs' },
  { id: 'DC', name: 'Due diligence during crisis', category: 'SYSTEMIC', description: 'Special precautions during crisis periods' },
  { id: 'MF', name: 'Media freedom due dil.', category: 'SYSTEMIC', description: 'Due diligence obligations regarding media freedom' },
  { id: 'MB', name: 'Media Bargaining redress', category: 'SYSTEMIC', description: 'Compensation mechanisms for media organizations' },
  { id: 'ASR', name: 'Assessing systemic risks', category: 'SYSTEMIC', description: 'Assessment of systemic risks posed by digital platforms' },
  { id: 'HR', name: 'Human rights compliance', category: 'SYSTEMIC', description: 'Compliance with international human rights standards' },

  // Pro-social design (purple)
  { id: 'PC', name: 'Product Compliance', category: 'PROSOCIAL', description: 'Compliance of digital products with responsible social design standards' },
  { id: 'OM', name: 'Oversight mechanisms', category: 'PROSOCIAL', description: 'Independent oversight mechanisms for platforms' },
  { id: 'UA', name: 'User Agency', category: 'PROSOCIAL', description: 'Users\' ability to exercise control over their digital experience' },
  { id: 'OA', name: 'Open access, interoperability', category: 'PROSOCIAL', description: 'Facilitation of interoperability between different platforms' },
  { id: 'DM', name: 'Datafication & minimization', category: 'PROSOCIAL', description: 'Reduction of data collection to the necessary minimum' },

  // Content governance (yellow)
  { id: 'OS', name: 'Online safety', category: 'CONTENT', description: 'Protections against harmful content' },
  { id: 'CE', name: 'Content amplification', category: 'CONTENT', description: 'Analysis of content amplification mechanisms' },
  { id: 'CM', name: 'Content moderation', category: 'CONTENT', description: 'Rights-respecting content moderation processes' },
  { id: 'CH', name: 'Counternate escalation', category: 'CONTENT', description: 'Combating the escalation of online hate' },
  { id: 'EC', name: 'Escalation channels', category: 'CONTENT', description: 'Reporting and escalation channels for problems' },
  { id: 'RS', name: 'Recommender system', category: 'CONTENT', description: 'Balanced content recommendation systems' },
  { id: 'MP', name: 'Media prominence', category: 'CONTENT', description: 'Promoting reliable and quality media' },

  // Anti-discrimination (orange)
  { id: 'OS', name: 'OSINT', category: 'ANTIDISCRIM', description: 'Open source research to combat discrimination' },
  { id: 'DF', name: 'Digital Fairness', category: 'ANTIDISCRIM', description: 'Fairness in the design and operation of platforms' },
  { id: 'OB', name: 'Obfuscation', category: 'ANTIDISCRIM', description: 'Protection against discriminatory profiling' },
  { id: 'FB', name: 'Freedom of Beliefs', category: 'ANTIDISCRIM', description: 'Protection of freedom of belief in the digital space' },
  { id: 'DC', name: 'Decolonizing', category: 'ANTIDISCRIM', description: 'Decolonization of design and regulatory approaches' },
  { id: 'FG', name: 'Future Generation GDC', category: 'ANTIDISCRIM', description: 'Consideration of impacts on future generations' },
  { id: 'IH', name: 'Independent HR Monitoring', category: 'ANTIDISCRIM', description: 'Independent monitoring of human rights compliance' },
  { id: 'EB', name: 'Ethical by Design', category: 'ANTIDISCRIM', description: 'Integration of ethical principles from the design stage' },
  { id: 'DP', name: 'Digital Public Infrastructure', category: 'ANTIDISCRIM', description: 'Public and inclusive digital infrastructures' }
];

const Globaltoolkit = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter elements based on search and selected category
  const filteredElements = ELEMENTS.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          element.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? element.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Handle displaying element details
  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  // Handle closing details
  const handleCloseDetail = () => {
    setSelectedElement(null);
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Periodic Table of Platform Regulation</h2>
        <p className="text-gray-700 mb-6">
          The Periodic Table of Platform Regulation is a visual tool that organizes the key elements
          of digital platform governance. Inspired by the periodic table of chemical elements,
          it allows you to explore and understand the different dimensions of platform regulation.
        </p>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for an element..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter by category */}
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
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Periodic table */}
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

      {/* Category legend */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CATEGORIES).map(([key, { name, color }]) => (
            <div key={key} className="flex items-center">
              <div className={`w-6 h-6 rounded-md ${color.split(' ')[0]}`}></div>
              <span className="ml-2 text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Element detail modal */}
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
                <h4 className="font-semibold mb-2">Context</h4>
                <p className="text-gray-700">
                  This element is part of the global framework for digital platform regulation,
                  based on UNESCO's guiding principles for digital platform governance.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Application Examples</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Specific examples will be added during the full development of this section.</li>
                  <li>Examples will be based on real cases from different regions of the world.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information and references section */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">About this project</h3>
        <p className="mb-4">
          This periodic table is a component of the Global Toolkit Methodology, developed to provide a framework for understanding
          digital platform governance. It is structured around six main categories that cover
          the essential aspects of platform regulation.
        </p>
        <p className="mb-4">
          This table is under development and will be enriched with concrete examples, resources, and additional
          references. The goal is to create an interactive tool that helps regulators, policy makers,
          researchers, and civil society navigate the complexity of digital platform regulation.
        </p>
        <p>
          Developed as part of the I4TKnowledge initiative, this project builds on UNESCO's guidelines
          for digital platform governance and aims to promote a human rights-based approach.
        </p>
      </div>
    </div>
  );
};

export default Globaltoolkit;