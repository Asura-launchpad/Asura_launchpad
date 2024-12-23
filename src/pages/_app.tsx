import React from 'react';
import type { AppProps } from 'next/app';
import GlobalStyle from '@/styles/globalStyles';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './main.module.scss';

import Navigation from '@/components/organization/navi';
import { WalletClientProvider } from '@/contract/WalletClientContext';

require('@solana/wallet-adapter-react-ui/styles.css');

// 클라이언트 사이드에서만 렌더링되도록 설정
const WalletComponent = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => 
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
    , []);
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletComponent>
      <WalletClientProvider>
        <div className={styles.container}>
          <GlobalStyle />
          <Navigation />
          <Component {...pageProps} />
        </div>
      </WalletClientProvider>
    </WalletComponent>
  );
}

export default MyApp;