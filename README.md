# InvoRayls

**A regulated real-world asset (RWA) tokenization platform for invoice financing.**

## Overview

InvoRayls bridges the gap between traditional invoice financing and DeFi liquidity. It allows businesses to tokenize their outstanding invoices as NFTs and access early payment from a liquidity pool funded by investors. The platform ensures regulatory compliance through on-chain identity verification (ERC-3643 style) and uses standard ERC-4626 vaults for efficient capital management.

## Problem & Solution

1.  **Liquidity Trap:** Small businesses wait 30-90 days for payments, stifling growth.
    *   **Solution:** Instant liquidity by tokenizing invoices and collateralizing them against a decentralized lending pool.
2.  **Regulatory Barriers:** DeFi pools often lack the compliance required for institutional capital.
    *   **Solution:** Integrated Identity Registry ensuring only KYC-verified participants (Issuers and Investors) can transact.
3.  **Fragmented Standards:** Custom implementation risks security and interoperability.
    *   **Solution:** Built on robust standards—ERC-721 for unique assets (invoices) and ERC-4626 for standardized, yield-bearing vaults.

## Architecture

The system consists of three core smart contracts working in unison:

*   **IdentityRegistry.sol**: Acts as the gatekeeper. It maintains a whitelist of verified addresses (Business/Investor). All restricted actions (minting invoices, depositing funds) check against this registry first.
*   **InvoiceToken.sol (ERC-721)**: Represents the invoice as a unique NFT.
    *   Stores metadata: Amount, Due Date, Issuer, Payer.
    *   Enforces permissioned transfers; tokens can only be transferred to verified addresses.
*   **InvoiceVault.sol (ERC-4626)**: The liquidity engine.
    *   **Investors** deposit USDC to receive `ivUSDC` (vault shares).
    *   **The Vault** funds valid invoices, transferring USDC to the issuer.
    *   **Repayment** flows back into the vault, increasing the value of shares for all investors.

### Frontend
- **Business Dashboard**: Mint new invoices, track status, and mark as paid.
- **Investor Dashboard**: Deposit/Withdraw USDC, view APY, and track portfolio performance.
- **Tech Stack**: React 18, TypeScript, Wagmi/Viem, Tailwind CSS 4, Foundry.

## Details

### Smart Contracts
Located in `contracts/src/`:
- `InvoiceToken.sol`: NFT logic with `_beforeTokenTransfer` hooks for identity checks.
- `InvoiceVault.sol`: Extension of OpenZeppelin's ERC4626 to handle invoice funding logic.
- `IdentityRegistry.sol`: Simple allowlist management for simulation.

### Getting Started

**1. Install Dependencies**
```bash
pnpm install
cd contracts && forge install
```

**2. Deploy Contracts**
```bash
# In /contracts directory
forge script script/DeployInvoiceSystem.s.sol --rpc-url <your_rpc> --broadcast
```

**3. Configure Frontend**
- Copy `env.example` to `.env`.
- Update contract addresses in `scripts/deployment-addresses.json` or `.env` if applicable.
- Run `pnpm tsx scripts/fetchABI.ts` to sync ABIs.

**4. Run App**
```bash
pnpm dev
```

## What Next

-   **Credit Scoring**: Integrate off-chain credit risk assessment (Oracle) to set dynamic interest rates per invoice.
-   **Secondary Market**: Allow investors to trade fractionalized parts of specific high-yield invoices.
-   **Automated Repayment**: Integrate with payment gateways to automatically settle on-chain debt when fiat payment is received.
-   **Legal Framework**: Wrap the DAO/Vault in a legal entity to enforce real-world claims on defaulted invoices.
