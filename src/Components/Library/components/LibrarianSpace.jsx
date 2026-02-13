// =============== IMPORTS ===============
import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { contractConfig } from "../../../config/wagmiConfig";
import { roleManagementService } from "../../../services/firebase";
import { web3RoleService } from "../../../services/web3";
import { useMembers } from "../../Members/MembersContext";
import RolesTable from './RolesTable';

// =============== CONSTANTS ===============
const WEB3_ROLES = [
  { name: "Contributeur", value: "CONTRIBUTOR" },
  { name: "Validateur", value: "VALIDATOR" },
  { name: "Administrateur", value: "ADMIN" }
];

// =============== UTILITY FUNCTIONS ===============
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const sortByDate = (a, b) => {
  try {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  } catch (error) {
    console.error('Error sorting dates:', error);
    return 0;
  }
};

// =============== COMPONENT ===============
export default function LibrarianSpace() {
  // =============== HOOKS ET STATES ===============
  // Remplacer toute la section des hooks et states par :
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: hasAdminRole } = useReadContract({
    ...contractConfig,
    functionName: 'hasRole',
    args: [contractConfig.roles.ADMIN_ROLE, connectedAddress],
    enabled: !!connectedAddress
  });

  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    address: '',
    role: '',
    memberId: ''
  });
  const [rolesRegistry, setRolesRegistry] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const { members } = useMembers();

  // =============== EFFECTS ===============
 
  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (txHash) {
      console.log('Transaction hash set:', txHash);
      setTransactionStatus('PENDING');
    }
  }, [txHash]);

  const { isLoading: isTxPending, isSuccess: isTxSuccess, isError: isTxError, data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  });

  useEffect(() => {
    if (isTxSuccess && txReceipt && txHash) {
      console.log('Transaction confirmed via useEffect:', txReceipt);
      setTransactionStatus('CONFIRMED');
      handleTransactionSuccess(txReceipt);
    }
  }, [isTxSuccess, txReceipt, txHash]);

  useEffect(() => {
    if (isTxError && txHash) {
      console.error('Transaction failed via useEffect');
      setTransactionStatus('FAILED');
      setError('Transaction failed on blockchain');
    }
  }, [isTxError, txHash]);


  // =============== HANDLERS ===============
  async function handleTransactionSuccess(receipt) {
    try {
      console.log('Starting handleTransactionSuccess with receipt:', receipt);
      console.log('Current form data - saving to Firestore:', pendingFormData || formData);

      const dataToSave = pendingFormData || formData;

      const roleData = {
        address: dataToSave.address,
        role: dataToSave.role,
        action: dataToSave.pendingAction || 'register',
        transactionHash: txHash,
        memberId: dataToSave.memberId,
        memberName: dataToSave.memberName,
        category: dataToSave.category,
        country: dataToSave.country,
        createdAt: new Date().toISOString()
      };

      await roleManagementService.addRole(roleData);
      console.log('Role action recorded in Firestore after blockchain confirmation:', roleData);

      await loadRoles();
      setPendingFormData(null);
      resetForm();
    } catch (error) {
      console.error('Error in handleTransactionSuccess:', error);
      setError('Failed to update role status');
    }
  }

  async function loadRoles() {
    try {
      setIsLoading(true);
      const roles = await roleManagementService.getAllRoles();
      console.log('Loaded roles:', roles);
      setRolesRegistry(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
      setError('Error loading roles');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(action) {
    try {
      console.log('Starting handleSubmit:', { action, formData });
      setError(null);
      setTxHash(null);
      setTransactionStatus(null);

      if (!formData.address || !formData.role) {
        setError('Please fill all required fields');
        return;
      }

      let profile;
      switch(formData.role) {
        case 'CONTRIBUTOR':
          profile = 1;
          break;
        case 'VALIDATOR':
          profile = 2;
          break;
        case 'ADMIN':
          profile = 3;
          break;
        default:
          setError('Invalid role');
          return;
      }

      const functionName = action === 'register' ? 'registerMember' : 'revokeMember';

      setPendingFormData({ ...formData, pendingAction: action });

      const tx = await writeContractAsync({
        ...contractConfig,
        functionName,
        args: action === 'register' ? [formData.address, profile] : [formData.address],
      });

      console.log('Transaction submitted:', tx);
      setTxHash(tx);

    } catch (error) {
      console.error('Transaction error:', error);
      setPendingFormData(null);
      setError(error.message || 'Transaction failed');
    }
  }

  function resetForm() {
    setFormData({
      address: '',
      role: '',
      memberId: ''
    });
    setError(null);
    setTxHash(null);
    setTransactionStatus(null);
  }
  
  // =============== RENDER CONDITIONS ===============
  if (!hasAdminRole) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Not authorized
      </div>
    );
  }

  // =============== RENDER ===============
  return (
    <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b mb-6">
          <button
            className={`pb-2 ${activeTab === 'register' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register Role
          </button>
          <button
            className={`pb-2 ${activeTab === 'revoke' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('revoke')}
          >
            Revoke Role
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4">
          
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Organisation
            </label>
            <select
              className="w-full border rounded p-2 bg-white"
              value={formData.memberId}
              onChange={(e) => {
                const selectedMember = members.find(m => m.id === parseInt(e.target.value));
                if (selectedMember) {
                  setFormData({
                    ...formData,
                    memberId: selectedMember.id.toString(),
                    memberName: selectedMember.name,
                    category: selectedMember.category,
                    country: selectedMember.country
                  });
                }
              }}
              required
            >
              <option value="">Select a member organisation</option>
              {members
                .filter(member => member.isVisible) // Ne montrer que les membres visibles
                .sort((a, b) => a.name.localeCompare(b.name)) // Tri alphabétique
                .map(member => (
                  <option 
                    key={member.firestoreId || member.id} 
                    value={member.id}
                  >
                    {member.name} ({member.category} - {member.country})
                  </option>
                ))}
            </select>
          </div>

          {/* Existing Address field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="0x..."
              required
            />
          </div>

          {/* Existing Role field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              className="w-full border rounded p-2 bg-white"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="">Select a role</option>
              {WEB3_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="w-full bg-blue-500 text-white rounded p-2 hover:bg-blue-600 disabled:bg-gray-300"
            onClick={() => handleSubmit(activeTab)}
            disabled={isTxPending || !!pendingFormData || !formData.memberId || !formData.address || !formData.role}
          >
            {isTxPending ? 'Waiting for blockchain confirmation...' : activeTab === 'register' ? 'Register' : 'Revoke'}
          </button>

          {transactionStatus === 'PENDING' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              Transaction submitted. Waiting for blockchain confirmation...
            </div>
          )}
          {transactionStatus === 'CONFIRMED' && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
              Transaction confirmed and recorded successfully.
            </div>
          )}
          {transactionStatus === 'FAILED' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              Transaction failed on blockchain. Please try again.
            </div>
          )}

          {txHash && (
            <div className="mt-2 text-xs text-gray-500">
              Tx: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{txHash.slice(0, 10)}...{txHash.slice(-8)}</a>
            </div>
          )}
        </form>

        {/* Roles Registry */}
                {rolesRegistry.length > 0 && (
                  <RolesTable 
                    rolesRegistry={rolesRegistry} 
                    formatDate={formatDate}
                  />
                )}
              </div>
            </div>
          );
        }