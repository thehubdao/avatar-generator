import { createContext, useContext, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

interface BlockchainContextType {
  provider: BrowserProvider | null;
}

const BlockchainContext = createContext<BlockchainContextType>({
  provider: null,
});

export const useBlockchainProvider = () => useContext(BlockchainContext);

interface BlockchainProviderProps {
  children: ReactNode;
  provider: BrowserProvider | null;
}

export function BlockchainProvider({ children, provider }: BlockchainProviderProps) {
  return (
    <BlockchainContext.Provider value={{ provider }}>
      {children}
    </BlockchainContext.Provider>
  );
} 