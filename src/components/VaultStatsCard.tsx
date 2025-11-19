import { formatEther } from 'viem';
import { motion } from 'framer-motion';

interface VaultStatsCardProps {
  totalAssets: bigint;
  userBalance: bigint;
  sharePrice?: bigint;
}

export default function VaultStatsCard({
  totalAssets,
  userBalance,
  sharePrice,
}: VaultStatsCardProps) {
  const totalAssetsFormatted = parseFloat(formatEther(totalAssets));
  const userBalanceFormatted = parseFloat(formatEther(userBalance));
  const sharePriceFormatted = sharePrice
    ? parseFloat(formatEther(sharePrice))
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'hsl(var(--celo-white))',
        border: '3px solid hsl(var(--celo-black))',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: '1rem',
          fontSize: '1rem',
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }}
      >
        📊 Vault Statistics
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        {/* Total Vault Assets */}
        <div
          style={{
            background: 'hsl(var(--celo-tan-2))',
            padding: '1rem',
            border: '2px solid hsl(var(--celo-black))',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: 'hsl(var(--celo-brown))',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Total Liquidity
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${totalAssetsFormatted.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--celo-brown))' }}>
            USDC
          </div>
        </div>

        {/* User Balance */}
        <div
          style={{
            background: 'hsl(var(--celo-purple))',
            padding: '1rem',
            border: '2px solid hsl(var(--celo-black))',
            color: 'white',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              opacity: 0.9,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Your Investment
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${userBalanceFormatted.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            ivUSDC Shares
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'hsl(var(--celo-tan-2))',
          border: '2px solid hsl(var(--celo-black))',
          fontSize: '0.8rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.25rem',
          }}
        >
          <span style={{ color: 'hsl(var(--celo-brown))' }}>Share Price:</span>
          <span style={{ fontWeight: 'bold' }}>
            ${sharePriceFormatted.toFixed(4)}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))' }}>
          ERC-4626 compliant vault for invoice financing
        </div>
      </div>
    </motion.div>
  );
}
