# Invorayls - Invoice Tokenization Platform UI

## Overview

A modern, responsive frontend application for a regulated real-world asset (RWA) tokenization platform that enables invoice financing through blockchain technology. Built with React, TypeScript, TanStack Router, and Wagmi for seamless Web3 integration.

## Architecture

### Smart Contract Integration

The platform integrates with three core smart contracts:

1. **IdentityRegistry** (ERC-3643 Style)
   - Manages KYC/AML verification
   - Admin-controlled user registration
   - Ensures compliance for all token transfers

2. **InvoiceToken** (ERC-721)
   - Represents invoices as unique NFTs
   - Contains invoice metadata: amount, payer, due date, paid status
   - Permissioned transfers (only verified users)

3. **InvoiceVault** (ERC-4626)
   - ERC-4626 compliant vault for liquidity pooling
   - Accepts USDC deposits from investors
   - Funds invoices selected by admin
   - Earns yield as invoices are repaid

### Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Router** - File-based routing
- **Wagmi** - Web3 React hooks
- **Viem** - Ethereum interactions
- **Framer Motion** - Animations
- **Sonner** - Toast notifications

## Application Structure

```
src/
├── components/
│   ├── InvoiceCard.tsx          # Display invoice details
│   ├── VerificationBanner.tsx   # KYC status indicator
│   ├── VaultStatsCard.tsx       # Vault statistics display
│   ├── BottomNavigation.tsx     # Main navigation
│   ├── GlobalHeader.tsx         # App header with wallet connect
│   └── WalletModal.tsx          # Wallet connection modal
├── routes/
│   ├── __root.tsx               # Root layout
│   ├── index.tsx                # Landing page with role selection
│   ├── business.tsx             # Business user dashboard
│   └── investor.tsx             # Investor dashboard
├── libs/
│   ├── contracts.ts             # Auto-generated contract config
│   ├── identityRegistryABI.ts   # Identity contract ABI
│   ├── invoiceTokenABI.ts       # Invoice token ABI
│   ├── invoiceVaultABI.ts       # Vault ABI
│   └── constants.ts             # App constants
└── scripts/
    └── fetchABI.ts              # Dynamic ABI & address management
```

## User Flows

### Business User Flow

1. **Connect Wallet** - Connect Web3 wallet
2. **KYC Verification** - Verification banner shows status (admin must verify address)
3. **Create Invoice** - Fill form with:
   - Payer address
   - Invoice amount (USDC)
   - Due date
   - Description (optional)
4. **Tokenize** - Mint invoice as ERC-721 NFT
5. **Track Status** - View all invoices with status badges (Pending, Paid, Overdue)
6. **Mark Paid** - Update invoice status when payment is received

#### Business Dashboard Features

- **Verification Status Banner** - Shows KYC verification status
- **Invoice Creation Form** - Easy-to-use form for minting new invoices
- **Invoice Grid** - Visual display of all user's invoices
- **Status Indicators** - Color-coded badges for invoice status
- **Due Date Tracking** - Shows days remaining or overdue
- **Mark as Paid** - Button to update invoice status

### Investor User Flow

1. **Connect Wallet** - Connect Web3 wallet
2. **KYC Verification** - Must be verified to participate
3. **View Vault Stats** - See:
   - Total vault liquidity
   - Your investment amount
   - Share price
4. **Deposit USDC** - Two-step process:
   - Approve USDC spending
   - Deposit USDC to receive ivUSDC vault tokens
5. **Track Portfolio** - Monitor investment and vault performance

#### Investor Dashboard Features

- **Vault Statistics Card** - Real-time vault metrics
- **Deposit Interface** - Approve and deposit USDC
- **Portfolio View** - Track your vault token balance
- **How It Works** - Educational information
- **Compliance Info** - Regulatory notices

### Landing Page

- **Hero Section** - Platform branding and description
- **Role Selection Cards** - Choose Business or Investor path
- **Platform Features** - Highlights key benefits:
  - KYC Compliant (ERC-3643)
  - ERC-4626 Vault
  - Real Assets (NFTs)
  - On-Chain Transparency
