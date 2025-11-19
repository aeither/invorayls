#!/bin/bash

# Source environment variables
source .env

# Clean and rebuild contracts
echo "🧹 Cleaning and rebuilding contracts..."
rm -rf cache out
forge build

echo ""
echo "📋 Contract Addresses:"
echo "======================================"

# Contract addresses on Rayls Testnet (Update these after deployment)
IDENTITY_REGISTRY_ADDRESS="0x..."
INVOICE_TOKEN_ADDRESS="0x..."
INVOICE_VAULT_ADDRESS="0x..."

echo "IdentityRegistry: $IDENTITY_REGISTRY_ADDRESS"
echo "InvoiceToken:     $INVOICE_TOKEN_ADDRESS"
echo "InvoiceVault:     $INVOICE_VAULT_ADDRESS"
echo "======================================"
echo ""

# Rayls Testnet configuration
CHAIN_ID=123123
RPC_URL="https://devnet-rpc.rayls.com"
EXPLORER_API="https://devnet-explorer.rayls.com/api/eth-rpc"

echo "🔍 Verifying contracts on Rayls Testnet..."
echo ""

# Verify IdentityRegistry (no constructor args)
echo "1️⃣ Verifying IdentityRegistry..."
forge verify-contract \
  --chain-id $CHAIN_ID \
  --rpc-url $RPC_URL \
  --verifier blockscout \
  --verifier-url "$EXPLORER_API" \
  $IDENTITY_REGISTRY_ADDRESS \
  src/IdentityRegistry.sol:IdentityRegistry \
  || echo "❌ IdentityRegistry verification failed"

echo ""

# Verify InvoiceToken (constructor: address _identity)
echo "2️⃣ Verifying InvoiceToken..."
INVOICE_TOKEN_ARGS=$(cast abi-encode "constructor(address)" "$IDENTITY_REGISTRY_ADDRESS")
forge verify-contract \
  --chain-id $CHAIN_ID \
  --rpc-url $RPC_URL \
  --verifier blockscout \
  --verifier-url "$EXPLORER_API" \
  --constructor-args $INVOICE_TOKEN_ARGS \
  $INVOICE_TOKEN_ADDRESS \
  src/InvoiceToken.sol:InvoiceToken \
  || echo "❌ InvoiceToken verification failed"

echo ""

# Verify InvoiceVault (constructor: address _identity, address _token)
echo "3️⃣ Verifying InvoiceVault..."
INVOICE_VAULT_ARGS=$(cast abi-encode "constructor(address,address)" "$IDENTITY_REGISTRY_ADDRESS" "$INVOICE_TOKEN_ADDRESS")
forge verify-contract \
  --chain-id $CHAIN_ID \
  --rpc-url $RPC_URL \
  --verifier blockscout \
  --verifier-url "$EXPLORER_API" \
  --constructor-args $INVOICE_VAULT_ARGS \
  $INVOICE_VAULT_ADDRESS \
  src/InvoiceVault.sol:InvoiceVault \
  || echo "❌ InvoiceVault verification failed"

echo ""
echo "✅ Verification process complete!"
echo ""
echo "🔗 View on Explorer:"
echo "IdentityRegistry: https://devnet-explorer.rayls.com/address/$IDENTITY_REGISTRY_ADDRESS"
echo "InvoiceToken:     https://devnet-explorer.rayls.com/address/$INVOICE_TOKEN_ADDRESS"
echo "InvoiceVault:     https://devnet-explorer.rayls.com/address/$INVOICE_VAULT_ADDRESS"
