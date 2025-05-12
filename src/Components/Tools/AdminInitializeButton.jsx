import React, { useState } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';

// Données exactes basées sur le screenshot du tableau
const TOOLKIT_DATA = [
  // Institutional framework
  {
    id: 'II', 
    name: 'Inter institutional cooperation', 
    category: 'INSTITUTIONAL',
    description: 'Cooperation between different regulatory and oversight institutions',
    context: 'Essential for coherent digital platform governance across different sectors.'
  },
  {
    id: 'CP', 
    name: 'Consumer protection Bodies', 
    category: 'INSTITUTIONAL',
    description: 'Authorities responsible for protecting consumer rights in digital spaces',
    context: 'Ensures economic rights of consumers when using digital platforms.'
  },
  {
    id: 'NC', 
    name: 'Nature of the cooperation with platforms', 
    category: 'INSTITUTIONAL',
    description: 'The approach and type of engagement between regulators and platforms',
    context: 'Defines the relationship structure and power dynamics in platform governance.'
  },
  {
    id: 'DPM', 
    name: 'Digital platform multistakeholderism', 
    category: 'INSTITUTIONAL',
    description: 'Involvement of diverse stakeholders in platform governance',
    context: 'Ensures representation of different interests in decision-making processes.'
  },
  {
    id: 'TG', 
    name: 'Transnational governance', 
    category: 'INSTITUTIONAL',
    description: 'Cross-border governance mechanisms for digital platforms',
    context: 'Addresses the global nature of digital platforms operating across jurisdictions.'
  },
  {
    id: 'OM', 
    name: 'Oversight mechanisms', 
    category: 'INSTITUTIONAL',
    description: 'Processes for monitoring and reviewing platform activities',
    context: 'Ensures accountability and transparency in platform operations.'
  },
  {
    id: 'EB', 
    name: 'Electoral bodies', 
    category: 'INSTITUTIONAL',
    description: 'Electoral institutions ensuring democratic processes online',
    context: 'Protects electoral integrity from digital manipulation and interference.'
  },
  {
    id: 'SCR', 
    name: 'Self- and co-regulatory mechanisms', 
    category: 'INSTITUTIONAL',
    description: 'Industry-led or collaborative regulatory approaches',
    context: 'Balances flexibility with oversight in platform governance.'
  },
  {
    id: 'DPB', 
    name: 'Data Protection Bodies', 
    category: 'INSTITUTIONAL',
    description: 'Authorities responsible for personal data protection',
    context: 'Ensures compliance with data protection regulations.'
  },
  {
    id: 'HRP', 
    name: 'Human rights protection bodies', 
    category: 'INSTITUTIONAL',
    description: 'Institutions overseeing human rights in digital contexts',
    context: 'Provides framework for applying human rights standards to digital platforms.'
  },
  {
    id: 'IJ', 
    name: 'Independence of the judiciary', 
    category: 'INSTITUTIONAL',
    description: 'Protection of judicial independence in digital regulation',
    context: 'Ensures fair and impartial application of laws regarding digital platforms.'
  },
  {
    id: 'IR', 
    name: 'Independence of the regulator', 
    category: 'INSTITUTIONAL',
    description: 'Autonomy of regulatory authorities from political and commercial influence',
    context: 'Critical for unbiased oversight of digital platforms.'
  },

  // Legislating platforms
  {
    id: 'MS', 
    name: 'Multistakeholder engagement and open consultations', 
    category: 'LEGISLATING',
    description: 'Inclusive processes for developing platform regulations',
    context: 'Ensures diverse perspectives are considered in regulatory frameworks.'
  },
  {
    id: 'EM', 
    name: 'Enforcement mechanisms', 
    category: 'LEGISLATING',
    description: 'Tools for ensuring compliance with regulations',
    context: 'Provides teeth to regulatory frameworks and ensures implementation.'
  },
  {
    id: 'PBS', 
    name: 'Platform-based, algorithmic "self-regulation"', 
    category: 'LEGISLATING',
    description: 'Internal governance systems of platforms',
    context: 'Covers how platforms design and implement their own rules and systems.'
  },
  {
    id: 'SAG', 
    name: 'Strengthening accountability of DP', 
    category: 'LEGISLATING',
    description: 'Mechanisms to hold digital platforms accountable',
    context: 'Ensures platforms bear responsibility for their actions and impacts.'
  },
  {
    id: 'TSB', 
    name: 'Technical standard-based governance', 
    category: 'LEGISLATING',
    description: 'Regulation through technical standards and protocols',
    context: 'Provides objective benchmarks for platform operations and design.'
  },
  {
    id: 'RG', 
    name: 'Regulatory Human Rights Risk Assessment', 
    category: 'LEGISLATING',
    description: 'Evaluation of human rights impacts of regulatory approaches',
    context: 'Ensures regulations themselves don\'t create new rights issues.'
  },

  // Human Rights and Rule of Law
  {
    id: 'FG', 
    name: 'Future Generation from UN GDC', 
    category: 'HUMAN_RIGHTS',
    description: 'Consideration of impacts on future generations',
    context: 'Long-term perspective in platform governance decisions.'
  },
  {
    id: 'WB', 
    name: 'Whistleblowers and Rights Defenders', 
    category: 'HUMAN_RIGHTS',
    description: 'Protection for those who expose wrongdoing',
    context: 'Crucial for transparency and accountability in platform governance.'
  },
  {
    id: 'TP', 
    name: 'Tackling Power Asymmetries', 
    category: 'HUMAN_RIGHTS',
    description: 'Addressing power imbalances between platforms and users',
    context: 'Essential for equitable digital ecosystem.'
  },
  {
    id: 'DD', 
    name: 'Decolonizing Data Approach', 
    category: 'HUMAN_RIGHTS',
    description: 'Addressing historical inequities in data governance',
    context: 'Ensures cultural diversity and representativeness in data systems.'
  },
  {
    id: 'IHR', 
    name: 'Independent Human Rights Monitoring', 
    category: 'HUMAN_RIGHTS',
    description: 'Third-party monitoring of rights impacts',
    context: 'Provides external validation of rights compliance.'
  },
  {
    id: 'FB', 
    name: 'Freedom of religion and belief', 
    category: 'HUMAN_RIGHTS',
    description: 'Protection of religious freedom in digital spaces',
    context: 'Ensures respect for diverse beliefs online.'
  },
  {
    id: 'DF', 
    name: 'Digital Fairness', 
    category: 'HUMAN_RIGHTS',
    description: 'Equitable treatment across digital services',
    context: 'Addresses discriminatory practices in platform design and operation.'
  },
  {
    id: 'FE', 
    name: 'Freedom of expression', 
    category: 'HUMAN_RIGHTS',
    description: 'Protection of speech rights online',
    context: 'Balances free expression with other rights and responsibilities.'
  },

  // Content governance
  {
    id: 'MIL', 
    name: 'MIL & AIL', 
    category: 'CONTENT',
    description: 'Media, Information and Algorithmic Literacy',
    context: 'Empowers users to critically engage with digital content.'
  },
  {
    id: 'SF', 
    name: 'Safety features', 
    category: 'CONTENT',
    description: 'Design elements that enhance user safety',
    context: 'Protective measures built into platform architecture.'
  },
  {
    id: 'CMA', 
    name: 'Content moderation actors', 
    category: 'CONTENT',
    description: 'Entities involved in content moderation processes',
    context: 'Includes both human moderators and automated systems.'
  },
  {
    id: 'CHE', 
    name: 'Counter hate escalation', 
    category: 'CONTENT',
    description: 'Measures to prevent amplification of harmful content',
    context: 'Addresses viral spread of hateful content.'
  },
  {
    id: 'EC', 
    name: 'Escalation channels', 
    category: 'CONTENT',
    description: 'Pathways for reporting and addressing harmful content',
    context: 'Ensures users can flag problematic content for review.'
  },
  {
    id: 'RS', 
    name: 'Regulating recommender system', 
    category: 'CONTENT',
    description: 'Oversight of algorithmic content recommendation',
    context: 'Addresses how platforms select and amplify certain content.'
  },
  {
    id: 'MP', 
    name: 'Media prominence', 
    category: 'CONTENT',
    description: 'Visibility of quality media content',
    context: 'Promotes reliable information sources in platform ecosystems.'
  },
  {
    id: 'PI', 
    name: 'Public interest information', 
    category: 'CONTENT',
    description: 'Access to information of public significance',
    context: 'Ensures availability of societally important information.'
  },
  {
    id: 'NDC', 
    name: 'Non-discrimination', 
    category: 'CONTENT',
    description: 'Prevention of discriminatory content practices',
    context: 'Ensures equal treatment across different user groups.'
  },
  {
    id: 'MC', 
    name: 'Must Carry', 
    category: 'CONTENT',
    description: 'Obligations to distribute certain content',
    context: 'Requirements to include specific content categories.'
  },

  // Systemic risks +due diligence
  {
    id: 'DAA', 
    name: 'Data Access for Academia / CSOs/Public', 
    category: 'SYSTEMIC',
    description: 'Research access to platform data',
    context: 'Enables independent assessment of platform impacts.'
  },
  {
    id: 'MTT', 
    name: 'Multi-tier transparency: Agency rating', 
    category: 'SYSTEMIC',
    description: 'Layered transparency requirements with independent evaluation',
    context: 'Adapts disclosure levels to different stakeholder needs.'
  },
  {
    id: 'DDC', 
    name: 'Due diligence in times of crisis / protection of critical voices', 
    category: 'SYSTEMIC',
    description: 'Enhanced care during societal disruptions',
    context: 'Special protections during high-risk periods.'
  },
  {
    id: 'MFDD', 
    name: 'Media freedom due diligence obligations', 
    category: 'SYSTEMIC',
    description: 'Special protections for journalism',
    context: 'Safeguards media independence and reporting capacity.'
  },
  {
    id: 'MBR', 
    name: 'Media Bargaining Power redress', 
    category: 'SYSTEMIC',
    description: 'Fair compensation mechanisms for news content',
    context: 'Addresses economic sustainability of journalism.'
  },
  {
    id: 'SR', 
    name: 'Systemic risks (human rights, rule of law, democracy)', 
    category: 'SYSTEMIC',
    description: 'Assessment of broader societal impacts',
    context: 'Examines how platforms affect fundamental social systems.'
  },
  {
    id: 'HRC', 
    name: 'Human rights compliance', 
    category: 'SYSTEMIC',
    description: 'Alignment with international human rights standards',
    context: 'Ensures platforms respect established rights frameworks.'
  },
  {
    id: 'T2', 
    name: 'Human rights compliance T2', 
    category: 'SYSTEMIC',
    description: 'Additional compliance measures',
    context: 'Further human rights implementation strategies.'
  },

  // Pro-social design
  {
    id: 'DPI', 
    name: 'Digital Public Infrastructures', 
    category: 'PROSOCIAL',
    description: 'Public digital systems and services',
    context: 'Digital commons that serve public interest.'
  },
  {
    id: 'LD', 
    name: 'Language & inclusive design', 
    category: 'PROSOCIAL',
    description: 'Accessible design for diverse users',
    context: 'Ensures platforms are usable by all population groups.'
  },
  {
    id: 'EOP', 
    name: 'Encryption and online safety protection', 
    category: 'PROSOCIAL',
    description: 'Security measures for user protection',
    context: 'Balances privacy protection with safety considerations.'
  },
  {
    id: 'OAI', 
    name: 'Open access, interoperability, platform and network neutrality', 
    category: 'PROSOCIAL',
    description: 'Standards for open digital ecosystems',
    context: 'Prevents closed systems and promotes competition.'
  },
  {
    id: 'DDP', 
    name: 'Datafication & data minimization policy', 
    category: 'PROSOCIAL',
    description: 'Principles for responsible data collection',
    context: 'Limits unnecessary data harvesting and processing.'
  },
  {
    id: 'APT', 
    name: 'Algo plurality, transparency', 
    category: 'PROSOCIAL',
    description: 'Diverse and transparent algorithmic systems',
    context: 'Prevents homogenization of digital experiences.'
  },
  {
    id: 'PC', 
    name: 'Product Compliance', 
    category: 'PROSOCIAL',
    description: 'Adherence to product standards',
    context: 'Ensures digital products meet regulatory requirements.'
  },
  {
    id: 'EBD', 
    name: 'Ethical by Design', 
    category: 'PROSOCIAL',
    description: 'Incorporation of ethics from initial design stages',
    context: 'Proactive approach to ethical platform development.'
  },
  {
    id: 'UA', 
    name: 'User agency', 
    category: 'PROSOCIAL',
    description: 'User control over digital experiences',
    context: 'Empowers individuals in their platform interactions.'
  },
  {
    id: 'UE', 
    name: 'User empowerment', 
    category: 'PROSOCIAL',
    description: 'Tools and features that enhance user capabilities',
    context: 'Provides users with means to exercise their rights effectively.'
  }
];