- **How It Works** - 4-step process explanation
- **Connection Prompt** - Wallet connection reminder

## Key Components

### InvoiceCard

Displays invoice information with:
- Token ID
- Amount in USDC
- Due date with countdown
- Payer address
- Issuer address (optional)
- Status badge (Paid/Pending/Overdue)
- Action button (customizable)

```typescript
<InvoiceCard
  tokenId={0}
  invoice={invoiceData}
  onAction={handleMarkPaid}
  actionLabel="Mark as Paid"
  actionDisabled={false}
  showIssuer={true}
/>
```

### VerificationBanner

Shows KYC verification status:
- Green banner if verified
- Yellow warning if not verified
- Displays user address for admin verification

```typescript
<VerificationBanner
  isVerified={true}
  userAddress="0x..."
/>
```

### VaultStatsCard

Displays vault metrics:
- Total vault liquidity
- User's investment balance
- Share price
- ERC-4626 info

```typescript
<VaultStatsCard
  totalAssets={vaultAssets}
  userBalance={userShares}
  sharePrice={pricePerShare}
/>
```

## Design System

### Color Scheme

Using CSS variables for consistent theming:

- `--celo-white` - Main background
- `--celo-black` - Text and borders
- `--celo-purple` - Business/primary actions
- `--celo-green` - Investor/success states
- `--celo-yellow` - Warnings/highlights
- `--celo-red` - Errors/overdue
- `--celo-brown` - Secondary text
- `--celo-tan-2` - Cards/backgrounds

### Visual Style

- **Bold Borders** - 2-3px solid black outlines (brutalist style)
- **Card-Based Layout** - Clear content separation
- **Status Colors** - Immediate visual feedback
- **Responsive Grid** - Adapts to all screen sizes
- **Motion** - Subtle animations with Framer Motion

## Smart Contract Interactions

### Reading Data

The UI uses Wagmi's `useReadContract` hook for real-time data:

```typescript
const { data: isVerified } = useReadContract({
  address: contracts.IdentityRegistry.address,
  abi: contracts.IdentityRegistry.abi,
  functionName: 'isVerified',
  args: [userAddress],
});
```

### Writing Transactions

Transaction flow with `useWriteContract`:

```typescript
const { writeContract, data: hash, isPending } = useWriteContract();
const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({ hash });

// Execute transaction
await writeContract({
  address: contracts.InvoiceToken.address,
  abi: contracts.InvoiceToken.abi,
  functionName: 'mintInvoice',
  args: [payer, amount, dueDate, uri],
});
```

### Auto-Generated Contract Config

The `scripts/fetchABI.ts` script automatically:
1. Reads compiled contracts from `contracts/out/`
2. Extracts ABIs
3. Generates TypeScript files
4. Creates unified `contracts.ts` config
5. Updates `.env.local` with addresses

## Compliance & Security Features

### KYC/AML Integration

- **Verification Banner** - Always visible verification status
- **Transaction Guards** - Smart contracts enforce verification
- **Admin Registration** - Controlled onboarding process
- **Address Whitelisting** - Only verified addresses can interact

### Transaction Safety

- **Network Detection** - Warns if wrong network
- **Transaction Status** - Real-time pending/confirming feedback
- **Error Handling** - User-friendly error messages
- **Loading States** - Clear indication of ongoing transactions

### Data Validation

- **Form Validation** - Required fields and data types
- **Address Validation** - Checks for valid Ethereum addresses
- **Amount Validation** - Min/max constraints
- **Date Validation** - Ensures future due dates

## Responsive Design

The UI is fully responsive with:

- **Mobile-First** - Optimized for mobile devices
- **Tablet Support** - Adapts layouts for medium screens
- **Desktop Enhancement** - Full-width layouts on large screens
- **Safe Areas** - Respects notches and system UI

Breakpoints handled with CSS clamp() and grid auto-fit:

```css
font-size: clamp(1rem, 3vw, 1.25rem)
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
```

## Development Workflow

### Adding New Features

