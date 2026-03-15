import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { torService } from '../../services/torService';
import { documentsService } from '../../services/documentsService';
import { useAuth } from '../AuthContext';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const TorAcceptanceRequired = () => {
  const { user, showNotification } = useAuth();
  const [torDocument, setTorDocument] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const lang = localStorage.getItem('preferredLanguage') || 'en';

  useEffect(() => {
    const fetchTor = async () => {
      try {
        const results = await documentsService.semanticSearch('TERMS OF REFERENCE');
        if (!results || results.length === 0) {
          throw new Error(lang === 'fr'
            ? 'Document des conditions d\'utilisation introuvable'
            : 'Terms of Reference document not found');
        }
        setTorDocument(results[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTor();
  }, []);

  const handleAccept = async () => {
    if (!accepted) {
      setError(lang === 'fr'
        ? 'Vous devez accepter les conditions d\'utilisation pour continuer'
        : 'You must accept the Terms of Reference to continue');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await torService.acceptToR(user.email, torDocument.id);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { requiresTorAcceptance: false });

      setDone(true);
      showNotification(
        lang === 'fr' ? 'Conditions acceptées. Bienvenue !' : 'Terms accepted. Welcome!',
        'success'
      );

      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Error accepting ToR:', err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {lang === 'fr' ? 'Conditions acceptées !' : 'Terms accepted!'}
          </h2>
          <p>{lang === 'fr' ? 'Redirection en cours...' : 'Redirecting...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-2">
            {lang === 'fr' ? 'Conditions d\'utilisation requises' : 'Terms of Reference Required'}
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            {lang === 'fr'
              ? 'Votre rôle a été mis à jour. Vous devez accepter les conditions d\'utilisation pour continuer.'
              : 'Your role has been updated. You must accept the Terms of Reference to continue.'}
          </p>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {torDocument && (
            <div>
              <h3 className="text-xl font-semibold mb-4">{torDocument.title}</h3>
              <div className="prose max-w-none mb-6 text-gray-600">
                <p>{torDocument.excerpt || torDocument.description}</p>
                {torDocument.ipfsCid && (
                  <div className="mt-4">
                    <a
                      href={`ipfs://${torDocument.ipfsCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 underline"
                    >
                      {lang === 'fr' ? 'Voir le document complet' : 'View full document'}
                    </a>
                  </div>
                )}
              </div>

              <label className="flex items-center space-x-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked);
                    setError(null);
                  }}
                  className="form-checkbox h-5 w-5 text-amber-600"
                />
                <span className="text-gray-700">
                  {lang === 'fr'
                    ? 'J\'ai lu et j\'accepte les conditions d\'utilisation'
                    : 'I have read and accept the Terms of Reference'}
                </span>
              </label>

              <button
                onClick={handleAccept}
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting
                  ? (lang === 'fr' ? 'Traitement...' : 'Processing...')
                  : (lang === 'fr' ? 'Continuer' : 'Continue')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TorAcceptanceRequired;
