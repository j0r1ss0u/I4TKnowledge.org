import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { documentsService } from '../../../services/documentsService';
import { AlertCircle, CheckCircle2, Search, Download, Save, X, Loader2 } from 'lucide-react';
import I4TKdocTokenArtifact from '../../../config/contracts/I4TKdocToken.json';
import contractAddresses from '../../../config/contracts/addresses.json';

const currentChainId = import.meta.env.VITE_CHAIN_ID || '11155111';
const docTokenAddress = contractAddresses[currentChainId]?.I4TKdocToken;

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

const resolveERC1155URI = (uri, tokenId) => {
  if (!uri) return uri;
  const hexId = BigInt(tokenId).toString(16).padStart(64, '0');
  return uri.replace('{id}', hexId);
};

export default function RecoverMissingDocument({ onClose, onSuccess }) {
  const [tokenId, setTokenId] = useState('');
  const [searchedTokenId, setSearchedTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ipfsData, setIpfsData] = useState(null);
  const [resolvedURI, setResolvedURI] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    description: '',
    programme: '',
    collection: '',
    categories: [],
    references: '',
    creatorAddress: ''
  });

  const { data: tokenURI, isLoading: isLoadingURI } = useReadContract({
    address: docTokenAddress,
    abi: I4TKdocTokenArtifact.abi,
    functionName: 'uri',
    args: searchedTokenId ? [BigInt(searchedTokenId)] : undefined,
    enabled: !!searchedTokenId
  });

  useEffect(() => {
    if (tokenURI && searchedTokenId) {
      const resolved = resolveERC1155URI(tokenURI, searchedTokenId);
      setResolvedURI(resolved);
      setLoading(false);
      console.log('Token URI resolved:', resolved);
    }
  }, [tokenURI, searchedTokenId]);

  const handleSearch = async () => {
    if (!tokenId || isNaN(parseInt(tokenId))) {
      setError('Veuillez entrer un Token ID valide');
      return;
    }

    setError('');
    setSuccess('');
    setResolvedURI(null);
    setLoading(true);

    try {
      const existingDoc = await documentsService.getDocumentByTokenId(tokenId);
      if (existingDoc) {
        setError(`Ce document (Token ID ${tokenId}) existe déjà dans Firebase avec l'ID: ${existingDoc.id}`);
        setLoading(false);
        return;
      }

      setSearchedTokenId(tokenId);
    } catch (err) {
      console.error('Error searching token:', err);
      setError('Erreur lors de la recherche: ' + err.message);
      setLoading(false);
    }
  };

  const handleFetchIPFS = async () => {
    const uriToUse = resolvedURI || tokenURI;
    if (!uriToUse) {
      setError('Aucun URI trouvé pour ce token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let ipfsCid = uriToUse;
      if (uriToUse.startsWith('ipfs://')) {
        ipfsCid = uriToUse.replace('ipfs://', '');
      }

      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
      console.log('Fetching from IPFS:', gatewayUrl);

      const response = await fetch(gatewayUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });

      setFormData(prev => ({
        ...prev,
        ipfsCid: ipfsCid
      }));

      setIpfsData({ cid: ipfsCid, url: gatewayUrl });
      setSuccess(`CID IPFS récupéré: ${ipfsCid}`);
    } catch (err) {
      console.error('Error fetching IPFS:', err);
      setError('Erreur lors de la récupération IPFS: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.authors || !formData.programme) {
      setError('Veuillez remplir les champs requis: Titre, Auteurs, Programme');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const docData = {
        tokenId: searchedTokenId.toString(),
        ipfsCid: formData.ipfsCid || resolvedURI || tokenURI || '',
        title: formData.title,
        authors: formData.authors,
        description: formData.description,
        programme: formData.programme,
        collection: formData.collection,
        categories: formData.categories,
        references: formData.references,
        creatorAddress: formData.creatorAddress,
        validationStatus: "0/4",
        recoveredManually: true,
        recoveredAt: new Date().toISOString()
      };

      const newDocId = await documentsService.addDocument(docData);
      setSuccess(`Document récupéré avec succès! ID Firebase: ${newDocId}`);
      
      if (onSuccess) {
        onSuccess(newDocId);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error('Error saving document:', err);
      setError('Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Récupérer un Document Manquant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">1. Rechercher le Token sur la Blockchain</h3>
            <div className="flex gap-3">
              <input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Token ID (ex: 137)"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading || isLoadingURI}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400"
              >
                {loading || isLoadingURI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Rechercher
              </button>
            </div>

            {(resolvedURI || tokenURI) && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Token URI trouvé:</strong> {resolvedURI || tokenURI}
                </p>
                {resolvedURI && resolvedURI !== tokenURI && (
                  <p className="text-xs text-blue-600 mt-1">
                    (URI original avec template {'{id}'} résolu)
                  </p>
                )}
                <button
                  onClick={handleFetchIPFS}
                  disabled={loading}
                  className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  <Download className="w-4 h-4" />
                  Récupérer depuis IPFS
                </button>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-800">2. Métadonnées du Document</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CID IPFS *</label>
              <input
                type="text"
                value={formData.ipfsCid || resolvedURI || tokenURI || ''}
                onChange={(e) => handleInputChange('ipfsCid', e.target.value)}
                placeholder="QmXxx... ou bafybei..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titre du document"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auteurs *</label>
              <input
                type="text"
                value={formData.authors}
                onChange={(e) => handleInputChange('authors', e.target.value)}
                placeholder="Auteur(s) du document"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du document"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programme *</label>
              <select
                value={formData.programme}
                onChange={(e) => handleInputChange('programme', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un programme</option>
                {PROGRAMMES.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
              <input
                type="text"
                value={formData.collection}
                onChange={(e) => handleInputChange('collection', e.target.value)}
                placeholder="Collection (optionnel)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.categories.includes(cat)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Créateur</label>
              <input
                type="text"
                value={formData.creatorAddress}
                onChange={(e) => handleInputChange('creatorAddress', e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Références (Token IDs séparés par virgules)</label>
              <input
                type="text"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder="ex: 10, 25, 42"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !searchedTokenId}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Sauvegarder dans Firebase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
