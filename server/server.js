const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Parser = require('rss-parser'); // Installez avec: npm install rss-parser
const app = express();

app.use(cors());
app.use(express.json());

// Route existante pour Ollama
app.post('/api/chat', async (req, res) => {
  // Votre code existant ici
});

// Simple route pour récupérer les flux RSS
app.get('/api/rss', async (req, res) => {
  try {
    const parser = new Parser();

    // Liste des flux RSS que vous voulez suivre
    const feedUrls = [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://www.itrw.org/feed/',
      'https://privacyinternational.org/rss.xml',
      'https://digitalrights.monitor/rss',
      'https://www.un.org/techenvoy/rss.xml'
      // Ajoutez vos flux préférés ici
    ];

    // Récupérer et parser tous les flux
    const feedPromises = feedUrls.map(url => parser.parseURL(url));
    const feeds = await Promise.all(feedPromises);

    // Convertir en format standard
    const stories = [];
    feeds.forEach(feed => {
      feed.items.forEach(item => {
        stories.push({
          id: item.guid || `story-${Math.random()}`,
          title: item.title,
          description: item.content || item.contentSnippet,
          pubDate: new Date(item.pubDate),
          source: feed.title,
          url: item.link,
          imageUrl: null
        });
      });
    });

    // Trier par date (plus récent d'abord) et limiter à un nombre raisonnable
    stories.sort((a, b) => b.pubDate - a.pubDate);
    const limitedStories = stories.slice(0, 10);

    res.json({ stories: limitedStories });
  } catch (error) {
    console.error('RSS feed error:', error);
    res.status(500).json({ 
      error: error.message,
      stories: [] 
    });
  }
});

// Route de diagnostic/santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      usernameConfigured: true,
      passwordConfigured: true
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});