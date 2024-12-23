import { createContext, useContext, useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';

interface WalletClientContextType {
  connection: Connection | null;
  isLoading: boolean;
  error: Error | null;
}

const WalletClientContext = createContext<WalletClientContextType>({
  connection: null,
  isLoading: false,
  error: null
});

export const WalletClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return (
    <WalletClientContext.Provider value={{ connection, isLoading, error }}>
      {children}
    </WalletClientContext.Provider>
  );
};

export const useWalletClient = () => useContext(WalletClientContext);
