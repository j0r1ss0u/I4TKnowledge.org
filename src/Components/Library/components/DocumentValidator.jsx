import React, { useState, useEffect } from 'react';
import { useWriteContract, useWatchContractEvent, useAccount } from 'wagmi';
import { documentsService } from '../../../services/documentsService';
import { contractConfig, publicClient } from '../../../config/wagmiConfig';
import { useAuth } from '../../AuthContext';
import ui from '../../../translations/ui.js';

// =============== CONSTANTS ===============
const ValidationStatus = {
  PENDING: '0/4',
  VALIDATION_1: '1/4',
  VALIDATION_2: '2/4', 
  VALIDATION_3: '3/4',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

const DocumentValidator = ({ document }) => {
  // =============== STATES ===============
  const { language } = useAuth();
  const t = (ui[language] || ui.en);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(document.validationStatus || ValidationStatus.PENDING);
  const [hasAlreadyValidated, setHasAlreadyValidated] = useState(false);
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // =============== INITIALIZATION ===============
  useEffect(() => {
    if (address && document.tokenId) {
      checkValidationState();
    }
  }, [address, document.tokenId]);

  // =============== VALIDATION STATE CHECKS ===============
  const checkValidationState = async () => {
    try {
      // Check if user has already validated
      const hasValidated = await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'contentValidator',
        args: [BigInt(document.tokenId), address]
      });

      // Get current validation count
      const validationCount = await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'nbValidation',
        args: [BigInt(document.tokenId)]
      });

      console.log("Current validation count:", validationCount.toString());
      console.log("Has user validated:", hasValidated);

      setHasAlreadyValidated(hasValidated);
      updateValidationStatus(`${validationCount}/4`);
    } catch (error) {
      console.error("Error checking validation state:", error);
    }
  };

  // =============== EVENT WATCHERS ===============
  useWatchContractEvent({
    address: contractConfig.address,
    abi: contractConfig.abi,
    eventName: 'contentValidation',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.tokenId?.toString() === document.tokenId) {
          checkValidationState();
        }
      });
    }
  });

  useWatchContractEvent({
    address: contractConfig.address,
    abi: contractConfig.abi,
    eventName: 'contentPublished',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.tokenId?.toString() === document.tokenId) {
          updateValidationStatus(ValidationStatus.PUBLISHED);
        }
      });
    }
  });

  // =============== STATUS UPDATES ===============
  const updateValidationStatus = async (newStatus) => {
    try {
      await documentsService.updateDocumentStatus(document.id, newStatus);
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // =============== VALIDATION HANDLER ===============
  const handleValidate = async () => {
    if (hasAlreadyValidated) {
      setError(t.adminView.alreadyValidatedMsg);
      return;
    }

    try {
      setIsValidating(true);
      setError(null);

      const hash = await writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'valideContent',
        args: [BigInt(document.tokenId)]
      });

      console.log("Transaction hash:", hash);

    } catch (error) {
      console.error("Validation error:", error);
      setError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  // =============== PROGRESS CALCULATIONS ===============
  const getProgressPercentage = () => {
    if (currentStatus === ValidationStatus.PUBLISHED) return 100;
    const match = currentStatus.match(/(\d+)\/4/);
    return match ? (parseInt(match[1]) / 4) * 100 : 0;
  };

  // =============== RENDER ===============
  return (
    <div className="mt-4">
      {/* Status Display */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium">{t.adminView.validationStatus}</span>
        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
          {currentStatus}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{
            width: `${getProgressPercentage()}%`
          }}
        />
      </div>

      {/* Validation Button */}
      <button
        onClick={handleValidate}
        disabled={isValidating || currentStatus === ValidationStatus.PUBLISHED || hasAlreadyValidated}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isValidating ? t.adminView.validating : hasAlreadyValidated ? t.adminView.alreadyValidated : t.adminView.validate}
      </button>

      {/* Status Messages */}
      {hasAlreadyValidated && (
        <div className="mt-2 text-sm text-amber-600">
          {t.adminView.alreadyValidatedMsg}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentValidator;