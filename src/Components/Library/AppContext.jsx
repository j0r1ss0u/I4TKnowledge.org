// =============== IMPORTS ===============
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";
import { contractConfig } from "../../config/wagmiConfig";

// =============== CONTEXT CREATION ===============
const AppContext = createContext();

// =============== PROVIDER COMPONENT ===============
export function AppProvider({ children }) {
  const [profile, setProfile] = useState(0);
  const { address, isConnected } = useAccount();

  const { data: profileData } = useContractRead({
    ...contractConfig,
    functionName: 'getMemberProfile',
    args: [address],
    enabled: !!address,
    watch: true
  });

  useEffect(() => {
    if (profileData) {
      setProfile(Number(profileData));
    }
  }, [profileData]);

  return (
    <AppContext.Provider value={{ 
      address, 
      isConnected, 
      profile,
      isAdmin: profile === 3,
      isValidator: profile >= 2,
      isContributor: profile >= 1
    }}>
      {children}
    </AppContext.Provider>
  );
}

// =============== HOOK ===============
export function UseAppContext() {
  return useContext(AppContext);
}