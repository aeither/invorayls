# Contract ABI and Address Management

This directory contains scripts for managing smart contract ABIs and addresses for the frontend application.

## fetchABI.ts

A dynamic script that extracts ABIs from compiled Solidity contracts and updates the frontend with contract addresses.

### Features

- Extracts ABIs from compiled contracts in `contracts/out/`
- Generates individual TypeScript ABI files for each contract
- Creates a unified `contracts.ts` configuration file with addresses and ABIs
- Updates `.env.local` with contract addresses for environment variable access
- Supports both JSON config file and command-line arguments for addresses

### Usage

#### Option 1: Using deployment-addresses.json (Recommended)

1. Create or update `scripts/deployment-addresses.json`:
```json
{
  "IdentityRegistry": "0xc0Fa47fAD733524291617F341257A97b79488ecE",
  "InvoiceToken": "0xdED87fD6213A8f4ea824B8c74128fAf3DE65BFFE",
  "InvoiceVault": "0x9a486C66c308db15aD6a3d1aF4cb20244bD1e2c3"
}
```

2. Run the script:
```bash
npm run fetch-abi
# or
npx tsx scripts/fetchABI.ts
```

#### Option 2: Using Command-Line Arguments

Pass contract addresses directly as command-line arguments:

```bash
npm run fetch-abi -- \
  --IdentityRegistry=0xc0Fa47fAD733524291617F341257A97b79488ecE \
  --InvoiceToken=0xdED87fD6213A8f4ea824B8c74128fAf3DE65BFFE \
  --InvoiceVault=0x9a486C66c308db15aD6a3d1aF4cb20244bD1e2c3
```

**Note:** Command-line arguments override addresses from `deployment-addresses.json`.

### Generated Files

The script generates the following files:

1. **Individual ABI files** (`src/libs/*ABI.ts`):
   - `identityRegistryABI.ts`
   - `invoiceTokenABI.ts`
   - `invoiceVaultABI.ts`

2. **Unified config file** (`src/libs/contracts.ts`):
   ```typescript
   export const contracts = {
     IdentityRegistry: {
       address: '0x...',
       abi: identityRegistryABI,
     },
     // ... more contracts
   };

   // Individual exports
   export const IDENTITY_REGISTRY_ADDRESS = '0x...';
   export const INVOICE_TOKEN_ADDRESS = '0x...';
   export const INVOICE_VAULT_ADDRESS = '0x...';
   ```

3. **Environment file** (`.env.local`):
   ```env
   VITE_IDENTITY_REGISTRY_ADDRESS=0x...
   VITE_INVOICE_TOKEN_ADDRESS=0x...
   VITE_INVOICE_VAULT_ADDRESS=0x...
   ```

### Using in Your Frontend

#### Method 1: Import from contracts.ts (Recommended)

```typescript
import { contracts } from './libs/contracts';

// Use with wagmi or viem
const { data } = useReadContract({
  address: contracts.IdentityRegistry.address,
  abi: contracts.IdentityRegistry.abi,
  functionName: 'isRegistered',
  args: [userAddress],
});
```

#### Method 2: Import individual exports

```typescript
import { IDENTITY_REGISTRY_ADDRESS } from './libs/contracts';
import { identityRegistryABI } from './libs/identityRegistryABI';

// Use separately
const { data } = useReadContract({
  address: IDENTITY_REGISTRY_ADDRESS,
  abi: identityRegistryABI,
  functionName: 'isRegistered',
  args: [userAddress],
});
```

#### Method 3: Use environment variables (from constants.ts)

```typescript
import { IDENTITY_REGISTRY_ADDRESS } from './libs/constants';
import { identityRegistryABI } from './libs/identityRegistryABI';

// Constants.ts uses env vars with fallbacks to generated addresses
```

### Configuration

Edit `scripts/fetchABI.ts` to customize:

- `TARGET_CONTRACTS`: Array of contract names to process (defaults to Invoice System contracts)
- `CONTRACTS_OUT_DIR`: Directory where compiled contracts are located
- `OUTPUT_DIR`: Directory where generated TypeScript files are saved

### Workflow

1. Deploy your contracts and note the addresses
2. Update `deployment-addresses.json` with the new addresses
3. Run `npm run fetch-abi` to update the frontend
4. Commit the generated files to version control
5. The frontend will automatically use the new addresses and ABIs

### Tips

- Run this script after every contract deployment
- Keep `deployment-addresses.json` in version control for team collaboration
- The `.env.local` file is typically gitignored, but the generated `contracts.ts` is committed
- You can add more contracts by adding their names to `TARGET_CONTRACTS`
