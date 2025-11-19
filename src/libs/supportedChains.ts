import { defineChain } from "viem";

export const raylsTestnet = defineChain({
  id: 123123,
  name: 'Rayls Testnet',
  network: 'rayls-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDgas',
    symbol: 'USDgas',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet-rpc.rayls.com'],
    },
    public: {
      http: ['https://devnet-rpc.rayls.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Rayls Explorer', url: 'https://devnet-explorer.rayls.com' },
  },
});

// Get the supported chain ID from environment variable
const SUPPORTED_CHAIN_ID = parseInt(import.meta.env.VITE_SUPPORTED_CHAIN_ID || '123123');

// Map chain ID to chain object
const getChainFromId = (chainId: number) => {
  switch (chainId) {
    case 123123:
      return raylsTestnet;
    default:
      return raylsTestnet;
  }
};

// Export only the supported chain for this deployment
export const SUPPORTED_CHAIN = getChainFromId(SUPPORTED_CHAIN_ID);
export const SUPPORTED_CHAINS = [SUPPORTED_CHAIN] as const;

// Export chain ID for easy checking
export const SUPPORTED_CHAIN_IDS = [SUPPORTED_CHAIN_ID];
