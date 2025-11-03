const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const path = require('path');

// Version pour les callable functions
exports.getNewsBlurArticles = functions.https.onCall(async (data, context) => {
  try {
    let username, password;

    // Essayer de charger la configuration depuis le fichier dans le répertoire parent
    try {
      const config = require('../temp-config.js');
      username = config.newsblur.username;
      password = config.newsblur.password;
      console.log('Configuration chargée depuis ../temp-config.js');
    } catch (configError) {
      console.error('Erreur lors du chargement du fichier de configuration:', configError.message);

      // Valeurs par défaut (utilisez ces valeurs si le fichier n'est pas trouvé)
      username = 'I4TKnowledge';
      password = 'ShadyOutpourLyricist6$Monorail';
      console.log('Utilisation des identifiants par défaut');
    }

    console.log('Vérification des identifiants NewsBlur:', 
               username ? 'Username défini' : 'Username manquant', 
               password ? 'Password défini' : 'Password manquant');

    if (!username || !password) {
      console.error('Les identifiants NewsBlur ne sont pas configurés');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Les identifiants NewsBlur ne sont pas configurés'
      );
    }

    console.log('Tentative d\'authentification à NewsBlur');

    // 1. Authentification à NewsBlur
    const loginUrl = 'https://www.newsblur.com/api/login';

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: params.toString()
    });

    if (!loginResponse.ok) {
      console.error('Erreur HTTP lors de l\'authentification:', loginResponse.status, loginResponse.statusText);
      throw new functions.https.HttpsError(
        'internal',
        `Erreur d'authentification HTTP: ${loginResponse.status} ${loginResponse.statusText}`
      );
    }

    const loginData = await loginResponse.json();
    console.log('Résultat authentification:', JSON.stringify(loginData, null, 2).substring(0, 200) + '...');

    if (!loginData.authenticated) {
      console.error('Échec de l\'authentification à NewsBlur:', loginData);

      // Générer des articles fictifs pour le développement
      console.log('Génération d\'articles fictifs pour test');
      const mockArticles = [];
      for (let i = 0; i < 6; i++) {
        mockArticles.push({
          id: `mock-${i}`,
          title: `Article de test ${i+1}`,
          summary: `Ceci est un article de test généré car l'authentification à NewsBlur a échoué.`,
          url: 'https://www.newsblur.com',
          publishedDate: new Date().toISOString(),
          feedTitle: 'NewsBlur Test',
          thumbnailUrl: null,
          feedFavicon: null
        });
      }

      return {
        articles: mockArticles,
        warning: 'Authentification échouée - Articles fictifs générés pour test'
      };
    }

    // Extraire le cookie de session pour les futures requêtes
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies obtenus:', cookies ? 'Oui' : 'Non');

    // 2. Récupérer les articles
    // Récupérer les articles récents (lus ET non lus) pour éviter que NewsBlur les marque comme lus
    const unreadUrl = 'https://www.newsblur.com/reader/river_stories';

    const params2 = new URLSearchParams({
      include_hidden: false,
      include_read: true,  // Inclure les articles lus pour éviter le marquage automatique
      page: 1,
      read_filter: 'all',  // Récupérer tous les articles (pas seulement "unread")
      order: 'newest'
    });

    const storiesResponse = await fetch(`${unreadUrl}?${params2.toString()}`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!storiesResponse.ok) {
      console.error('Erreur lors de la récupération des articles:', storiesResponse.status, storiesResponse.statusText);
      throw new functions.https.HttpsError(
        'internal',
        `Erreur de récupération des articles: ${storiesResponse.status} ${storiesResponse.statusText}`
      );
    }

    const storiesData = await storiesResponse.json();
    console.log('Nombre d\'articles récupérés:', storiesData.stories ? storiesData.stories.length : 0);

    if (!storiesData.stories || !Array.isArray(storiesData.stories)) {
      console.error('Format de réponse invalide pour les articles:', storiesData);
      throw new functions.https.HttpsError(
        'internal',
        'Format de réponse invalide pour les articles'
      );
    }

    // Nombre d'articles à récupérer (ajustable par paramètre)
    const count = data?.count || 6;

    // Transformer et limiter les articles
    const articles = storiesData.stories.slice(0, count).map(story => {
      console.log('Traitement article:', {
        titre: story.story_title,
        feedId: story.story_feed_id,
        feedFavicon: story.feed_favicon,
        feedColor: story.feed_color,
        autresChamps: Object.keys(story).filter(k => k.includes('feed') || k.includes('favicon') || k.includes('icon'))
      });

      // Construire l'URL du favicon depuis l'ID du feed si pas de favicon direct
      let faviconUrl = story.feed_favicon;
      if (!faviconUrl && story.story_feed_id) {
        // Construire l'URL du favicon à partir de l'ID du feed
        faviconUrl = `https://www.newsblur.com/rss_feeds/icon/${story.story_feed_id}/`;
      }

      return {
        id: story.id,
        title: story.story_title,
        summary: story.story_summary || extractExcerpt(story.story_content),
        url: story.story_permalink,
        publishedDate: story.story_date,
        feedTitle: story.story_feed_title,
        thumbnailUrl: extractThumbnail(story.story_content),
        feedFavicon: faviconUrl
      };
    });

    // Renvoyer les articles au client
    console.log('Envoi de la réponse avec', articles.length, 'articles');
    return {
      articles: articles
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des articles NewsBlur:', error);

    // Si l'erreur est déjà une HttpsError, la transmettre
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Sinon, créer une nouvelle HttpsError
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Une erreur est survenue lors de la récupération des articles'
    );
  }
});

// Fonction utilitaire pour extraire une image miniature du contenu
function extractThumbnail(content) {
  if (!content) return null;

  // Rechercher la première image dans le contenu HTML
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return null;
}

// Fonction utilitaire pour extraire un extrait de texte du contenu HTML
function extractExcerpt(content) {
  if (!content) return '';

  // Supprimer les balises HTML
  const textOnly = content.replace(/<[^>]*>/g, '');

  // Limiter à environ 150 caractères
  return textOnly.substring(0, 150) + (textOnly.length > 150 ? '...' : '');
}