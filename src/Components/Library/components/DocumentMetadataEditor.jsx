import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';
import { globaltoolkitService } from '../../../services/globaltoolkitService';
import { autoTaggingService } from '../../../services/autoTaggingService';
import { Save, X, Tag, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import ui from '../../../translations/ui';

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

const CATEGORY_NAMES = {
  INSTITUTIONAL: 'Institutional framework',
  LEGISLATING: 'Legislating platforms',
  HUMAN_RIGHTS: 'Human Rights and Rule of Law',
  CONTENT: 'Content governance',
  SYSTEMIC: 'Systemic risks +due diligence',
  PROSOCIAL: 'Pro-social design'
};

const DocumentMetadataEditor = ({ document, onClose, onSave }) => {
  const { language } = useAuth();
  const t = ui[language] ?? ui.en;
  const m = t.metadata;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [periodicElements, setPeriodicElements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // AI Auto-Tagging States
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    title: document.title || '',
    authors: document.authors || '',
    description: document.description || '',
    programme: document.programme || '',
    collection: document.collection || '',
    categories: document.categories || [],
    geographies: document.geographies || [...GEOGRAPHIES],
    references: document.references || '',
    periodicElementIds: document.periodicElementIds || []
  });

  useEffect(() => {
    const loadPeriodicElements = async () => {
      try {
        setLoading(true);
        const elements = await globaltoolkitService.getAllElements();
        setPeriodicElements(elements);
      } catch (err) {
        console.error('Error loading periodic elements:', err);
        setError(m.loadElemError);
      } finally {
        setLoading(false);
      }
    };

    loadPeriodicElements();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await documentsService.updateDocument(document.id, {
        title: formData.title,
        authors: formData.authors,
        description: formData.description,
        programme: formData.programme,
        collection: formData.collection,
        categories: formData.categories,
        geographies: formData.geographies,
        references: formData.references,
        periodicElementIds: formData.periodicElementIds
      });

      if (onSave) {
        onSave();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving document:', err);
      setError(m.saveError + err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePeriodicElement = (elementId) => {
    setFormData(prev => ({
      ...prev,
      periodicElementIds: prev.periodicElementIds.includes(elementId)
        ? prev.periodicElementIds.filter(id => id !== elementId)
        : [...prev.periodicElementIds, elementId]
    }));
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleGeography = (geo) => {
    setFormData(prev => ({
      ...prev,
      geographies: prev.geographies.includes(geo)
        ? prev.geographies.filter(g => g !== geo)
        : [...prev.geographies, geo]
    }));
  };

  // ===== AI AUTO-TAGGING FUNCTIONS =====
  const handleGenerateAISuggestions = async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      setShowSuggestions(false);

      console.log('🤖 Generating AI suggestions for document:', document.title);

      // Appeler le service d'auto-tagging
      const suggestions = await autoTaggingService.suggestTagsForDocument(
        document.ipfsCid,
        document.title
      );

      setAiSuggestions(suggestions);
      setShowSuggestions(true);

      // Sauvegarder les suggestions dans Firestore pour référence future
      await documentsService.saveAISuggestions(document.id, suggestions);

      console.log('✅ AI suggestions generated:', suggestions);

    } catch (err) {
      console.error('❌ AI suggestion error:', err);
      setAiError(err.message || 'Failed to generate AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (elementId) => {
    // Ajouter l'élément s'il n'est pas déjà sélectionné
    if (!formData.periodicElementIds.includes(elementId)) {
      togglePeriodicElement(elementId);
    }
  };

  const applyAllAISuggestions = () => {
    // Ajouter tous les éléments suggérés qui ne sont pas déjà sélectionnés
    const newElementIds = [...formData.periodicElementIds];
    aiSuggestions.forEach(suggestion => {
      if (!newElementIds.includes(suggestion.elementId)) {
        newElementIds.push(suggestion.elementId);
      }
    });
    setFormData(prev => ({
      ...prev,
      periodicElementIds: newElementIds
    }));
    setShowSuggestions(false);
  };

  const organizeElementsByCategory = () => {
    const organized = {};
    periodicElements.forEach(element => {
      if (!organized[element.category]) {
        organized[element.category] = [];
      }
      organized[element.category].push(element);
    });
    return organized;
  };

  const organizedElements = organizeElementsByCategory();

  const filteredElements = periodicElements.filter(element =>
    element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{m.modalTitle}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {m.fields.title}<span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">
                {m.fields.authors}<span className="text-red-500">*</span>
              </label>
              <input
                id="authors"
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.authors}
                onChange={e => setFormData({...formData, authors: e.target.value})}
                placeholder={m.placeholders.authors}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {m.fields.description}
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label htmlFor="programme" className="block text-sm font-medium text-gray-700 mb-1">
                {m.fields.programme}<span className="text-red-500">*</span>
              </label>
              <select
                id="programme"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.programme}
                onChange={e => setFormData({...formData, programme: e.target.value})}
                required
              >
                <option value="">{m.placeholders.programme}</option>
                {PROGRAMMES.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-1">
                {m.fields.collection}
              </label>
              <select
                id="collection"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.collection}
                onChange={e => setFormData({...formData, collection: e.target.value})}
              >
                <option value="">{m.placeholders.collection}</option>
                {COLLECTIONS.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {m.fields.categories}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {m.fields.geoScope}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              <p className="text-xs text-gray-500 mt-1">{m.hints.geoDefault}</p>
            </div>

            <div>
              <label htmlFor="references" className="block text-sm font-medium text-gray-700 mb-1">
                {m.fields.references}
              </label>
              <input
                id="references"
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.references}
                onChange={e => setFormData({...formData, references: e.target.value})}
                placeholder={m.placeholders.references}
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-700" />
                  <label className="block text-sm font-medium text-gray-700">
                    {m.fields.elements}
                  </label>
                </div>
                
                {/* AI Auto-Tagging Button */}
                <button
                  type="button"
                  onClick={handleGenerateAISuggestions}
                  disabled={aiLoading || !document.ipfsCid}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Generate AI-powered tag suggestions using GPT-4o-mini"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {m.ai.analyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {m.ai.suggestButton}
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {m.hints.elementTag}
              </p>

              {/* AI Suggestions Section */}
              {aiError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{m.ai.errorTitle}</p>
                    <p className="text-sm text-red-600 mt-1">{aiError}</p>
                  </div>
                </div>
              )}

              {showSuggestions && aiSuggestions.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="text-sm font-semibold text-purple-900">
                        {m.ai.suggestions} ({aiSuggestions.length})
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={applyAllAISuggestions}
                        className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                      >
                        {m.ai.applyAll}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                      >
                        {m.ai.dismiss}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, idx) => {
                      const element = periodicElements.find(e => e.id === suggestion.elementId);
                      const isAlreadySelected = formData.periodicElementIds.includes(suggestion.elementId);
                      const confidencePercent = Math.round(suggestion.confidence * 100);
                      
                      return (
                        <div
                          key={idx}
                          className={`p-3 bg-white border rounded-lg transition ${
                            isAlreadySelected ? 'border-green-300 bg-green-50' : 'border-purple-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-bold text-purple-700">
                                  {suggestion.elementId}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {suggestion.elementName || element?.name}
                                </span>
                                
                                {/* Confidence Badge */}
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    confidencePercent >= 80
                                      ? 'bg-green-100 text-green-800'
                                      : confidencePercent >= 60
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {confidencePercent}% {m.ai.confident}
                                </span>

                                {isAlreadySelected && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {suggestion.rationale}
                              </p>
                            </div>

                            {!isAlreadySelected && (
                              <button
                                type="button"
                                onClick={() => applyAISuggestion(suggestion.elementId)}
                                className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-purple-700 mt-3">
                    {m.hints.aiAnalysis}
                  </p>
                </div>
              )}

              {showSuggestions && aiSuggestions.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    {m.ai.noMatches}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <input
                  type="text"
                  placeholder={m.placeholders.searchElements}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : searchTerm ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredElements.map(element => (
                    <label
                      key={element.id}
                      className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.periodicElementIds.includes(element.id)}
                        onChange={() => togglePeriodicElement(element.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          <span className="font-mono font-bold mr-2">{element.id}</span>
                          {element.name}
                        </div>
                        <div className="text-xs text-gray-600">{element.description}</div>
                      </div>
                    </label>
                  ))}
                  {filteredElements.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">{m.noElements}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(organizedElements).map(([categoryKey, elements]) => (
                    <div key={categoryKey}>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        {CATEGORY_NAMES[categoryKey] || categoryKey}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {elements.map(element => (
                          <label
                            key={element.id}
                            className="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer group relative"
                            title={`${element.description}${element.context ? '\n\n' + element.context : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                              checked={formData.periodicElementIds.includes(element.id)}
                              onChange={() => togglePeriodicElement(element.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-xs font-bold">{element.id}</span>
                              <span className="text-xs"> - {element.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.periodicElementIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {m.selectedPrefix} ({formData.periodicElementIds.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.periodicElementIds.map(id => {
                      const element = periodicElements.find(e => e.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs cursor-help"
                          title={element ? `${element.description}${element.context ? '\n\n' + element.context : ''}` : id}
                        >
                          <span className="font-mono font-bold">{id}</span>
                          {element && <span>- {element.name}</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              {m.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.authors || !formData.programme}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? m.saving : m.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetadataEditor;
