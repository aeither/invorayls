#!/bin/bash

# Grant roles manually using cast commands
# Use this if the deployment script's grantRole calls failed

# Source environment variables
source .env

# MegaETH Testnet configuration
RPC_URL="${RPC_URL:-https://carrot.megaeth.com/rpc}"

# Contract addresses on MegaETH Testnet
EGG_TOKEN="${EGG_TOKEN:-0xBe48cc5d1686df3E15d1a6B4F0D11621083e3875}"
MEGAEGG="${MEGAEGG:-0xC0ba707d3AFbbC54c97466E32679b284849bb2FD}"
BUNNYGAME="${BUNNYGAME:-0x6293050ef633619D108Da67050dab5300bB80154}"
DAILY_REWARDS="${DAILY_REWARDS:-0x11fb438757971365fd1F7bF81Bd90F2B76aC2154}"

# MINTER_ROLE hash (keccak256("MINTER_ROLE"))
MINTER_ROLE="0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"

echo "🔑 Granting roles on MegaETH Testnet..."
echo "======================================"
echo "EggToken:     $EGG_TOKEN"
echo "MegaEgg:      $MEGAEGG"
echo "BunnyGame:    $BUNNYGAME"
echo "DailyRewards: $DAILY_REWARDS"
echo "======================================"
echo ""

# 1. Grant MINTER_ROLE on EggToken to BunnyGame
echo "1️⃣ Granting EggToken MINTER_ROLE to BunnyGame..."
cast send $EGG_TOKEN \
  "grantRole(bytes32,address)" \
  $MINTER_ROLE \
  $BUNNYGAME \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  || echo "❌ Failed to grant EggToken MINTER_ROLE to BunnyGame"

echo ""

# 2. Grant MINTER_ROLE on EggToken to DailyRewards
echo "2️⃣ Granting EggToken MINTER_ROLE to DailyRewards..."
cast send $EGG_TOKEN \
  "grantRole(bytes32,address)" \
  $MINTER_ROLE \
  $DAILY_REWARDS \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  || echo "❌ Failed to grant EggToken MINTER_ROLE to DailyRewards"

echo ""

# 3. Grant MINTER_ROLE on MegaEgg to BunnyGame
echo "3️⃣ Granting MegaEgg MINTER_ROLE to BunnyGame..."
cast send $MEGAEGG \
  "grantRole(bytes32,address)" \
  $MINTER_ROLE \
  $BUNNYGAME \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  || echo "❌ Failed to grant MegaEgg MINTER_ROLE to BunnyGame"

echo ""
echo "✅ Role granting complete!"
echo ""

# Verify roles were granted
echo "🔍 Verifying roles..."
echo "======================================"

echo -n "BunnyGame has EggToken MINTER_ROLE: "
RESULT=$(cast call $EGG_TOKEN \
  "hasRole(bytes32,address)(bool)" \
  $MINTER_ROLE \
  $BUNNYGAME \
  --rpc-url $RPC_URL)
if [ "$RESULT" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
  echo "✅ YES"
else
  echo "❌ NO"
fi

echo -n "DailyRewards has EggToken MINTER_ROLE: "
RESULT=$(cast call $EGG_TOKEN \
  "hasRole(bytes32,address)(bool)" \
  $MINTER_ROLE \
  $DAILY_REWARDS \
  --rpc-url $RPC_URL)
if [ "$RESULT" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
  echo "✅ YES"
else
  echo "❌ NO"
fi

echo -n "BunnyGame has MegaEgg MINTER_ROLE: "
RESULT=$(cast call $MEGAEGG \
  "hasRole(bytes32,address)(bool)" \
  $MINTER_ROLE \
  $BUNNYGAME \
  --rpc-url $RPC_URL)
if [ "$RESULT" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
  echo "✅ YES"
else
  echo "❌ NO"
fi

echo "======================================"
echo ""
echo "🎉 All done! Your contracts should now be ready to use."
