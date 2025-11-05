// =================================================================================
// Import des ABIs et adresses générés depuis les smart contracts
// =================================================================================
import I4TKdocTokenArtifact from '../config/contracts/I4TKdocToken.json';
import contractAddresses from '../config/contracts/addresses.json';

// Déterminer le réseau actif (par défaut Sepolia)
const currentChainId = import.meta.env.VITE_CHAIN_ID || '11155111';

// ⚠️ GARDE DE SÉCURITÉ : Empêcher l'utilisation du mainnet tant que les contrats ne sont pas déployés
if (currentChainId === '1') {
  const mainnetAddresses = contractAddresses['1'];
  if (mainnetAddresses.I4TKdocToken === 'NOT_DEPLOYED_YET' || mainnetAddresses.I4TKnetwork === 'NOT_DEPLOYED_YET') {
    console.error('❌ ERREUR : Les smart contracts ne sont pas encore déployés sur Ethereum Mainnet.');
    console.error('⚠️  Veuillez utiliser Sepolia testnet (VITE_CHAIN_ID=11155111) ou déployer les contrats sur mainnet.');
    throw new Error('Mainnet contracts not deployed. Please use Sepolia testnet or deploy contracts to mainnet first.');
  }
}

// =================================================================================
// Contract Addresses (avec support multi-réseau)
// =================================================================================
export const I4TKTokenAddress = contractAddresses[currentChainId]?.I4TKdocToken || contractAddresses['11155111'].I4TKdocToken;
export const I4TKnetworkAddress = contractAddresses[currentChainId]?.I4TKnetwork || contractAddresses['11155111'].I4TKnetwork;

// =================================================================================
// Contract ABIs (importés depuis les artifacts compilés)
// =================================================================================
export const I4TKTokenABI = I4TKdocTokenArtifact.abi;