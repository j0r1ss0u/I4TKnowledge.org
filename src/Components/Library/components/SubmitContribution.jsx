import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '../../../config/wagmiConfig';
import { documentsService } from '../../../services/documentsService';
import { useAuth } from '../../AuthContext';
import ReferencesSelector from './ReferencesSelector';
import DocumentUpload from './DocumentUpload';
import WalletConnect from '../WalletConnect';
import { X, Shield, Users, Coins, Globe, MessageCircle } from 'lucide-react';

// =============== CONSTANTS ===============
const PROGRAMMES = [
  "I4TK Opteam",
  "Platform Governance",
  "Disinformation & Fact-checking",
  "Digital Rights & Inclusion",
  "Technology & Social Cohesion"
];

const CATEGORIES = [
  "Guidelines",
  "Research Paper",
  "Case Study",
  "Policy Brief",
  "Technical Report",
  "Press Release",
  "Terms of Reference",
  "Internal document"
];

const COLLECTIONS = [
  "Science Summit",
  "Collection 2",
  "Collection 3"
];

const GEOGRAPHIES = [
  "EUROPE",
  "MIDDLE EAST",
  "AFRICA",
  "LATAM",
  "ASIA",
  "OCEANIA",
  "NORTH AMERICA"
];

// =============== WEB3 BENEFITS MODAL ===============
const Web3BenefitsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">Pourquoi le peer review ?</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">Enregistrement immuable</p>
            <p className="text-sm text-gray-600">Votre contribution est inscrite de façon permanente sur la blockchain Sepolia — elle ne peut pas être modifiée ou supprimée.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">Peer review décentralisé</p>
            <p className="text-sm text-gray-600">4 validateurs indépendants examinent votre document avant publication. Ce processus garantit la qualité sans dépendre d'une autorité centrale.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Coins className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">Distribution de tokens</p>
            <p className="text-sm text-gray-600">À la publication, des tokens I4TK sont distribués : 40 % au créateur, 60 % répartis entre les documents référencés — récompensant l'ensemble du réseau de connaissance.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Globe className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">Gouvernance transparente</p>
            <p className="text-sm text-gray-600">Toutes les décisions de validation sont traçables et vérifiables publiquement. Aucune décision arbitraire.</p>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Compris
      </button>
    </div>
  </div>
);

// =============== SUBMISSION CHOICE MODAL ===============
const ChoiceModal = ({ onCentralized, onWeb3, onClose, address, showBenefits, setShowBenefits }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    {showBenefits && <Web3BenefitsModal onClose={() => setShowBenefits(false)} />}
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-900">Choisir le mode de soumission</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Comment souhaitez-vous soumettre votre contribution ?</p>

      {/* Web3 Option */}
      <div className="border-2 border-blue-200 rounded-xl p-5 mb-4 hover:border-blue-400 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Peer review (recommandé)
          </h4>
          <button
            onClick={() => setShowBenefits(true)}
            className="text-xs text-blue-600 hover:underline flex-shrink-0 ml-2"
          >
            En savoir plus →
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Votre document est enregistré sur la blockchain et soumis à la révision par les pairs. 4 validateurs devront l'approuver avant publication.
        </p>
        {address ? (
          <button
            onClick={onWeb3}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Soumettre via peer review
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-600 font-medium">Un wallet doit être connecté pour ce chemin.</p>
            <WalletConnect />
          </div>
        )}
      </div>

      {/* Admin Validation Option */}
      <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors">
        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          Admin validation
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Votre document est soumis en attente de validation par un administrateur I4TK. Une fois approuvé, un admin procédera à sa publication.
        </p>
        <button
          onClick={onCentralized}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium text-sm"
        >
          Soumettre pour admin validation
        </button>
      </div>
    </div>
  </div>
);

// =============== NETWORK HELP ===============
const NetworkHelp = () => (
  <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
    <h3 className="font-medium mb-2">Besoin d'ETH Sepolia ?</h3>
    <p>Pour soumettre un document, vous avez besoin d'ETH sur le réseau de test Sepolia. Voici comment en obtenir :</p>
    <ol className="list-decimal ml-4 mt-2 space-y-1">
      <li>Visitez le faucet Sepolia (Alchemy ou Infura)</li>
      <li>Entrez votre adresse de portefeuille</li>
      <li>Recevez des ETH de test gratuits</li>
    </ol>
    <p className="mt-2">
      <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
        Obtenir des ETH Sepolia →
      </a>
    </p>
  </div>
);