// Le composant AdminInitializeButton
const AdminInitializeButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Fonction pour effacer tous les documents de la collection
  const clearCollection = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'globaltoolkit'));

      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);
      console.log(`Cleared ${deletePromises.length} documents from globaltoolkit`);
      return deletePromises.length;
    } catch (error) {
      console.error(`Error clearing collection:`, error);
      throw error;
    }
  };

  // Fonction pour ajouter les données à la collection
  const populateCollection = async () => {
    try {
      const collectionRef = collection(db, 'globaltoolkit');

      const addPromises = TOOLKIT_DATA.map(item => {
        const docData = {
          ...item,
          examples: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        return addDoc(collectionRef, docData);
      });

      const results = await Promise.all(addPromises);
      console.log(`Added ${results.length} documents to globaltoolkit`);
      return results.length;
    } catch (error) {
      console.error(`Error populating collection:`, error);
      throw error;
    }
  };

  // Gestionnaire de clic pour initialiser les données
  const handleInitialize = async () => {
    if (window.confirm('Cette action va réinitialiser toutes les données du tableau périodique de régulation des plateformes. Êtes-vous sûr de vouloir continuer ?')) {
      try {
        setIsLoading(true);
        setStatus('Suppression des données existantes...');

        const deletedCount = await clearCollection();
        setStatus(`${deletedCount} éléments supprimés. Ajout des nouvelles données...`);

        const addedCount = await populateCollection();
        setStatus(`Initialisation terminée ! ${addedCount} éléments ajoutés.`);

        // Recharger la page après 3 secondes
        setTimeout(() => {
          window.location.reload();
        }, 3000);

      } catch (error) {
        console.error('Error during initialization:', error);
        setStatus(`Erreur : ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Administration du tableau périodique</h3>
      <p className="text-sm text-gray-600 mb-4">
        Utilisez ce bouton pour initialiser ou réinitialiser les données du tableau périodique de régulation des plateformes.
        <strong className="ml-2 text-red-600">Attention</strong> : Cette action effacera toutes les données existantes.
      </p>

      <button
        onClick={handleInitialize}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-700 text-white'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Initialisation en cours...
          </span>
        ) : (
          'Initialiser / Réinitialiser les données'
        )}
      </button>

      {status && (
        <div className={`mt-3 p-2 rounded ${status.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AdminInitializeButton;