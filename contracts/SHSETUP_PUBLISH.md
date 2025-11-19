## Setup
chmod +x verify-contracts.sh

## Publish

### Deploy

1. deploy all
```bash
source .env && rm -rf cache out && forge build && forge script --chain 123123 script/DeployInvoiceSystem.s.sol:DeployInvoiceSystem --rpc-url https://devnet-rpc.rayls.com --broadcast --verify --verifier-url https://devnet-explorer.rayls.com/api/eth-rpc -vvvv --private-key ${PRIVATE_KEY} --legacy
```

2. update contract addresses in:
   - src/libs/constants.ts
   - contracts/verify-contracts.sh

3. Set ABI to FE
npx tsx scripts/fetchABI.ts

4. (Optional) Manually verify contracts if automatic verification failed
./verify-contracts.sh
