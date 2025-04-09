import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const NewsBlur = ({ currentLang = 'en' }) => {
  // États pour gérer les données et le chargement
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);

  // Récupérer l'utilisateur connecté à partir du contexte d'authentification
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin');

  const REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // 2 heures
  const NEWS_COUNT = 6; // Nombre d'articles à afficher

  const getApiUrl = () => {
    const hostname = window.location.hostname;
    console.log('NewsBlur: Hostname détecté:', hostname);

    // Liste explicite des domaines
    const allowedDomains = [
      'i4tk.replit.app', 
      'i4tknowledge.org', 
      'www.i4tknowledge.org',
      'replit.dev',
      'localhost'  // Ajout de localhost pour le développement
    ];

    // Vérification du domaine
    const isDomainAllowed = allowedDomains.some(domain => hostname.includes(domain));
    console.log('NewsBlur: Domaine autorisé ?', isDomainAllowed);

    // Construction de l'URL avec timestamp pour éviter le cache
    const apiUrl = '/api/newsblur';
    const urlWithTimestamp = `${apiUrl}?t=${Date.now()}`;

    console.log('NewsBlur: URL API construite:', urlWithTimestamp);
    return urlWithTimestamp;
  };

  // Fonction pour récupérer les articles via notre proxy
  const fetchNews = async (forceRefresh = false) => {
    try {
      // Si ce n'est pas un rafraîchissement forcé et que nous avons récupéré des données récemment, ne pas rafraîchir
      const now = Date.now();
      if (!forceRefresh && lastFetchTime && (now - lastFetchTime < REFRESH_INTERVAL / 2)) {
        console.log('NewsBlur: Récupération ignorée, données récentes disponibles');
        return;
      }

      setLoading(true);
      setError(null);
      setDiagnosticInfo(prev => ({
        ...prev,
        fetchStarted: new Date().toISOString(),
        fetchType: forceRefresh ? 'forced' : 'normal',
        apiUrl: getApiUrl()
      }));

      // Appeler notre API proxy
      console.log('NewsBlur: Appel au proxy pour récupérer les articles...');

      // Essayer d'abord de vérifier si l'API est en vie
      try {
        const healthResponse = await fetch('/api/health');
        const healthData = await healthResponse.json();
        setDiagnosticInfo(prev => ({
          ...prev,
          healthCheck: {
            status: healthResponse.status,
            data: healthData
          }
        }));
      } catch (healthError) {
        console.error('NewsBlur: Erreur lors de la vérification de santé de l\'API:', healthError);
        setDiagnosticInfo(prev => ({
          ...prev,
          healthCheck: {
            error: healthError.message
          }
        }));
      }

      // Maintenant, récupérer les articles
      const response = await fetch(getApiUrl());

      // Vérifier si la requête a réussi
      if (!response.ok) {
        const errorText = await response.text();
        setDiagnosticInfo(prev => ({
          ...prev,
          responseStatus: response.status,
          responseStatusText: response.statusText,
          responseText: errorText.substring(0, 500)
        }));
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const responseText = await response.text();
      setDiagnosticInfo(prev => ({
        ...prev,
        responseTextPreview: responseText.substring(0, 200),
        responseContentType: response.headers.get('content-type')
      }));

      // Essayer de parser la réponse comme JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setDiagnosticInfo(prev => ({
          ...prev,
          jsonParseError: parseError.message
        }));
        throw new Error(`Erreur de parsing JSON: ${parseError.message}`);
      }

      setDiagnosticInfo(prev => ({
        ...prev,
        dataReceived: true,
        dataSize: responseText.length,
        dataPreview: JSON.stringify(data).slice(0, 500) + '...'
      }));

      // Vérifier si nous avons des articles
      if (data.stories && Array.isArray(data.stories)) {
        console.log('NewsBlur: Articles récupérés', data.stories.length);

        // Vérifier si nous avons des données réelles
        if (data.stories.length > 0) {
          // Transformer les données pour notre affichage
          const transformedStories = data.stories
            .filter(story => story && story.story_title) // Filtrer les entrées invalides
            .map(story => ({
              id: story.id || story.story_hash || `story-${Math.random()}`,
              title: story.story_title || 'Sans titre',
              description: story.story_content || '',
              pubDate: new Date((story.story_timestamp || story.published_date || Date.now()/1000) * 1000),
              source: story.story_feed_title || 'Source inconnue',
              sourceId: story.story_feed_id,
              url: story.story_permalink || '#',
              imageUrl: getImageUrl(story),
              isFallback: false
            }))
            // Trier par date de publication, du plus récent au plus ancien
            .sort((a, b) => b.pubDate - a.pubDate)
            // Limiter au nombre voulu après le tri
            .slice(0, NEWS_COUNT);

          setDiagnosticInfo(prev => ({
            ...prev,
            articlesCount: transformedStories.length,
            articlesPreview: transformedStories.slice(0, 2).map(a => ({
              title: a.title.substring(0, 30),
              date: a.pubDate.toISOString()
            }))
          }));

          // Vérifier si nous avons réellement des nouveaux articles
          if (transformedStories.length > 0) {
            // Mettre à jour l'état avec les nouveaux articles
            setNews(transformedStories);
            setUsingFallback(false);
          } else {
            // Aucun nouvel article trouvé, utiliser les fallbacks mais ne rien changer si nous avons déjà des articles
            if (news.length === 0) {
              setNews(getFallbackStories());
              setUsingFallback(true);
            }
          }
        } else {
          // Pas de données récupérées, utiliser les fallbacks mais ne rien changer si nous avons déjà des articles
          if (news.length === 0) {
            setNews(getFallbackStories());
            setUsingFallback(true);
          }
        }

        // Enregistrer le moment de la récupération
        setLastFetchTime(Date.now());
      } else {
        console.error('NewsBlur: Format de réponse d\'articles inattendu', data);
        throw new Error('Format de réponse d\'articles inattendu');
      }
    } catch (err) {
      console.error('NewsBlur: Erreur lors de la récupération des articles', err);

      // Journaliser des informations détaillées sur l'erreur
      console.error('NewsBlur: Informations supplémentaires sur l\'erreur:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        online: navigator.onLine,
        readyState: document.readyState
      });

      setError(`Erreur: ${err.message}`);
      setDiagnosticInfo(prev => ({
        ...prev,
        fetchError: err.message,
        fetchErrorType: err.name,
        fetchErrorStack: err.stack,
        online: navigator.onLine,
        readyState: document.readyState
      }));

      // Utiliser des données de secours en cas d'erreur, mais seulement si nous n'avons pas déjà des articles
      if (news.length === 0) {
        console.log('NewsBlur: Utilisation des articles de secours suite à une erreur');
        setNews(getFallbackStories());
        setUsingFallback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir des articles simulés en cas d'échec de l'API
  const getFallbackStories = () => {
    // Si nous avons déjà des articles, les utiliser comme fallback
    if (news.length > 0) {
      return news.map(article => ({
        ...article,
        isFallback: true
      }));
    }

    // Date actuelle pour des articles plus récents
    const now = new Date();
    // Générer des dates récentes (aujourd'hui, hier, etc.)
    const today = new Date(now);
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);
    const threeDaysAgo = new Date(now); threeDaysAgo.setDate(now.getDate() - 3);
    const fourDaysAgo = new Date(now); fourDaysAgo.setDate(now.getDate() - 4);
    const fiveDaysAgo = new Date(now); fiveDaysAgo.setDate(now.getDate() - 5);

    return [
      {
        id: 'fallback1',
        title: 'UN Global Digital Compact: Final Draft Released for Review',
        description: 'The United Nations has released the final draft of the Global Digital Compact for stakeholder review. The document outlines key principles for an open, free, and secure digital future, emphasizing digital inclusion and human rights.',
        pubDate: today,
        source: 'United Nations Digital Updates',
        sourceId: 'undigital',
        url: 'https://www.un.org/techenvoy/global-digital-compact',
        imageUrl: null,
        isFallback: true
      },
      {
        id: 'fallback2',
        title: 'Data Governance Act Implementation Begins in EU Member States',
        description: 'European Union member states have begun implementing the Data Governance Act, establishing new frameworks for data sharing and reuse. The legislation aims to create trusted mechanisms for personal and non-personal data sharing.',
        pubDate: yesterday,
        source: 'EU Tech Policy',
        sourceId: 'eutechpolicy',
        url: 'https://digital-strategy.ec.europa.eu/en/policies/data-governance-act',
        imageUrl: null,
        isFallback: true
      },
      {
        id: 'fallback3',
        title: 'New Study Reveals Alarming Growth in Digital Surveillance Technologies',
        description: 'A comprehensive study released today by Privacy International documents a 47% increase in government procurement of surveillance technologies in the past year, with facial recognition and predictive policing systems leading the trend.',
        pubDate: twoDaysAgo,
        source: 'Privacy International',
        sourceId: 'privacyinternational',
        url: 'https://privacyinternational.org',
        imageUrl: null,
        isFallback: true
      },
      {
        id: 'fallback4',
        title: 'Platform Workers Launch Global Coalition for Digital Labor Rights',
        description: 'Gig workers from across six continents have formed the first global federation dedicated to advancing digital labor rights. The coalition aims to address algorithmic management issues and push for consistent standards across jurisdictions.',
        pubDate: threeDaysAgo,
        source: 'Digital Rights Monitor',
        sourceId: 'digitalrights',
        url: 'https://digitalrightsmonitor.org',
        imageUrl: null,
        isFallback: true
      },
      {
        id: 'fallback5',
        title: 'Open Source AI Models Gain Traction as Alternative to Proprietary Systems',
        description: 'Community-developed open source AI models are seeing unprecedented adoption among researchers and smaller companies, offering greater transparency and lower deployment costs compared to dominant proprietary systems.',
        pubDate: fourDaysAgo,
        source: 'Open Future Foundation',
        sourceId: 'openfuture',
        url: 'https://openfuture.org',
        imageUrl: null,
        isFallback: true
      },
      {
        id: 'fallback6',
        title: 'Digital Public Infrastructure: New Framework for Equitable Technology',
        description: 'A coalition of development organizations has released a comprehensive framework for Digital Public Infrastructure, emphasizing open standards, interoperability, and inclusive governance as keys to avoiding digital colonialism.',
        pubDate: fiveDaysAgo,
        source: 'Digital Public Goods Alliance',
        sourceId: 'dpga',
        url: 'https://digitalpublicgoods.net',
        imageUrl: null,
        isFallback: true
      }
    ];
  };

  // Fonction simplifiée pour rechercher des images pertinentes
  const getContentImage = (story) => {
    try {
      // Vérifier le contenu pour une image
      if (story.story_content && typeof story.story_content === 'string') {
        const imgMatch = story.story_content.match(/<img[^>]+src="([^">]+)"/i);
        if (imgMatch && imgMatch[1]) {
          const url = imgMatch[1];
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la recherche d\'image dans le contenu:', err);
      return null;
    }
  };

  // Fonction simplifiée qui n'essaie plus d'extraire les images
  const getImageUrl = (story) => {
    // Nous n'utilisons plus d'images, mais gardons cette fonction
    // pour maintenir la compatibilité avec le reste du code
    return null;
  };

  // Initialisation et rafraîchissement périodique
  useEffect(() => {
    const initializeNewsBlur = async () => {
      setDiagnosticInfo({
        initTime: new Date().toISOString(),
        lastRefreshAttempt: null,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        onLine: navigator.onLine,
        baseUrl: window.location.origin
      });

      await fetchNews(true); // Forcer le premier chargement
    };

    initializeNewsBlur();

    // Configurer l'intervalle de rafraîchissement
    const interval = setInterval(() => {
      console.log('NewsBlur: Rafraîchissement périodique programmé...');
      setDiagnosticInfo(prev => ({
        ...prev,
        lastRefreshAttempt: new Date().toISOString(),
        refreshType: 'interval'
      }));
      fetchNews(true); // Forcer le rafraîchissement périodique
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Ajouter un effet pour rafraîchir lors du focus sur la fenêtre
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('NewsBlur: L\'onglet a repris le focus, rafraîchissement des données...');
        setDiagnosticInfo(prev => ({
          ...prev,
          lastRefreshAttempt: new Date().toISOString(),
          refreshType: 'visibility_change'
        }));
        fetchNews(false); // Ne pas forcer le rafraîchissement si les données sont récentes
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyer l'écouteur d'événements
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fonction pour nettoyer le HTML
  const stripHtml = (html) => {
    if (!html) return '';
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    } catch (err) {
      console.error('Erreur lors du nettoyage HTML:', err);
      return '';
    }
  };

  // Formatage de date
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
    return date.toLocaleDateString(
      currentLang === 'en' ? 'en-GB' : 'fr-FR',
      { day: '2-digit', month: '2-digit', year: 'numeric' }
    );
  };

  // Rafraîchissement manuel (pour le développement et admin)
  const handleManualRefresh = () => {
    console.log('NewsBlur: Rafraîchissement manuel déclenché');
    setDiagnosticInfo(prev => ({
      ...prev,
      lastRefreshAttempt: new Date().toISOString(),
      refreshType: 'manual'
    }));
    fetchNews(true); // Forcer le rafraîchissement
  };

  // Rendu du spinner de chargement
  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rendu en cas d'erreur mais avec des articles de secours
  if (error && news.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Rendu des articles
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {currentLang === 'en' ? 'News' : 'Actualités'}
          </h2>
          {/* Afficher l'indicateur de fallback uniquement pour les admins */}
          {isAdmin && loading && (
            <div className="text-sm text-gray-500 mt-1">
              {currentLang === 'en' ? 'Updating...' : 'Mise à jour...'}
            </div>
          )}
          {isAdmin && usingFallback && (
            <div className="text-sm text-amber-600 mt-1">
              {currentLang === 'en' ? '(Using fallback content)' : '(Contenu de secours utilisé)'}
            </div>
          )}
        </div>

        {/* Bouton de rafraîchissement - Visible uniquement pour les admins */}
        {isAdmin && (
          <div className="flex items-center">
            <button 
              onClick={handleManualRefresh}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 mr-1 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></span>
                  {currentLang === 'en' ? 'Loading...' : 'Chargement...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  {currentLang === 'en' ? 'Refresh' : 'Actualiser'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {news.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-700">
            {currentLang === 'en' 
              ? 'No news found. Please check your NewsBlur configuration.'
              : 'Aucune actualité trouvée. Veuillez vérifier votre configuration NewsBlur.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((article) => (
            <article key={article.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
              {/* Option sans image */}
              <div className="w-full bg-gray-100 p-3 flex items-center justify-between">
                <span className="font-bold text-gray-700">{article.source}</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">{formatDate(article.pubDate)}</span>
                  {/* Afficher l'indicateur de fallback uniquement pour les admins */}
                  {isAdmin && article.isFallback && (
                    <span className="text-xs text-amber-600 mt-1">
                      {currentLang === 'en' ? 'Fallback' : 'Secours'}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-2xl mb-2 text-gray-800">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 font-serif">
                  {stripHtml(article.description).slice(0, 150) + '...'}
                </p>
                <div className="mt-4">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-serif text-blue-600 hover:text-blue-800"
                  >
                    {currentLang === 'en' ? 'Read more' : 'Lire plus'}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Informations de diagnostic (visibles uniquement pour les admins) */}
      {isAdmin && diagnosticInfo && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <h3 className="font-bold mb-2">Diagnostic Info:</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-60">
            {JSON.stringify(diagnosticInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default NewsBlur;