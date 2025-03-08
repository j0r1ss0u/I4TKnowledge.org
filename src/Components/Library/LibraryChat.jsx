import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { chatService } from '../../services/chatService';

const formatAuthors = (authors) => {
  if (Array.isArray(authors)) return authors.join(', ');
  if (typeof authors === 'string') return authors;
  return 'N/A';
};

const suggestedPrompts = {
  en: [
    'What is the I4TK Network?',
    'What are the UNESCO guidelines?',
    'What are the priorities for regulating platforms?',
    'What is Trump\'s election impact on digital platforms governance ?',     
  ],
  fr: [
    'Qu\'est-ce que le réseau I4TK ?',
    'Quelles sont les directives de l\'UNESCO ?',
    'Quelles sont les priorités pour réguler les plateformes ?',
    'En quoi l\'élection de Trump impacte t\'elle la gouvernance des plateformes numériques ?'
  ]
};

const LibraryChat = ({ currentLang = 'en' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.chat(input);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.answer,
        sources: response.sources
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: currentLang === 'en' 
          ? 'An error occurred. Please try again.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col min-h-[200px] max-h-[600px] bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
        {messages.length === 0 && (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-700">
              {currentLang === 'en' ? 'Suggested Questions' : 'Questions Suggérées'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts[currentLang].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full 
                           hover:bg-gray-200 transition-colors duration-200 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-white text-green-800'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.type === 'assistant' && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-semibold">
                      {currentLang === 'en' ? 'Sources:' : 'Sources :'}
                    </p>
                    <div className="space-y-1">
                      {/* I4T Guidelines toujours en première position */}
                      <p className="italic">
                        <a 
                          href="/guidelines"
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          I4T Guidelines - Full
                        </a>
                      </p>

                      {/* Autres sources limitées à 3 pour avoir 4 au total avec les guidelines */}
                      {message.sources?.slice(0, 3).map((source, idx) => (
                        <p key={idx} className="italic">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {source.title || 'Untitled'}
                          </a>
                          {source.authors && ` - ${formatAuthors(source.authors)}`}
                          {source.programme && ` (${source.programme})`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentLang === 'en' 
                ? 'Ask about our research documents...'
                : 'Posez une question sur nos documents...'}
              className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                currentLang === 'en' ? 'Send' : 'Envoyer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryChat;