# Bunny Game Template

**A starter template for building play-to-earn gamified apps.**

This project is a complete starter kit including a React frontend and a Foundry smart contract environment.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configuration

Copy `env.example` to `.env` and fill in the values:

```bash
cp env.example .env
```

* `VITE_WALLETCONNECT_PROJECT_ID`: Get one from [WalletConnect Cloud](https://cloud.walletconnect.com).
* Contract Addresses: Fill these in after deploying the contracts.

### 3. Smart Contracts

The contracts are located in `contracts/`.

```bash
cd contracts
# Install dependencies
forge install

# Run tests
forge test

# Deploy (example for MegaETH testnet)
forge script script/BunnyGame.s.sol --rpc-url <your_rpc_url> --broadcast --private-key <your_private_key>
```

After deployment, update the contract addresses in your `.env` file in the root directory.

### 4. Generate ABIs

After deploying or modifying contracts, run the ABI fetcher to update the frontend:

```bash
# Run from root
pnpm tsx scripts/fetchABI.ts
```

### 5. Run Frontend

```bash
pnpm dev
```

## Project Structure

- `contracts/`: Foundry project with smart contracts
  - `src/`: Contract source code
    - `tokens/`: ERC20 token contracts
    - `DailyRewards.sol`: Daily check-in logic
    - `BunnyGame.sol`: Main game logic
  - `script/`: Deployment scripts
- `src/`: React frontend
  - `libs/`: ABI and constants (auto-generated via `scripts/fetchABI.ts`)
  - `routes/`: Application pages
  - `wagmi.ts`: Web3 configuration
- `scripts/`: Utility scripts
  - `fetchABI.ts`: Extracts ABIs from Foundry output to frontend

## Tech Stack

- **Frontend**: React 18, TypeScript, TanStack Router, Tailwind CSS 4
- **Blockchain**: Wagmi, Viem, OnchainKit
- **Social**: Farcaster MiniApp SDK
- **Smart Contracts**: Solidity (Foundry)
- **State**: TanStack Query
