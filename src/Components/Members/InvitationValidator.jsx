// =================================================================
// InvitationValidator.jsx
// Component to validate invitation codes
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { Loader2, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';
import ui from '../../translations/ui';

// =================================================================
// CONSTANTS
// =================================================================
const STEPS = {
  VALIDATION: 'validation',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// =================================================================
// MAIN COMPONENT
// =================================================================
const InvitationValidator = ({ handlePageChange }) => {
  const { showNotification } = useAuth();
  const [step, setStep] = useState(STEPS.VALIDATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  const t = (ui[currentLang] || ui.en).invitationValidator;

  // =================================================================
  // INITIALIZATION EFFECT
  // =================================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');
    const langParam = params.get('lang');

    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
    if (langParam) setCurrentLang(langParam);

    if (emailParam && codeParam) {
      validateInvitation(emailParam, codeParam);
    }
  }, []);

  // =================================================================
  // INVITATION VALIDATION
  // =================================================================
  const validateInvitation = async (emailToValidate, codeToValidate) => {
    setLoading(true);
    setError(null);

    try {
      const emailValue = emailToValidate || email;
      const codeValue = codeToValidate || code;

      console.log('Validating invitation:', emailValue, codeValue);

      const result = await invitationsService.validateInvitationCode(emailValue, codeValue);

      if (!result.valid) {
        setError(result.message);
        setLoading(false);
        return;
      }

      localStorage.setItem('currentInvitationId', result.invitation.id);

      setStep(STEPS.SUCCESS);
      showNotification(t.validationSuccess, 'success');

      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        handlePageChange('finalize-invitation');
      }, 1500);
    } catch (error) {
      console.error('Error validating invitation:', error);
      setError(t.validationError);
      setLoading(false);
    }
  };

  const handleValidationSubmit = (e) => {
    e.preventDefault();
    validateInvitation();
  };

  // =================================================================
  // CONDITIONAL RENDERING
  // =================================================================

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">{t.validating}</p>
      </div>
    );
  }

  if (step === STEPS.SUCCESS) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-green-500 mr-3" />
            <h2 className="text-xl font-bold">{t.redirecting}</h2>
          </div>
          <p className="text-center mb-4">{t.codeValidated}</p>
        </div>
      </div>
    );
  }

  if (step === STEPS.ERROR) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold">{t.error}</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => setStep(STEPS.VALIDATION)}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">{t.title}</h2>

        <form onSubmit={handleValidationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.codeLabel}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border rounded-md font-mono text-center tracking-widest uppercase"
              maxLength={8}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              <span>{t.validateButton}</span>
            </div>
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">{t.enterEmailAndCode}</p>
      </div>
    </div>
  );
};

export default InvitationValidator;