// =============== MAIN COMPONENT ===============
export default function SubmitContribution() {
  const { address } = useAccount();
  const { user } = useAuth();
  const { writeContractAsync } = useWriteContract();

  // Modal states
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  // Submission states
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [processingReceipt, setProcessingReceipt] = useState(false);
  const [showNetworkHelp, setShowNetworkHelp] = useState(false);
  const [centralizedSuccess, setCentralizedSuccess] = useState(false);

  const { data: receipt, isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash
  });

  // =============== FORM STATE ===============
  const [formData, setFormData] = useState({
    ipfsCid: '',
    title: '',
    authors: '',
    description: '',
    programme: '',
    collection: '',
    categories: [],
    geographies: [...GEOGRAPHIES],
    references: ''
  });

  // =============== METADATA HANDLER ===============
  const handleMetadataExtracted = (metadata) => {
    setFormData(prev => ({
      ...prev,
      ipfsCid: metadata.ipfsCid || prev.ipfsCid,
      title: metadata.title || prev.title,
      description: metadata.description || prev.description || ''
    }));
  };

  // =============== TOKEN ID EXTRACTION ===============
  const extractTokenIdFromEvent = (logs) => {
    for (const log of logs) {
      if (log.topics && log.topics.length >= 3) {
        const potentialId = parseInt(log.topics[2], 16);
        if (!isNaN(potentialId) && potentialId > 0) return potentialId;
      }
    }
    for (const log of logs) {
      if (log.data && log.data.length >= 66) {
        const potentialId = parseInt(log.data.substring(2, 66), 16);
        if (!isNaN(potentialId) && potentialId > 0 && potentialId < 1000) return potentialId;
      }
    }
    return null;
  };

  // =============== RECEIPT PROCESSING ===============
  useEffect(() => {
    const processTransactionReceipt = async () => {
      if (!receipt || !isTxSuccess || processingReceipt) return;
      try {
        setProcessingReceipt(true);
        const tokenId = extractTokenIdFromEvent(receipt.logs);
        const docData = {
          ...formData,
          creatorAddress: address,
          transactionHash: txHash,
          tokenId: tokenId !== null ? tokenId.toString() : `PENDING_${txHash.slice(0, 10)}`,
          validationStatus: "0/4",
          submissionPath: 'web3',
          createdAt: new Date().toISOString(),
          ...(tokenId === null && { tokenIdPending: true })
        };
        const newDocId = await documentsService.addDocument(docData);
        setDocumentId(newDocId);
        if (tokenId !== null) {
          resetForm();
        } else {
          setError('Document sauvegardé mais le tokenId n\'a pas pu être extrait automatiquement. Transaction hash: ' + txHash + '. Veuillez contacter un administrateur.');
        }
      } catch (err) {
        setError('Erreur lors du traitement: ' + (err.message || 'Erreur inconnue'));
      } finally {
        setProcessingReceipt(false);
      }
    };
    processTransactionReceipt();
  }, [receipt, isTxSuccess, processingReceipt, address, formData, txHash]);

  // =============== FORM VALIDATION & MODAL TRIGGER ===============
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.ipfsCid || !formData.title || !formData.authors || !formData.programme) {
      setError('Veuillez remplir tous les champs requis (document, titre, auteurs, programme).');
      return;
    }
    setShowChoiceModal(true);
  };

  // =============== CENTRALIZED SUBMISSION ===============
  const handleCentralizedSubmit = async () => {
    try {
      setShowChoiceModal(false);
      const docData = {
        ...formData,
        creatorAddress: user?.email || user?.uid || 'unknown',
        validationStatus: "PENDING_ADMIN_VALIDATION",
        submissionPath: 'admin-validation',
        createdAt: new Date().toISOString()
      };
      await documentsService.addDocument(docData);
      setCentralizedSuccess(true);
      resetForm();
    } catch (err) {
      setError('Erreur lors de la soumission centralisée : ' + (err.message || 'Erreur inconnue'));
    }
  };

  // =============== WEB3 SUBMISSION ===============
  const handleWeb3Submit = async () => {
    setShowChoiceModal(false);
    try {
      setError('');
      setTxHash(null);
      setShowNetworkHelp(false);
      const references = formData.references
        ? formData.references.split(',').map(ref => parseInt(ref.trim()))
        : [];
      const hash = await writeContractAsync({
        ...contractConfig,
        functionName: 'proposeContent',
        args: [formData.ipfsCid, references],
      });
      setTxHash(hash);
    } catch (err) {
      handleError(err);
    }
  };

  // =============== ERROR HANDLING ===============
  const handleError = async (err) => {
    if (documentId) {
      try { await documentsService.updateDocumentStatus(documentId, 'FAILED'); } catch (_) {}
    }
    if (err.message?.includes('insufficient funds')) {
      setError('Fonds insuffisants. Vous avez besoin d\'ETH Sepolia pour les frais de gas.');
      setShowNetworkHelp(true);
    } else if (err.message?.includes('user rejected transaction')) {
      setError('Transaction annulée par l\'utilisateur.');
    } else {
      setError(err.message || 'Une erreur est survenue lors de la soumission');
    }
  };

  // =============== UTILITY FUNCTIONS ===============
  const resetForm = () => {
    setFormData({
      ipfsCid: '',
      title: '',
      authors: '',
      description: '',
      programme: '',
      collection: '',
      categories: [],
      geographies: [...GEOGRAPHIES],
      references: ''
    });
    setTxHash(null);
    setDocumentId(null);
    setError('');
    setShowNetworkHelp(false);
  };

  const toggleGeography = (geo) => {
    setFormData(prev => ({
      ...prev,
      geographies: prev.geographies.includes(geo)
        ? prev.geographies.filter(g => g !== geo)
        : [...prev.geographies, geo]
    }));
  };

  // =============== CENTRALIZED SUCCESS SCREEN ===============
  if (centralizedSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Contribution soumise !</h2>
        <p className="text-gray-600 mb-4">
          Votre document a été soumis avec succès et est en attente d'admin validation.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
          <p className="text-amber-800 font-medium flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            Please introduce your submission to the Network via Signal
          </p>
          <a
            href="https://signal.group/#CjQKIPuudWjmIbqGx1NrlpFZDzlG17YZWZ9R0Xc9wnul89JxEhCfnCj_SDjdFNThh265jRkm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 text-sm underline break-all"
          >
            https://signal.group/#CjQKIPuudWjmIbqGx1NrlpFZDzlG17YZWZ9R0Xc9wnul89JxEhCfnCj_SDjdFNThh265jRkm
          </a>
          <p className="text-amber-700 text-sm mt-2">
            Once approved, an admin will proceed to its publication.
          </p>
        </div>
        <button
          onClick={() => setCentralizedSuccess(false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Soumettre une autre contribution
        </button>
      </div>
    );
  }

  // =============== MAIN RENDER ===============
  return (
    <>
      {showChoiceModal && (
        <ChoiceModal
          onClose={() => setShowChoiceModal(false)}
          onCentralized={handleCentralizedSubmit}
          onWeb3={handleWeb3Submit}
          address={address}
          showBenefits={showBenefitsModal}
          setShowBenefits={setShowBenefitsModal}
        />
      )}

      <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-serif mb-2">Soumettre du contenu pour révision I4TK</h2>
          <p className="text-sm text-gray-500 mb-6">
            Remplissez le formulaire ci-dessous. Au moment de la soumission, vous pourrez choisir entre le processus de peer review ou une admin validation.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Transaction Status */}
            {(txHash || isTxPending) && (
              <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
                <p>Transaction {isTxPending ? 'en cours' : 'soumise'}...</p>
                {txHash && (
                  <div className="text-sm mt-2">
                    Hash de transaction :
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 break-all"
                    >
                      {txHash}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Peer Review Success */}
            {isTxSuccess && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                Document soumis avec succès via peer review !
              </div>
            )}

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Document PDF
              </label>
              <DocumentUpload onMetadataExtracted={handleMetadataExtracted} />
            </div>

            <div className="space-y-4">
              {/* IPFS CID */}
              <div>
                <label htmlFor="ipfsCid" className="block text-sm font-medium text-gray-700">
                  CID IPFS<span className="text-red-500">*</span>
                </label>
                <input
                  id="ipfsCid"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.ipfsCid}
                  readOnly
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre<span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              {/* Authors */}
              <div>
                <label htmlFor="authors" className="block text-sm font-medium text-gray-700">
                  Auteurs<span className="text-red-500">*</span>
                </label>
                <input
                  id="authors"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.authors}
                  onChange={e => setFormData({...formData, authors: e.target.value})}
                  placeholder="Entrez les auteurs séparés par des virgules"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Programme */}
              <div>
                <label htmlFor="programme" className="block text-sm font-medium text-gray-700">
                  Programme<span className="text-red-500">*</span>
                </label>
                <select
                  id="programme"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.programme}
                  onChange={e => setFormData({...formData, programme: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un programme</option>
                  {PROGRAMMES.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              {/* Collection */}
              <div>
                <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
                  Collection
                </label>
                <select
                  id="collection"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.collection}
                  onChange={e => setFormData({...formData, collection: e.target.value})}
                >
                  <option value="">Sélectionner une collection (optionnel)</option>
                  {COLLECTIONS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Catégories</label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {CATEGORIES.map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            categories: e.target.checked
                              ? [...formData.categories, category]
                              : formData.categories.filter(c => c !== category)
                          });
                        }}
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Geographies */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Zone géographique</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {GEOGRAPHIES.map(geo => (
                    <label key={geo} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={formData.geographies.includes(geo)}
                        onChange={() => toggleGeography(geo)}
                      />
                      <span className="text-sm text-gray-700">{geo}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Toutes les régions sont sélectionnées par défaut. Décochez les régions non concernées.</p>
              </div>

              {/* References */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Références bibliographiques</label>
                <div className="mt-1">
                  <ReferencesSelector
                    value={formData.references}
                    onChange={(newRefs) => setFormData({...formData, references: newRefs})}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isTxPending}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTxPending ? 'Soumission en cours...' : 'Soumettre la contribution →'}
            </button>
          </form>

          {showNetworkHelp && <NetworkHelp />}
        </div>
      </div>
    </>
  );
}
