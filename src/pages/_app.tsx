import React, { useMemo, useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import GlobalStyle from '@/styles/globalStyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { Chain } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import { ethers } from 'ethers';

import Navigation from '@/components/organization/navi';
import { sepolia } from 'wagmi/chains';

// const storyProtocolTestnet: Chain = {
//   id: 1516,
//   name: 'Story Odyssey Testnet',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Story',
//     symbol: 'STORY', 
//   },
//   rpcUrls: {
//     public: { http: ['https://rpc.odyssey.storyrpc.io/'] },
//     default: { http: ['https://rpc.odyssey.storyrpc.io/'] },
//   },
//   blockExplorers: {
//     default: { name: 'StoryExplorer', url: 'https://odyssey.storyscan.xyz/' },
//   },
//   testnet: true,
// };

// const bsc: Chain = {
//   id: 56,
//   name: 'BNB Smart Chain',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'BNB',
//     symbol: 'BNB',
//   },
//   rpcUrls: {
//     public: { http: ['https://bsc-dataseed.binance.org'] },
//     default: { http: ['https://bsc-dataseed.binance.org'] },
//   },
//   blockExplorers: {
//     default: { name: 'BscScan', url: 'https://bscscan.com' },
//   },
//   testnet: false,
// };

const baseSepolia: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'OVERDIVE',
  projectId: '90d21aa6b0788c4e34dc7e90416730c5',
  // chains: [storyProtocolTestnet, bsc, baseSepolia],
  chains: [baseSepolia],
  ssr: true,
});

declare global {
  interface Window {
    ethereum?: any;
  }
}

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: 'var(--color-main-yellow)',
          accentColorForeground: 'black',
          borderRadius: 'medium',
          fontStack: 'rounded',
          overlayBlur: 'small',
        })}>
          <GlobalStyle />
          <Navigation />
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;