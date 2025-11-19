import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';
import { SUPPORTED_CHAINS } from './libs/supportedChains';

// RPC URLs by chain ID - using reliable public endpoints
const RPC_URLS: Record<number, string> = {
  42220: import.meta.env.VITE_RPC_URL_42220 || 'https://forno.celo.org', // Celo Mainnet official RPC
  8453: import.meta.env.VITE_RPC_URL_8453 || 'https://mainnet.base.org', // Base Mainnet official RPC
  41923: import.meta.env.VITE_RPC_URL_41923 || 'https://rpc.edu-chain.raas.gelato.cloud', // EDU Chain
  123123: import.meta.env.VITE_RPC_URL_123123 || 'https://devnet-rpc.rayls.com', // Rayls Testnet
};

// Create transport configuration for all supported chains
const transports = SUPPORTED_CHAINS.reduce((acc, chain) => {
  const rpcUrl = RPC_URLS[chain.id];
  acc[chain.id] = http(rpcUrl);
  return acc;
}, {} as Record<number, any>);

const config = createConfig({
  chains: SUPPORTED_CHAINS,
  transports,
  connectors: [
    metaMask(),                    // MetaMask browser extension
    miniAppConnector(),            // Farcaster Mini App connector
    walletConnect({                // WalletConnect QR code
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
    }),
    injected(),                    // Generic browser wallets
  ],
  ssr: false,
  storage: createStorage({
    storage: cookieStorage,
  }),
  multiInjectedProviderDiscovery: true, // Auto-detect multiple injected wallets
});

export { config };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
