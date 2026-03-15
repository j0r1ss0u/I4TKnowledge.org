// ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, ArrowLeft, Loader2, Globe } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';
import { passwordResetService } from '../../services/passwordResetService';
import { usersService } from '../../services/usersService';
import { firebaseAuthService } from '../../services/firebaseAuthService';
import PasswordForm from './PasswordForm';

// Translations object
const translations = {
  en: {
    title: "Reset Your Password",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    submitButton: "Send Instructions",
    processingButton: "Processing...",
    verifyTitle: "Verify Code",
    verifyPrompt: "Please enter the reset code received by email.",
    codeLabel: "Reset Code",
    codePlaceholder: "Enter the code received by email",
    verifyButton: "Verify Code",
    backToLogin: "Back to Login",
    passwordTitle: "Set New Password",
    passwordPrompt: "Please enter your new password below.",
    resetButton: "Reset Password",
    successMessage: "If an account exists with this email address, you will receive instructions to reset your password.",
    checkInbox: "Please check your inbox and spam folder.",
    codeRequired: "Please enter the reset code",
    invalidCode: "Invalid reset code",
    missingData: "Missing reset data",
    resetSuccess: "Your password has been reset successfully",
    resetAndLoggedIn: "Your password has been reset and you are now logged in",
    generalError: "An error occurred while resetting your password.",
    linkInvalid: "The reset link is invalid or has expired.",
    checkError: "An error occurred while checking the reset link.",
    redirectingHome: "Redirecting to homepage...",
  },
  fr: {
    title: "Réinitialiser votre mot de passe",
    emailLabel: "Adresse email",
    emailPlaceholder: "Entrez votre adresse email",
    submitButton: "Envoyer les instructions",
    processingButton: "Traitement en cours...",
    verifyTitle: "Vérifier le code",
    verifyPrompt: "Veuillez entrer le code de réinitialisation reçu par email.",
    codeLabel: "Code de réinitialisation",
    codePlaceholder: "Entrez le code reçu par email",
    verifyButton: "Vérifier le code",
    backToLogin: "Retour à la connexion",
    passwordTitle: "Définir un nouveau mot de passe",
    passwordPrompt: "Veuillez entrer votre nouveau mot de passe ci-dessous.",
    resetButton: "Réinitialiser le mot de passe",
    successMessage: "Si un compte existe avec cette adresse email, vous recevrez des instructions pour réinitialiser votre mot de passe.",
    checkInbox: "Veuillez vérifier votre boîte de réception et vos spams.",
    codeRequired: "Veuillez entrer le code de réinitialisation",
    invalidCode: "Code de réinitialisation invalide",
    missingData: "Données de réinitialisation manquantes",
    resetSuccess: "Votre mot de passe a été réinitialisé avec succès",
    resetAndLoggedIn: "Votre mot de passe a été réinitialisé et vous êtes maintenant connecté",
    generalError: "Une erreur s'est produite lors de la réinitialisation de votre mot de passe.",
    linkInvalid: "Le lien de réinitialisation est invalide ou a expiré.",
    checkError: "Une erreur s'est produite lors de la vérification du lien de réinitialisation.",
    redirectingHome: "Redirection vers la page d'accueil...",
  },
  es: {
    title: "Restablecer su contraseña",
    emailLabel: "Dirección de correo electrónico",
    emailPlaceholder: "Ingrese su dirección de correo electrónico",
    submitButton: "Enviar instrucciones",
    processingButton: "Procesando...",
    verifyTitle: "Verificar código",
    verifyPrompt: "Por favor, ingrese el código de restablecimiento recibido por correo.",
    codeLabel: "Código de restablecimiento",
    codePlaceholder: "Ingrese el código recibido por correo",
    verifyButton: "Verificar código",
    backToLogin: "Volver al inicio de sesión",
    passwordTitle: "Establecer nueva contraseña",
    passwordPrompt: "Por favor, ingrese su nueva contraseña a continuación.",
    resetButton: "Restablecer contraseña",
    successMessage: "Si existe una cuenta con esta dirección de correo, recibirá instrucciones para restablecer su contraseña.",
    checkInbox: "Por favor, revise su bandeja de entrada y la carpeta de spam.",
    codeRequired: "Por favor, ingrese el código de restablecimiento",
    invalidCode: "Código de restablecimiento inválido",
    missingData: "Faltan datos de restablecimiento",
    resetSuccess: "Su contraseña ha sido restablecida con éxito",
    resetAndLoggedIn: "Su contraseña ha sido restablecida y ahora ha iniciado sesión",
    generalError: "Se produjo un error al restablecer su contraseña.",
    linkInvalid: "El enlace de restablecimiento es inválido o ha expirado.",
    checkError: "Se produjo un error al verificar el enlace de restablecimiento.",
    redirectingHome: "Redirigiendo a la página de inicio...",
  }
};

