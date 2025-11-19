// Auto-generated contract configuration
// Generated on: 2025-11-19T12:43:22.748Z
import { identityRegistryABI } from './identityRegistryABI';
import { invoiceTokenABI } from './invoiceTokenABI';
import { invoiceVaultABI } from './invoiceVaultABI';

export const contracts = {
  IdentityRegistry: {
    address: '0xD0084995B78D9720C2D463513B16bdB19Fc7368f' as `0x${string}`,
    abi: identityRegistryABI,
  },
  InvoiceToken: {
    address: '0xd5D190C96ACa94070757168934081F590bE1fD1d' as `0x${string}`,
    abi: invoiceTokenABI,
  },
  InvoiceVault: {
    address: '0x59dbC03fDbF76513844D2623d73Bcb7a054DE58F' as `0x${string}`,
    abi: invoiceVaultABI,
  },
} as const;

// Export individual addresses for convenience
export const IDENTITY_REGISTRY_ADDRESS = '0xD0084995B78D9720C2D463513B16bdB19Fc7368f' as `0x${string}`;
export const INVOICE_TOKEN_ADDRESS = '0xd5D190C96ACa94070757168934081F590bE1fD1d' as `0x${string}`;
export const INVOICE_VAULT_ADDRESS = '0x59dbC03fDbF76513844D2623d73Bcb7a054DE58F' as `0x${string}`;
