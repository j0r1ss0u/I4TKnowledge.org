import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const NewsBlurComponent = ({ currentLang = 'en' }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const fetchNewsBlurArticles = useCallback(async (isInitialLoad = false) => {
    if (!mountedRef.current) return; // Évite les mises à jour si le composant est démonté

    try {
      // Seulement afficher le loading pour le chargement initial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // Pour les rafraîchissements automatiques, utiliser un état séparé
        setIsRefreshing(true);
      }

      // Initialiser Firebase Functions
      const functions = getFunctions();
      const getNewsBlurArticles = httpsCallable(functions, 'getNewsBlurArticles');

      console.log('Appel à la fonction Firebase getNewsBlurArticles...');

      // Appeler la fonction Firebase
      const result = await getNewsBlurArticles({ count: 6 });

      console.log('Réponse reçue:', result);

      if (!mountedRef.current) return; // Vérifier à nouveau après l'appel async

      // Accéder directement aux données de la réponse
      if (result.data && result.data.articles) {
        setNews(result.data.articles);
        setError(null);
      } else {
        console.error('Format de réponse invalide:', result);
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      if (mountedRef.current) {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    }
  }, []); // Pas de dépendances pour éviter les re-renders

  useEffect(() => {
    mountedRef.current = true;
    
    // Premier chargement
    fetchNewsBlurArticles(true);
    
    // Configurer l'intervalle pour les rafraîchissements
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchNewsBlurArticles(false);
      }
    }, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Pas de dépendances pour éviter les re-renders

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        currentLang === 'en' ? 'en-GB' : 'fr-FR',
        { day: '2-digit', month: '2-digit', year: 'numeric' }
      );
    } catch (e) {
      return dateString; // En cas d'erreur, afficher la chaîne de date brute
    }
  };

  // État de chargement initial
  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Composant d'image robuste avec fallback
  const RobustImage = ({ src, alt, className, fallbackType = 'news' }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    // Images par défaut selon le type
    const defaultImages = {
      news: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23666' text-anchor='middle' dy='.3em'%3EImage non disponible%3C/text%3E%3C/svg%3E",
      favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23ddd'/%3E%3C/svg%3E"
    };

    const handleImageError = () => {
      if (!hasError) {
        setHasError(true);
        setImageSrc(defaultImages[fallbackType]);
      }
    };

    const handleImageLoad = () => {
      setHasError(false);
    };

    useEffect(() => {
      if (src && src !== imageSrc) {
        setImageSrc(src);
        setHasError(false);
      }
    }, [src]);

    return (
      <img
        src={imageSrc || defaultImages[fallbackType]}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={hasError ? { filter: 'grayscale(100%) opacity(0.7)' } : {}}
      />
    );
  };

  // Affichage des articles
  return (
    <div className="container mx-auto p-4">
      {/* Indicateur de rafraîchissement discret */}
      {isRefreshing && (
        <div className="flex justify-center mb-2">
          <div className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 border-t-transparent"></div>
            {currentLang === 'en' ? 'Updating articles...' : 'Actualisation des articles...'}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((article, index) => (
          <article key={article.id || `article-${index}`} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="w-full h-48 bg-gray-100">
              <RobustImage
                src={article.thumbnailUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                fallbackType="news"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                {article.feedFavicon && (
                  <div className="w-4 h-4 mr-2 flex-shrink-0">
                    <RobustImage
                      src={article.feedFavicon}
                      alt={article.feedTitle}
                      className="w-4 h-4"
                      fallbackType="favicon"
                    />
                  </div>
                )}
                <span className="text-xs text-gray-500">{article.feedTitle}</span>
              </div>
              <h3 className="font-serif text-2xl mb-2 text-gray-800">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 font-serif">
                {article.summary}
              </p>
              <div className="flex justify-between items-center">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-serif text-blue-600 hover:text-blue-800"
                >
                  {currentLang === 'en' ? 'Read more' : 'Lire plus'}
                </a>
                <span className="font-serif text-sm text-gray-500">
                  {formatDate(article.publishedDate)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsBlurComponent;