import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const NewsBlurComponent = ({ currentLang = 'en' }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const fetchNewsBlurArticles = async () => {
    try {
      setLoading(true);

      // Initialiser Firebase Functions
      const functions = getFunctions();
      const getNewsBlurArticles = httpsCallable(functions, 'getNewsBlurArticles');

      console.log('Appel à la fonction Firebase getNewsBlurArticles...');

      // Appeler la fonction Firebase
      const result = await getNewsBlurArticles({ count: 6 });

      console.log('Réponse reçue:', result);

      // Accéder directement aux données de la réponse
      // Note: la fonction httpsCallable encapsule automatiquement la réponse dans un champ 'data'
      if (result.data && result.data.articles) {
        setNews(result.data.articles);
        setError(null);
      } else {
        console.error('Format de réponse invalide:', result);
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsBlurArticles();
    const interval = setInterval(fetchNewsBlurArticles, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

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

  // Affichage des articles
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((article, index) => (
          <article key={article.id || `article-${index}`} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="w-full h-48 bg-gray-100">
              <img 
                src={article.thumbnailUrl || '/api/placeholder/800/400'}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/800/400';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                {article.feedFavicon && (
                  <img 
                    src={article.feedFavicon} 
                    alt={article.feedTitle} 
                    className="w-4 h-4 mr-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
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