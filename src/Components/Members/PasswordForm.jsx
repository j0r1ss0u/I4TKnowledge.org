// PasswordForm.jsx
import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import ui from '../../translations/ui.js';

const PasswordForm = ({ onSubmit, buttonText = 'Complete Registration', loading = false, language = 'en' }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const t = (ui[language] || ui.en).passwordForm;

  const validatePasswords = () => {
    if (password.length < 8) {
      setError(t.passwordTooShort);
      return false;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsNotMatch);
      return false;
    }


    setError(null);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validatePasswords()) {
      onSubmit({ password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.passwordLabel}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
            placeholder={t.passwordPlaceholder}
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t.passwordRequirements}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.confirmLabel}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
            placeholder={t.confirmPlaceholder}
            minLength={8}
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>{t.processing}</span>
          </div>
        ) : (
          buttonText
        )}
      </button>
    </form>
  );
};

export default PasswordForm;