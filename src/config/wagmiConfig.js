import { http, createConfig } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { createPublicClient, createWalletClient, custom } from 'viem';

// Import des ABIs et adresses générés depuis les smart contracts
import I4TKNetworkArtifact from './contracts/I4TKNetwork.json';
import contractAddresses from './contracts/addresses.json';

// Déterminer la chaîne active (par défaut Sepolia)
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

export const activeChain = currentChainId === '1' ? mainnet : sepolia;

// Configuration des chaînes
export const chains = [sepolia, mainnet];

// Configuration du client public
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http()
});

// Configuration du wallet client
export const walletClient = typeof window !== 'undefined' && window.ethereum
  ? createWalletClient({
      chain: activeChain,
      transport: custom(window.ethereum)
    })
  : undefined;

// Configuration Wagmi
export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http()
  },
  connectors: [
    injected({
      shimDisconnect: false,
      target: 'metaMask'
    })
  ]
});

// =============== CONTRACT CONFIGURATION ===============
// Récupérer l'adresse du contrat I4TKnetwork selon le réseau actif
const networkAddress = contractAddresses[currentChainId]?.I4TKnetwork || contractAddresses['11155111'].I4TKnetwork;

export const contractConfig = {
  address: networkAddress,
  roles: {
    CONTRIBUTOR_ROLE: '0xe2889e7308860b3fe8df0daa86fccfea4d71e43776719a57be28cf90b6db81e9',
    VALIDATOR_ROLE: '0x21702c8af46127c7fa207f89d0b0a8441bb32959a0ac7df790e9ab1a25c98926',
    ADMIN_ROLE: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
    MINTER_ROLE: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
  },
  abi: I4TKNetworkArtifact.abi
};

// =============== CONTRACT HELPERS ===============
export const getContractConfig = () => {
  return {
    address: contractConfig.address,
    abi: contractConfig.abi
  };
};

// =============== ROLE HELPERS ===============
export const getRoleHash = (role) => {
  return contractConfig.roles[`${role}_ROLE`];
};

export default config;