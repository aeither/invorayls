// Auto-generated contract configuration
// Generated on: 2025-11-19T12:23:28.662Z
import { identityRegistryABI } from './identityRegistryABI';
import { invoiceTokenABI } from './invoiceTokenABI';
import { invoiceVaultABI } from './invoiceVaultABI';

export const contracts = {
  IdentityRegistry: {
    address: '0xc0Fa47fAD733524291617F341257A97b79488ecE' as `0x${string}`,
    abi: identityRegistryABI,
  },
  InvoiceToken: {
    address: '0xdED87fD6213A8f4ea824B8c74128fAf3DE65BFFE' as `0x${string}`,
    abi: invoiceTokenABI,
  },
  InvoiceVault: {
    address: '0x9a486C66c308db15aD6a3d1aF4cb20244bD1e2c3' as `0x${string}`,
    abi: invoiceVaultABI,
  },
} as const;

// Export individual addresses for convenience
export const IDENTITY_REGISTRY_ADDRESS = '0xc0Fa47fAD733524291617F341257A97b79488ecE' as `0x${string}`;
export const INVOICE_TOKEN_ADDRESS = '0xdED87fD6213A8f4ea824B8c74128fAf3DE65BFFE' as `0x${string}`;
export const INVOICE_VAULT_ADDRESS = '0x9a486C66c308db15aD6a3d1aF4cb20244bD1e2c3' as `0x${string}`;