const ForgotPassword = () => {
  const { user, setAuthPage, showNotification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, code, reset, success, redirect
  const [resetInfo, setResetInfo] = useState(null);
  const [language, setLanguage] = useState('en'); // Default to English

  // Get the correct translation based on current language
  const t = translations[language];

  // Toggle language: EN → FR → ES → EN
  const toggleLanguage = () => {
    const cycle = { en: 'fr', fr: 'es', es: 'en' };
    setLanguage(prev => cycle[prev] || 'en');
  };

  // Check if user is already logged in (after successful password reset)
  useEffect(() => {
    if (user && status === 'success') {
      setStatus('redirect');
      showNotification(t.resetAndLoggedIn, 'success');

      // Redirect to home with a slight delay
      setTimeout(() => {
        window.location.href = '/';  // Force complete page reload
      }, 2000);
    }
  }, [user, status]);

  // Check if we're in a reset process
  useEffect(() => {
    const checkResetStatus = async () => {
      try {
        setLoading(true);
        // Extraire les paramètres depuis le hash au lieu de window.location.search
        const hash = window.location.hash;
        const queryStart = hash.indexOf('?');
        const queryString = queryStart !== -1 ? hash.substring(queryStart + 1) : '';
        const params = new URLSearchParams(queryString);
        const resetId = params.get('resetId');
        const codeParam = params.get('code');
        const langParam = params.get('lang');

        // Set language if specified in URL
        if (langParam === 'fr' || langParam === 'en') {
          setLanguage(langParam);
        }

        if (resetId && codeParam) {
          // Automatically validate code if present in URL
          setCode(codeParam);

          // Store reset information in localStorage in case of refresh
          localStorage.setItem('resetPasswordId', resetId);
          localStorage.setItem('resetPasswordCode', codeParam);

          const result = await passwordResetService.verifyResetCode(resetId, codeParam);

          if (result.valid) {
            setResetInfo({ 
              resetId,
              email: result.email,
              code: codeParam
            });
            setStatus('reset');

            // Clean URL to avoid issues on refresh
            window.history.replaceState({}, '', '/#reset-password');
          } else {
            setError(result.error || t.linkInvalid);
            setStatus('error');
          }
        } else if (resetId) {
          // If only resetId is present, show code entry screen
          const resetDoc = await passwordResetService.getResetDocument(resetId);
          if (resetDoc && resetDoc.status === 'pending') {
            setResetInfo({ resetId });
            setStatus('code');
          } else {
            setError(t.linkInvalid);
            setStatus('error');
          }
        } else {
          // Check localStorage for reset data in case of page refresh
          const storedResetId = localStorage.getItem('resetPasswordId');
          const storedCode = localStorage.getItem('resetPasswordCode');

          if (storedResetId && storedCode) {
            try {
              const result = await passwordResetService.verifyResetCode(storedResetId, storedCode);

              if (result.valid) {
                setResetInfo({
                  resetId: storedResetId,
                  email: result.email,
                  code: storedCode
                });
                setStatus('reset');
              } else {
                // Clear invalid stored data
                localStorage.removeItem('resetPasswordId');
                localStorage.removeItem('resetPasswordCode');
              }
            } catch (err) {
              console.error('Error checking stored reset data:', err);
              localStorage.removeItem('resetPasswordId');
              localStorage.removeItem('resetPasswordCode');
            }
          }
        }
      } catch (err) {
        console.error('Error checking reset status:', err);
        setError(t.checkError);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    checkResetStatus();
  }, [language]);

  // Reset code validation
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!code.trim() || !resetInfo?.resetId) {
      setError(t.codeRequired);
      return;
    }

    setLoading(true);

    try {
      const result = await passwordResetService.verifyResetCode(resetInfo.resetId, code);

      if (result.valid) {
        setResetInfo({ 
          ...resetInfo,
          email: result.email,
          code
        });
        setStatus('reset');
      } else {
        setError(t.invalidCode);
      }
    } catch (err) {
      setError(err.message || t.invalidCode);
    } finally {
      setLoading(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async ({ password }) => {
    try {
      setLoading(true);
      setError('');

      if (!resetInfo || !resetInfo.resetId) {
        throw new Error(t.missingData);
      }

      // Confirm password reset
      await passwordResetService.confirmReset(resetInfo.resetId, password);

      // Store credential info for auto-login
      localStorage.setItem('resetPasswordEmail', resetInfo.email);
      localStorage.setItem('resetPasswordComplete', 'true');

      // Try to log in automatically
      try {
        await firebaseAuthService.loginUser(resetInfo.email, password);

        // Auth context will detect this and redirect
        showNotification(t.resetAndLoggedIn, 'success');
        setStatus('success');

        // Clear reset data
        localStorage.removeItem('resetPasswordId');
        localStorage.removeItem('resetPasswordCode');
      } catch (loginErr) {
        console.error('Auto-login failed:', loginErr);

        // Fall back to manual login redirect
        showNotification(t.resetSuccess, 'success');

        // Redirect to login page after a pause
        setTimeout(() => {
          setAuthPage('login');
        }, 2000);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || t.generalError);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      // Check if user exists and is not deleted
      const userCheck = await usersService.getUserByEmail(email);

      if (userCheck && userCheck.deleted) {
        // Simulate success even if user is deleted (for security reasons)
        setStatus('success');
        return;
      }

      if (!userCheck) {
        // Simulate success even if user doesn't exist (for security reasons)
        setStatus('success');
        return;
      }

      // User exists, proceed with reset
      await passwordResetService.requestPasswordReset(email, language);
      setStatus('success');

      // Notification
      showNotification(
        t.successMessage, 
        'success',
        5000
      );
    } catch (err) {
      console.error('Error requesting password reset:', err);
      // For security reasons, don't disclose specific information
      setStatus('success'); // Even in case of error, show success to user
    }
  };

  // Redirection state (after successful password reset and login)
  if (status === 'redirect') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-4">{t.redirectingHome}</h2>
            <div className="w-full bg-green-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Language toggle button to include in all views
  const LanguageToggle = () => (
    <button 
      type="button" 
      onClick={toggleLanguage}
      className="absolute top-3 right-3 p-2 text-gray-500 hover:text-amber-600"
      aria-label={language === 'en' ? 'Switch to French' : 'Switch to English'}
    >
      <Globe className="h-5 w-5" />
      <span className="ml-1 text-xs">{language.toUpperCase()}</span>
    </button>
  );

  // Display code entry screen
  if (status === 'code') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 relative">
          <LanguageToggle />
          <h2 className="text-2xl font-bold text-center mb-6">
            {t.verifyTitle}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t.verifyPrompt}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.codeLabel}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {t.verifyButton}
            </button>

            <button
              type="button"
              onClick={() => setAuthPage('login')}
              className="w-full text-gray-600 hover:text-gray-700 py-2 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToLogin}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Display password reset form
  if (status === 'reset') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 relative">
          <LanguageToggle />
          <h2 className="text-2xl font-bold text-center mb-6">
            {t.passwordTitle}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t.passwordPrompt}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          <PasswordForm 
            onSubmit={handlePasswordSubmit}
            buttonText={t.resetButton}
            loading={loading}
            language={language}
          />
        </div>
      </div>
    );
  }

  // Default display (reset request or confirmation of sending)
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 relative">
        <LanguageToggle />
        <h2 className="text-2xl font-bold text-center mb-6">
          {t.title}
        </h2>
        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>
                {t.successMessage}
              </p>
              <p className="mt-2">
                {t.checkInbox}
              </p>
            </div>
            <button
              onClick={() => setAuthPage('login')}
              className="text-amber-600 hover:text-amber-700 mt-4 flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              {t.backToLogin}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {status === 'loading' ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>{t.processingButton}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-4 w-4 mr-2" />
                  <span>{t.submitButton}</span>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAuthPage('login')}
              className="w-full text-gray-600 hover:text-gray-700 py-2 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToLogin}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;