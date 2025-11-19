// Contract addresses for Invoice System (Rayls Testnet)
// Auto-generated addresses from deployment, can be overridden by environment variables
import {
  IDENTITY_REGISTRY_ADDRESS as GENERATED_IDENTITY_REGISTRY_ADDRESS,
  INVOICE_TOKEN_ADDRESS as GENERATED_INVOICE_TOKEN_ADDRESS,
  INVOICE_VAULT_ADDRESS as GENERATED_INVOICE_VAULT_ADDRESS
} from './contracts';

export const IDENTITY_REGISTRY_ADDRESS = (import.meta.env.VITE_IDENTITY_REGISTRY_ADDRESS || GENERATED_IDENTITY_REGISTRY_ADDRESS) as `0x${string}`;
export const INVOICE_TOKEN_ADDRESS = (import.meta.env.VITE_INVOICE_TOKEN_ADDRESS || GENERATED_INVOICE_TOKEN_ADDRESS) as `0x${string}`;
export const INVOICE_VAULT_ADDRESS = (import.meta.env.VITE_INVOICE_VAULT_ADDRESS || GENERATED_INVOICE_VAULT_ADDRESS) as `0x${string}`;
