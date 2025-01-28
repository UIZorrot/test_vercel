import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
  Chain
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";



const monad = {
  id: 20143,
  name: 'monad',
  iconUrl: 'https://static.coingecko.com/s/coingecko-logo-cny-2025-c05cad2f9240e35e25c29b877a877358dae01d28243353069be8f7c456783e10.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'DMON', symbol: 'DMON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a'] },
  },
  blockExplorers: {
    default: { name: 'ME', url: 'https://explorer.monad-devnet.devnet101.com/' },
  }
} as const satisfies Chain;


const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '2e6bc42e2496a73ccfd286d2b8b070f8',
  chains: [monad],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode >,
  document.getElementById('root')
);
