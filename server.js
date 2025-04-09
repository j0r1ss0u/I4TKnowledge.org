// ===== IMPORTS =====
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Obtenir le chemin du fichier actuel (nécessaire en mode ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env
dotenv.config();

// ===== CONFIGURATION DU SERVEUR =====
const app = express();
const PORT = process.env.PORT || 0;

// Log des variables d'environnement (sans les mots de passe)
console.log('NewsBlur Proxy: Configuration chargée');
console.log('NewsBlur Proxy: Username configuré:', process.env.NEWSBLUR_USERNAME ? 'Oui' : 'Non');
console.log('NewsBlur Proxy: Password configuré:', process.env.NEWSBLUR_PASSWORD ? 'Oui' : 'Non');
console.log('NewsBlur Proxy: Variables d\'environnement détaillées:', {
  USERNAME_LENGTH: process.env.NEWSBLUR_USERNAME?.length,
  PASSWORD_LENGTH: process.env.NEWSBLUR_PASSWORD?.length
});

// Configuration CORS pour autoriser vos trois domaines
app.use(cors({
  origin: [
    'https://i4tk.replit.app',
    'https://i4tknowledge.org', 
    'https://www.i4tknowledge.org',
    // En développement, autoriser localhost
    'http://localhost:8080',
    'http://localhost:3001',
    // Autoriser tous les sous-domaines Replit
    /\.replit\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
app.use(express.json());

// ===== SYSTÈME DE CACHE =====
// Variables pour stocker les articles en cache
let cachedNews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

// ===== ENDPOINTS API =====
// Endpoint pour tester si le serveur fonctionne
app.get('/api/health', (req, res) => {
  console.log('NewsBlur Proxy: Requête de santé reçue');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      usernameConfigured: !!process.env.NEWSBLUR_USERNAME,
      passwordConfigured: !!process.env.NEWSBLUR_PASSWORD
    }
  });
});

// Endpoint pour récupérer les articles NewsBlur
app.get('/api/newsblur', async (req, res) => {
  console.log('NewsBlur Proxy: Requête reçue pour /api/newsblur');
  console.log('NewsBlur Proxy: Détails de la requête', {
    headers: req.headers,
    origin: req.get('origin')
  });

  try {
    const currentTime = Date.now();

    // Vérification explicite et détaillée des identifiants
    if (!process.env.NEWSBLUR_USERNAME) {
      console.error('ERREUR CRITIQUE : Username NewsBlur non défini');
      return res.status(401).json({ 
        error: 'Configuration incorrecte', 
        details: 'Username NewsBlur manquant' 
      });
    }
    if (!process.env.NEWSBLUR_PASSWORD) {
      console.error('ERREUR CRITIQUE : Password NewsBlur non défini');
      return res.status(401).json({ 
        error: 'Configuration incorrecte', 
        details: 'Password NewsBlur manquant' 
      });
    }

    // Vérifier si nous avons des données en cache récentes
    if (cachedNews && (currentTime - lastFetchTime < CACHE_DURATION)) {
      console.log('NewsBlur Proxy: Utilisation des données en cache');
      return res.json(cachedNews);
    }

    console.log('NewsBlur Proxy: Récupération de données fraîches depuis NewsBlur');
    console.log('NewsBlur Proxy: Tentative d\'authentification avec username:', process.env.NEWSBLUR_USERNAME);

    // 1. S'authentifier à NewsBlur
    const authResponse = await fetch('https://newsblur.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: process.env.NEWSBLUR_USERNAME,
        password: process.env.NEWSBLUR_PASSWORD
      })
    });

    const authData = await authResponse.json();

    console.log('NewsBlur Proxy: Réponse d\'authentification:', JSON.stringify(authData).substring(0, 200));

    if (!authData.authenticated) {
      console.error('NewsBlur Proxy: Échec d\'authentification à NewsBlur:', authData);
      return res.status(401).json({ 
        error: 'Authentification échouée', 
        details: authData 
      });
    }

    // Récupérer les cookies de la réponse
    const cookies = authResponse.headers.get('set-cookie');
    console.log('NewsBlur Proxy: Cookies reçus:', cookies ? 'Oui' : 'Non');

    // 2. Récupérer les articles avec les cookies d'authentification
    console.log('NewsBlur Proxy: Récupération des feeds');
    const newsResponse = await fetch('https://newsblur.com/reader/feeds?include_favicons=true', {
      headers: { Cookie: cookies }
    });

    const feedsData = await newsResponse.json();
    console.log('NewsBlur Proxy: Nombre de feeds récupérés:', feedsData && feedsData.feeds ? Object.keys(feedsData.feeds).length : 0);

    // 3. Récupérer les histoires du premier feed
    const feedIds = Object.keys(feedsData.feeds);

    if (feedIds.length === 0) {
      console.error('NewsBlur Proxy: Aucun feed trouvé dans le compte NewsBlur');
      return res.status(404).json({ 
        error: 'Aucun feed trouvé', 
        details: 'Votre compte NewsBlur ne contient aucun flux' 
      });
    }

    console.log('NewsBlur Proxy: Récupération des histoires du feed', feedIds[0]);
    const storiesResponse = await fetch(`https://newsblur.com/reader/feed/${feedIds[0]}?include_hidden=true&include_timestamps=true&limit=20`, {
      headers: { Cookie: cookies }
    });

    const newsData = await storiesResponse.json();
    console.log('NewsBlur Proxy: Nombre d\'histoires récupérées:', newsData && newsData.stories ? newsData.stories.length : 0);

    // Mettre en cache les résultats
    cachedNews = newsData;
    lastFetchTime = currentTime;

    console.log('NewsBlur Proxy: Données envoyées avec succès');
    res.json(newsData);
  } catch (error) {
    console.error('NewsBlur Proxy: Erreur complète lors de la récupération des articles:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "Erreur lors de la récupération des articles",
      details: error.message,
      stack: error.stack
    });
  }
});

// ===== SERVIR L'APPLICATION FRONTEND =====
// En production, servir les fichiers statiques
if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques depuis le dossier build
  app.use(express.static(path.join(__dirname, 'dist')));

  // Pour toutes les autres requêtes, servir index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // En développement, ajouter une route pour dire que le serveur est en cours d'exécution
  app.get('/', (req, res) => {
    res.send('Serveur proxy NewsBlur en cours d\'exécution en mode développement. Utilisez /api/newsblur pour accéder aux articles.');
  });
}

// ===== DÉMARRER LE SERVEUR =====
app.listen(PORT, () => {
  console.log(`NewsBlur Proxy: Serveur démarré sur le port ${PORT}`);
  console.log(`NewsBlur Proxy: URL de l'API: http://localhost:${PORT}/api/newsblur`);
});