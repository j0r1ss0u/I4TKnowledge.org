// ==============================================
// IMPORTS
// ==============================================
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Building2, Users, Globe2, Search } from 'lucide-react';
import { useMembers } from "./MembersContext";
import { useAuth } from "../AuthContext";
import ui from "../../translations/ui.js";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ==============================================
// COMPONENT
// ==============================================
const Members = () => {
  // ==============================================
  // HOOKS & STATE
  // ==============================================
  const [isClient, setIsClient] = useState(false);
  const { members } = useMembers();
  const { language } = useAuth();
  const t = (ui[language] || ui.en).mapView;
  const tCommon = (ui[language] || ui.en).common;

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    region: ''
  });

  // Récupération des catégories uniques
  const categories = [...new Set(members
    .filter(m => m.category && m.isVisible)
    .map(m => m.category)
    .sort()
  )];

  // Récupération des régions uniques
  const regions = [...new Set(members
    .filter(m => m.region && m.isVisible)
    .map(m => m.region)
    .sort()
  )];

  // ==============================================
  // EFFECTS
  // ==============================================
  useEffect(() => {
    setIsClient(true);
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // ==============================================
  // UTILS
  // ==============================================
  const formatUrl = (url) => {
    if (!url) return '';
    const cleanedUrl = url.replace(/https\/\//g, 'https://');
    return cleanedUrl.startsWith('https://') ? cleanedUrl : `https://${cleanedUrl}`;
  };

  // ==============================================
  // FILTERING LOGIC
  // ==============================================
  const filteredMembers = members.filter(member => {
    if (!member.isVisible) return false;
    if (member.memberType === 'observer') return false;

    const matchesSearch = !filters.search || 
      member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.country?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = !filters.category || member.category === filters.category;
    const matchesRegion = !filters.region || member.region === filters.region;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  const validMembers = filteredMembers.filter(member => {
    const hasValidCoords = 
      typeof member.lat === 'number' && 
      typeof member.lng === 'number' &&
      !isNaN(member.lat) && 
      !isNaN(member.lng);

    return hasValidCoords;
  });

  // ==============================================
  // RENDERING
  // ==============================================
  if (!isClient) {
    return <div className="bg-white rounded-lg shadow p-6">{tCommon.loading}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <select
            className="border rounded-lg p-2"
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">{t.allCategories}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="border rounded-lg p-2"
            value={filters.region}
            onChange={(e) => setFilters(f => ({ ...f, region: e.target.value }))}
          >
            <option value="">{t.allRegions}</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <div className="text-right text-sm text-gray-500">
            {t.membersFound.replace('{n}', filteredMembers.length)}
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div style={{ height: '500px' }}>
          <MapContainer
            center={[48.8566, 2.3522]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {validMembers.map((member) => (
              <Marker 
                key={member.id}
                position={[member.lat, member.lng]}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        {member.fullName && (
                          <p className="text-sm text-gray-600">{member.fullName}</p>
                        )}
                      </div>
                      {member.category === "Academic" ? (
                        <Building2 className="w-4 h-4 text-blue-800 flex-shrink-0" />
                      ) : (
                        <Users className="w-4 h-4 text-green-700 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {member.city}, {member.country}
                      </div>
                      {member.website && (
                        <div className="flex items-center text-sm">
                          <Globe2 className="w-3 h-3 mr-1" />
                          <a
                            href={formatUrl(member.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {member.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Cartes de visite */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {member.name}
                  {member.fullName && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {member.fullName}
                    </span>
                  )}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{member.city}, {member.country}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{member.category}</span>
                  </div>
                  {member.website && (
                    <div className="flex items-center text-sm text-blue-500 hover:text-blue-600">
                      <Globe2 className="h-4 w-4 mr-1" />
                      <a 
                        href={formatUrl(member.website)}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {member.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
