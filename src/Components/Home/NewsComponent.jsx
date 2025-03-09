import React, { useState, useEffect } from 'react';

const NewsComponent = ({ currentLang = 'en' }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const fetchGuardianNews = async () => {
    try {
      setLoading(true);
      const apiUrl = new URL('https://content.guardianapis.com/search');
      apiUrl.searchParams.append('api-key', GUARDIAN_API_KEY);
      apiUrl.searchParams.append('section', 'digital policies|misinformation|technology|digital governance');
      apiUrl.searchParams.append('show-fields', 'thumbnail,trailText');
      apiUrl.searchParams.append('page-size', '6');
      apiUrl.searchParams.append('order-by', 'newest');

      console.log('Fetching from:', apiUrl.toString()); // Pour le débogage

      const response = await fetch(apiUrl.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.response || !data.response.results) {
        throw new Error('Invalid API response format');
      }

      setNews(data.response.results);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardianNews();
    const interval = setInterval(fetchGuardianNews, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      currentLang === 'en' ? 'en-GB' : 'fr-FR',
      { day: '2-digit', month: '2-digit', year: 'numeric' }
    );
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((article) => (
          <article key={article.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="w-full h-48 bg-gray-100">
              <img 
                src={article.fields?.thumbnail || '/api/placeholder/800/400'}
                alt={article.webTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/800/400';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-2xl mb-2 text-gray-800">
                {article.webTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-4 font-serif">
                {article.fields?.trailText}
              </p>
              <div className="flex justify-between items-center">
                <a 
                  href={article.webUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-serif text-blue-600 hover:text-blue-800"
                >
                  {currentLang === 'en' ? 'Read more' : 'Lire plus'}
                </a>
                <span className="font-serif text-sm text-gray-500">
                  {formatDate(article.webPublicationDate)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;