1. **Update Smart Contracts** - Modify contracts as needed
2. **Deploy Contracts** - Deploy to testnet/mainnet
3. **Update Addresses** - Edit `scripts/deployment-addresses.json`
4. **Run fetchABI** - `npm run fetch-abi` to update ABIs
5. **Build UI** - Create/update components and routes
6. **Test Flows** - Verify all user interactions

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Update ABIs after contract deployment
npm run fetch-abi

# Build for production
npm run build
```

## Environment Setup

### Required Environment Variables

Create `.env.local`:

```env
VITE_IDENTITY_REGISTRY_ADDRESS=0x...
VITE_INVOICE_TOKEN_ADDRESS=0x...
VITE_INVOICE_VAULT_ADDRESS=0x...
VITE_MOCK_USDC_ADDRESS=0x...
```

These are auto-generated by `fetchABI.ts` script.

### Wallet Configuration

Update `src/wagmi.ts` to configure:
- Supported chains
- RPC providers
- Wallet connectors

## Testing Guide

### Manual Testing Checklist

#### Business User Flow
- [ ] Connect wallet
- [ ] View verification status
- [ ] Create new invoice
- [ ] View invoice list
- [ ] Mark invoice as paid
- [ ] Check wrong network handling
- [ ] Test form validation

#### Investor Flow
- [ ] Connect wallet
- [ ] View vault statistics
- [ ] Approve USDC
- [ ] Deposit USDC
- [ ] Check balance updates
- [ ] View portfolio

#### General
- [ ] Mobile responsiveness
- [ ] Tablet layouts
- [ ] Desktop views
- [ ] Navigation between pages
- [ ] Wallet connection/disconnection
- [ ] Transaction error handling

## Future Enhancements

### Planned Features

1. **Invoice Marketplace** - Browse and purchase invoice NFTs
2. **Risk Scoring** - Display risk metrics per invoice
3. **Historical Analytics** - Charts showing platform performance
4. **Admin Dashboard** - KYC approval interface
5. **Notification System** - Alerts for important events
6. **Multi-Currency Support** - Support for different stablecoins
7. **Invoice Filtering** - Sort and filter by status, amount, etc.
8. **Batch Operations** - Mark multiple invoices as paid
9. **Export Data** - Download invoice reports
10. **Social Features** - Issuer reputation system

### Technical Improvements

- **GraphQL Integration** - Efficient data querying
- **Subgraph Indexing** - Historical data access
- **IPFS Storage** - Decentralized invoice metadata
- **Advanced Caching** - Improved performance
- **PWA Support** - Installable app experience
- **Internationalization** - Multi-language support

## Best Practices

### Code Organization

- **Component Reusability** - Shared components for consistency
- **Type Safety** - Full TypeScript coverage
- **Error Boundaries** - Graceful error handling
- **Loading States** - Clear user feedback
- **Accessibility** - Semantic HTML and ARIA labels

### Performance

- **Code Splitting** - Route-based lazy loading
- **Memoization** - Prevent unnecessary re-renders
- **Optimized Queries** - Efficient contract reads
- **Caching** - Wagmi query caching

### Security

- **Input Sanitization** - Validate all user inputs
- **Transaction Confirmation** - User approval required
- **Error Messages** - No sensitive data exposure
- **Audit Logging** - Track important actions

## Troubleshooting

### Common Issues

**"Connect Wallet" not showing**
- Check MetaMask or wallet extension is installed
- Ensure wallet is unlocked

**"Wrong Network" error**
- Switch to the correct network in your wallet
- Check `supportedChains.ts` configuration

**Transaction failing**
- Ensure user is KYC verified
- Check sufficient USDC balance (for investors)
- Verify gas settings

**ABIs out of date**
- Run `npm run fetch-abi` after contract changes
- Check deployment addresses are correct

## Support & Resources

### Documentation
- [TanStack Router Docs](https://tanstack.com/router)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

### Contract Standards
- [ERC-721 NFT Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-4626 Vault Standard](https://eips.ethereum.org/EIPS/eip-4626)
- [ERC-3643 Security Tokens](https://eips.ethereum.org/EIPS/eip-3643)

---

Built with ❤️ using modern Web3 technologies
