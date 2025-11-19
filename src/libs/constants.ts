// Contract addresses for Invoice System (Rayls Testnet)
// Defaults can be overridden by environment variables
export const IDENTITY_REGISTRY_ADDRESS = (import.meta.env.VITE_IDENTITY_REGISTRY_ADDRESS || '') as `0x${string}`;
export const INVOICE_TOKEN_ADDRESS = (import.meta.env.VITE_INVOICE_TOKEN_ADDRESS || '') as `0x${string}`;
export const INVOICE_VAULT_ADDRESS = (import.meta.env.VITE_INVOICE_VAULT_ADDRESS || '') as `0x${string}`;
