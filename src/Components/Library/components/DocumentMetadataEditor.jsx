import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';
import { globaltoolkitService } from '../../../services/globaltoolkitService';
import { Save, X, Tag } from 'lucide-react';

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

const CATEGORY_NAMES = {
  INSTITUTIONAL: 'Institutional framework',
  LEGISLATING: 'Legislating platforms',
  HUMAN_RIGHTS: 'Human Rights and Rule of Law',
  CONTENT: 'Content governance',
  SYSTEMIC: 'Systemic risks +due diligence',
  PROSOCIAL: 'Pro-social design'
};

const DocumentMetadataEditor = ({ document, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [periodicElements, setPeriodicElements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: document.title || '',
    authors: document.authors || '',
    description: document.description || '',
    programme: document.programme || '',
    collection: document.collection || '',
    categories: document.categories || [],
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
        setError('Failed to load periodic table elements');
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
      setError('Failed to save document: ' + err.message);
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
            <h2 className="text-2xl font-bold">Edit Document Metadata</h2>
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
                Title<span className="text-red-500">*</span>
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
                Authors<span className="text-red-500">*</span>
              </label>
              <input
                id="authors"
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.authors}
                onChange={e => setFormData({...formData, authors: e.target.value})}
                placeholder="Enter authors separated by commas"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
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
                Programme<span className="text-red-500">*</span>
              </label>
              <select
                id="programme"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.programme}
                onChange={e => setFormData({...formData, programme: e.target.value})}
                required
              >
                <option value="">Select a programme</option>
                {PROGRAMMES.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-1">
                Collection
              </label>
              <select
                id="collection"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.collection}
                onChange={e => setFormData({...formData, collection: e.target.value})}
              >
                <option value="">Select a collection (optional)</option>
                {COLLECTIONS.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
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
              <label htmlFor="references" className="block text-sm font-medium text-gray-700 mb-1">
                Bibliographic references
              </label>
              <input
                id="references"
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                value={formData.references}
                onChange={e => setFormData({...formData, references: e.target.value})}
                placeholder="Enter reference IDs separated by commas"
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-700" />
                <label className="block text-sm font-medium text-gray-700">
                  Periodic Table Elements
                </label>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Tag this document with relevant elements from the Periodic Table of Platform Regulation
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search elements..."
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
                    <p className="text-sm text-gray-500 text-center py-4">No elements found</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(organizedElements).map(([categoryKey, elements]) => (
                    <div key={categoryKey}>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        {CATEGORY_NAMES[categoryKey] || categoryKey}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {elements.map(element => (
                          <label
                            key={element.id}
                            className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={formData.periodicElementIds.includes(element.id)}
                              onChange={() => togglePeriodicElement(element.id)}
                            />
                            <span className="font-mono text-xs font-bold">{element.id}</span>
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
                    Selected elements ({formData.periodicElementIds.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.periodicElementIds.map(id => {
                      const element = periodicElements.find(e => e.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs"
                        >
                          <span className="font-mono font-bold">{id}</span>
                          {element && <span>{element.name}</span>}
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
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.authors || !formData.programme}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetadataEditor;
