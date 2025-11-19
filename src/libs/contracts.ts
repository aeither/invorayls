// Auto-generated contract configuration
// Generated on: 2025-11-19T13:04:32.201Z
import { identityRegistryABI } from './identityRegistryABI';
import { invoiceTokenABI } from './invoiceTokenABI';
import { invoiceVaultABI } from './invoiceVaultABI';
import { mockUSDCABI } from './mockUSDCABI';

export const contracts = {
  IdentityRegistry: {
    address: '0xC47FB09EB22EA40c4659DD363BcE48fF033D7Ca1' as `0x${string}`,
    abi: identityRegistryABI,
  },
  InvoiceToken: {
    address: '0x803b420e3706DB411D71678278Dd870eF7cdab07' as `0x${string}`,
    abi: invoiceTokenABI,
  },
  InvoiceVault: {
    address: '0x9D4506E5A94C86DC51853aDE46ef46Debbd9423F' as `0x${string}`,
    abi: invoiceVaultABI,
  },
  MockUSDC: {
    address: '0x2258DD0849CC778D6810641Ff62DFcfc5D9413EC' as `0x${string}`,
    abi: mockUSDCABI,
  },
} as const;

// Export individual addresses for convenience
export const IDENTITY_REGISTRY_ADDRESS = '0xC47FB09EB22EA40c4659DD363BcE48fF033D7Ca1' as `0x${string}`;
export const INVOICE_TOKEN_ADDRESS = '0x803b420e3706DB411D71678278Dd870eF7cdab07' as `0x${string}`;
export const INVOICE_VAULT_ADDRESS = '0x9D4506E5A94C86DC51853aDE46ef46Debbd9423F' as `0x${string}`;
export const MOCK_U_S_D_C_ADDRESS = '0x2258DD0849CC778D6810641Ff62DFcfc5D9413EC' as `0x${string}`;
