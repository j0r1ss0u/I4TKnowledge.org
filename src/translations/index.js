// Translation loader utility with dynamic imports to reduce bundle size
const translationCache = new Map();

/**
 * Dynamically loads translation files based on language
 * @param {string} language - Language code ('en', 'fr' or 'es')
 * @returns {Promise<Object>} Translation object for the specified language
 */
export const loadTranslations = async (language) => {
  // Return cached translations if already loaded
  if (translationCache.has(language)) {
    return translationCache.get(language);
  }

  try {
    let translations;
    
    switch (language) {
      case 'fr':
        const frModule = await import('./fr.js');
        translations = frModule.default;
        break;
      case 'es':
        const esModule = await import('./es.js');
        translations = esModule.default;
        break;
      case 'en':
      default:
        const enModule = await import('./en.js');
        translations = enModule.default;
        break;
    }

    // Cache the loaded translations
    translationCache.set(language, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for language: ${language}`, error);
    // Fallback to English if translation loading fails
    if (language !== 'en') {
      return loadTranslations('en');
    }
    // Return empty object as last resort
    return {};
  }
};

/**
 * Preload translations for better UX
 * @param {string} language - Language to preload
 */
export const preloadTranslations = (language) => {
  loadTranslations(language).catch(console.error);
};

/**
 * Get available languages
 * @returns {string[]} Array of available language codes
 */
export const getAvailableLanguages = () => {
  return ['en', 'fr', 'es'];
};