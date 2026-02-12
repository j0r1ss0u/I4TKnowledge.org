// =================================================================================
// 1. IMPORTS & DEPENDENCIES
// =================================================================================
import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { publicClient } from "../../../utils/client";
import { I4TKTokenAddress, I4TKTokenABI } from "../../../constants";
import { parseBase64DataURL } from "../../../utils/utilis";
import Piechart from "./Piechart";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';

// =================================================================================
// 2. ENVIRONMENT CONFIGURATION
// =================================================================================
// TESTNET SPECIFIC - TO BE REMOVED WHEN DEPLOYING TO PRODUCTION
const TEST_CONFIG = {
  excludeTestTokens: true, // Set to false when deploying to production
  testTokenRange: {
    start: 1,
    end: 49
  },
  totalTestTokens: 4900000000n // Total number of test tokens to exclude
};

// =================================================================================
// 3. COMPONENT DEFINITION
// =================================================================================
const I4TDashboard = () => {
  // -----------------------------------------------------------------------------
  // 3.1 State Management
  // -----------------------------------------------------------------------------
  const { address } = useAccount();
  const [balances, setBalances] = useState([]);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [myTotalBalance, setMyTotalBalance] = useState(0);
  const [networkTotalBalance, setNetworkTotalBalance] = useState(0);

  // -----------------------------------------------------------------------------
  // 3.2 Contract Reads
  // -----------------------------------------------------------------------------
  const { data: lastTokenId } = useReadContract({
    address: I4TKTokenAddress,
    abi: I4TKTokenABI,
    functionName: "lastTokenId",
  });

  const { data: totalSupply } = useReadContract({
    address: I4TKTokenAddress,
    abi: I4TKTokenABI,
    functionName: "totalSupply",
  });

  // =================================================================================
  // 4. UTILITY FUNCTIONS
  // =================================================================================
  const TOKEN_DECIMALS = 100000000; // 1 I4T Token = 100000000 Tokens

  const isTestToken = (tokenId) => {
    if (!TEST_CONFIG.excludeTestTokens) return false;
    const id = Number(tokenId);
    return id >= TEST_CONFIG.testTokenRange.start && id <= TEST_CONFIG.testTokenRange.end;
  };

  const formatTokenAmount = (rawAmount) => {
    if (!rawAmount) return "0.0";
    try {
      const amount = typeof rawAmount === 'bigint' ? Number(rawAmount) : Number(rawAmount);
      if (isNaN(amount)) return "0.0";
      const i4tTokens = amount / TOKEN_DECIMALS;
      return i4tTokens.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return "0.0";
    }
  };

  const getTokenTotalSupply = async (tokenId) => {
    try {
      const supplyFunction = I4TKTokenABI.find(
        item => item.name === "totalSupply" && item.inputs?.length === 1
      );

      if (!supplyFunction) {
        console.error("Could not find totalSupply(uint256) function in ABI");
        return BigInt(0);
      }

      const supply = await publicClient.readContract({
        address: I4TKTokenAddress,
        abi: [supplyFunction],
        functionName: "totalSupply",
        args: [BigInt(tokenId)],
      });

      return supply;
    } catch (error) {
      console.error(`Error getting total supply for token ${tokenId}:`, error);
      return BigInt(0);
    }
  };

  // =================================================================================
  // 5. DATA FETCHING FUNCTIONS
  // =================================================================================
  const getBalance = async (_address, _lastTokenId) => {
    if (!_address || _lastTokenId === undefined) return;

    try {
      const addressArray = Array(Number(_lastTokenId) + 1).fill(_address);
      const tokenIdArray = Array.from({ length: Number(_lastTokenId) + 1 }, (_, i) => i);

      const data = await publicClient.readContract({
        address: I4TKTokenAddress,
        abi: I4TKTokenABI,
        functionName: "balanceOfBatch",
        args: [addressArray, tokenIdArray],
      });

      setBalances(data);
    } catch (error) {
      console.error("Error in getBalance:", error);
      setBalances([]);
    }
  };

  const getTokenUri = async (_balances, _lastTokenId) => {
    if (!_balances || !_lastTokenId) return;

    const newTokens = [];

    for (let i = 0; i < Number(_lastTokenId) + 1; i++) {
      // Skip test tokens based on configuration
      if (TEST_CONFIG.excludeTestTokens && isTestToken(i)) {
        continue;
      }

      if (_balances[i] && _balances[i] !== BigInt(0)) {
        try {
          let tokenData = {
            tokenId: i,
            balance: _balances[i],
            tokenURIJson: {
              name: `I4TK Token #${i}`,
              properties: {
                title: `Document #${i}`,
                description: "Loading metadata..."
              }
            }
          };

          try {
            const URI = await publicClient.readContract({
              address: I4TKTokenAddress,
              abi: I4TKTokenABI,
              functionName: "uri",
              args: [BigInt(i)],
            });

            if (URI && URI.startsWith('data:application/json;base64,')) {
              tokenData.tokenURIJson = parseBase64DataURL(URI);
            } else if (URI && URI.startsWith('Qm')) {
              const response = await fetch(`https://gateway.pinata.cloud/ipfs/${URI}`);
              if (response.ok) {
                const json = await response.json();
                if (json.name && json.properties) {
                  tokenData.tokenURIJson = json;
                }
              }
            }
          } catch (metadataError) {
            console.log(`Blockchain metadata failed for token ${i}, trying Firestore`);

            const documentsRef = collection(db, 'web3IP');
            const q = query(documentsRef, where('tokenId', '==', i.toString()));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              const doc = snapshot.docs[0].data();
              tokenData.tokenURIJson = {
                name: doc.title || `I4TK Token #${i}`,
                properties: {
                  title: doc.title || `Document #${i}`,
                  description: doc.description || "No description available"
                }
              };
            }
          }

          // Calculate ownership percentage
          const totalSupply = await getTokenTotalSupply(i);
          if (totalSupply > BigInt(0)) {
            const percentage = (Number(tokenData.balance) / Number(totalSupply)) * 100;
            tokenData.ownershipPercentage = percentage;
          }

          newTokens.push(tokenData);
        } catch (error) {
          console.error(`Error processing token ${i}:`, error);
        }
      }
    }

    setOwnedTokens(newTokens);
  };

  // =================================================================================
  // 6. EFFECTS & DATA PROCESSING
  // =================================================================================
  // 6.1 Initial balance fetch
  useEffect(() => {
    if (address && lastTokenId !== undefined) {
      getBalance(address, lastTokenId);
    }
  }, [address, lastTokenId]);

  // 6.2 Network total supply update
  useEffect(() => {
    if (totalSupply === undefined) return;

    try {
      let total = typeof totalSupply === 'bigint' ? totalSupply : BigInt(totalSupply);

      // If excluding test tokens, subtract their fixed total supply
      if (TEST_CONFIG.excludeTestTokens) {
        total = total - TEST_CONFIG.totalTestTokens;
      }

      setNetworkTotalBalance(Number(total));
    } catch (error) {
      console.error("Error calculating network total:", error);
      setNetworkTotalBalance(0);
    }
  }, [totalSupply]);

  // 6.3 Token URI and metadata fetch
  useEffect(() => {
    if (balances?.length > 0 && lastTokenId !== undefined) {
      getTokenUri(balances, lastTokenId);
    }
  }, [balances, lastTokenId]);

  // 6.4 Total balance calculation
  useEffect(() => {
    if (ownedTokens.length > 0) {
      const total = ownedTokens.reduce((acc, token) => {
        const tokenValue = typeof token.balance === 'bigint' ? Number(token.balance) : Number(token.balance || 0);
        return acc + tokenValue;
      }, 0);
      setMyTotalBalance(total);
    } else {
      setMyTotalBalance(0);
    }
  }, [ownedTokens]);

  // =================================================================================
  // 7. RENDER
  // =================================================================================
  return (
    <div className="bg-white">
      {/* Title */}
      <div className="mx-auto max-w-2xl px-0 py-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-2">
        <h1 className="text-4xl font-serif tracking-tight text-gray-900 mb-8">
          
        </h1>
      </div>

      {/* Statistics Section */}
      <div className="mx-auto max-w-2xl px-0 py-0 sm:px-6 sm:py-2 lg:max-w-7xl lg:px-2">
        <h2 className="text-2xl font-serif tracking-tight text-gray-900">Community statistics</h2>
        <h3 className="text-lg font-serif text-gray-600 mt-2">
          Network total IP value: {formatTokenAmount(networkTotalBalance)} i4t Tokens
        </h3>
        <div className="mt-4">
          <Piechart myBalance={myTotalBalance} totalSupply={networkTotalBalance} />
        </div>
      </div>

      {/* NFTs Grid */}
      <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-2">
        <h2 className="text-2xl font-serif tracking-tight text-gray-900">My intellectual property in i4t tokens</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {ownedTokens.map((token) => (
            <div key={token.tokenId} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 relative">
                <img
                  src="/assets/logos/I4T token.jpeg"
                  className="h-full w-full object-contain object-center lg:h-full lg:w-full"
                  alt={token.tokenURIJson.name}
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {token.tokenURIJson.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {token.tokenURIJson.properties.title}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-700">Token #{token.tokenId}</p>
                  <p className="text-sm font-medium text-blue-600">
                    {formatTokenAmount(token.balance)} i4t Tokens
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ownedTokens.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No documents found for this address
          </div>
        )}
      </div>
    </div>
  );
};

export default I4TDashboard;