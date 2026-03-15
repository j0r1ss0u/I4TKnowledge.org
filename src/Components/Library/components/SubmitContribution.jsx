import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '../../../config/wagmiConfig';
import { documentsService } from '../../../services/documentsService';
import { useAuth } from '../../AuthContext';
import ReferencesSelector from './ReferencesSelector';
import DocumentUpload from './DocumentUpload';
import WalletConnect from '../WalletConnect';
import { X, Shield, Users, Coins, Globe, MessageCircle, Search, GitBranch, Wallet } from 'lucide-react';
import libraryTranslations from '../../../translations/library';

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

// =============== PEER REVIEW BENEFITS MODAL ===============
const Web3BenefitsModal = ({ onClose, l }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-start p-6 pb-4 border-b">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{l.benefitsTitle}</h3>
          <p className="text-sm text-gray-500 mt-1">{l.benefitsSubtitle}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-6 space-y-5">
        <div className="flex gap-3">
          <Coins className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">{l.benefitsGovernanceTitle}</p>
            <p className="text-sm text-gray-600 mt-1">{l.benefitsGovernanceDesc}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">{l.benefitsPeerTitle}</p>
            <p className="text-sm text-gray-600 mt-1">{l.benefitsPeerDesc}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Search className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">{l.benefitsTraceTitle}</p>
            <p className="text-sm text-gray-600 mt-1">{l.benefitsTraceDesc}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <GitBranch className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">{l.benefitsGenealogy}</p>
            <p className="text-sm text-gray-600 mt-1">{l.benefitsGenealogyDesc}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Shield className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">{l.benefitsImmutable}</p>
            <p className="text-sm text-gray-600 mt-1">{l.benefitsImmutableDesc}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Wallet className="w-6 h-6 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">{l.benefitsWalletTitle}</p>
              <p className="text-sm text-blue-800 mt-1">{l.benefitsWalletDesc}</p>
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 underline">
                <Wallet className="w-4 h-4" /> {l.downloadMetamask}
              </a>
              <p className="text-sm text-blue-800 mt-3">{l.benefitsWalletSend}</p>
              <a href="mailto:joris.galea@i4tknowledge.net"
                className="inline-block mt-1 text-sm font-medium text-blue-700 hover:text-blue-900 underline">
                joris.galea@i4tknowledge.net
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <button onClick={onClose} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          {l.understood}
        </button>
      </div>
    </div>
  </div>
);

// =============== SUBMISSION CHOICE MODAL ===============
const ChoiceModal = ({ onCentralized, onWeb3, onClose, address, showBenefits, setShowBenefits, l }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    {showBenefits && <Web3BenefitsModal onClose={() => setShowBenefits(false)} l={l} />}
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-900">{l.choiceTitle}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">{l.choiceSubtitle}</p>

      <div className="border-2 border-blue-200 rounded-xl p-5 mb-4 hover:border-blue-400 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            {l.choicePeerReviewTitle}
          </h4>
          <button onClick={() => setShowBenefits(true)} className="text-xs text-blue-600 hover:underline flex-shrink-0 ml-2">
            {l.learnMore}
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">{l.choicePeerReviewDesc}</p>
        {address ? (
          <button onClick={onWeb3} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            {l.submitViaPeerReview}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-600 font-medium">{l.walletRequired}</p>
            <WalletConnect />
          </div>
        )}
      </div>

      <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors">
        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          {l.choiceAdminTitle}
        </h4>
        <p className="text-sm text-gray-600 mb-4">{l.choiceAdminDesc}</p>
        <button onClick={onCentralized} className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium text-sm">
          {l.submitForAdmin}
        </button>
      </div>
    </div>
  </div>
);

// =============== NETWORK HELP ===============
const NetworkHelp = ({ l }) => (
  <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
    <h3 className="font-medium mb-2">{l.needSepoliaTitle}</h3>
    <p>{l.needSepoliaDesc}</p>
    <ol className="list-decimal ml-4 mt-2 space-y-1">
      <li>{l.faucetStep1}</li>
      <li>{l.faucetStep2}</li>
      <li>{l.faucetStep3}</li>
    </ol>
    <p className="mt-2">
      <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
        {l.getSepoliaETH}
      </a>
    </p>
  </div>
);

// =============== MAIN COMPONENT ===============
export default function SubmitContribution() {
  const { address } = useAccount();
  const { user, language } = useAuth();
  const l = libraryTranslations[language] || libraryTranslations.en;
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
          setError(l.tokenIdWarning.replace('{txHash}', txHash));
        }
      } catch (err) {
        setError(l.processingError + (err.message || l.submissionError));
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
      setError(l.fieldRequired);
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
      setError(l.centralizedError + (err.message || l.submissionError));
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
      setError(l.insufficientFunds);
      setShowNetworkHelp(true);
    } else if (err.message?.includes('user rejected transaction')) {
      setError(l.txRejected);
    } else {
      setError(err.message || l.submissionError);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{l.successTitle}</h2>
        <p className="text-gray-600 mb-4">{l.successDesc}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
          <p className="text-amber-800 font-medium flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            {l.successSignalPrompt}
          </p>
          <a
            href="https://signal.group/#CjQKIPuudWjmIbqGx1NrlpFZDzlG17YZWZ9R0Xc9wnul89JxEhCfnCj_SDjdFNThh265jRkm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 text-sm underline break-all"
          >
            https://signal.group/#CjQKIPuudWjmIbqGx1NrlpFZDzlG17YZWZ9R0Xc9wnul89JxEhCfnCj_SDjdFNThh265jRkm
          </a>
          <p className="text-amber-700 text-sm mt-2">{l.successSignalNote}</p>
        </div>
        <button
          onClick={() => setCentralizedSuccess(false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {l.submitAnother}
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
          l={l}
        />
      )}

      <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-serif mb-2">{l.submitPageTitle}</h2>
          <p className="text-sm text-gray-500 mb-6">{l.submitPageSubtitle}</p>

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
                <p>{isTxPending ? l.txInProgress : l.txSubmitted}...</p>
                {txHash && (
                  <div className="text-sm mt-2">
                    {l.txHashLabel}
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
                {l.peerReviewSuccess}
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
                  {l.fieldTitle}<span className="text-red-500">*</span>
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
                  {l.fieldAuthors}<span className="text-red-500">*</span>
                </label>
                <input
                  id="authors"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.authors}
                  onChange={e => setFormData({...formData, authors: e.target.value})}
                  placeholder={l.fieldAuthorsSeparator}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  {l.fieldDescription}
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
                  {l.fieldProgramme}<span className="text-red-500">*</span>
                </label>
                <select
                  id="programme"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.programme}
                  onChange={e => setFormData({...formData, programme: e.target.value})}
                  required
                >
                  <option value="">{l.selectProgramme}</option>
                  {PROGRAMMES.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              {/* Collection */}
              <div>
                <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
                  {l.fieldCollection}
                </label>
                <select
                  id="collection"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.collection}
                  onChange={e => setFormData({...formData, collection: e.target.value})}
                >
                  <option value="">{l.selectCollection}</option>
                  {COLLECTIONS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{l.fieldCategories}</label>
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
                <label className="block text-sm font-medium text-gray-700">{l.fieldGeography}</label>
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
                <p className="text-xs text-gray-500 mt-1">{l.geographyNote}</p>
              </div>

              {/* References */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{l.fieldReferences}</label>
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
              {isTxPending ? l.submittingBtn : l.submitBtn}
            </button>
          </form>

          {showNetworkHelp && <NetworkHelp l={l} />}
        </div>
      </div>
    </>
  );
}
