const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const OLLAMA_URL = 'http://localhost:11434/api';

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(`${OLLAMA_URL}/generate`, {
      model: 'mistral',
      prompt: req.body.message,
      context: req.body.context || [],
      stream: false
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});