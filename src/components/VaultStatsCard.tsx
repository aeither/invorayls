import { formatEther, formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, PieChart, Info } from 'lucide-react';

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
  const totalAssetsFormatted = parseFloat(formatUnits(totalAssets, 6));
  const userBalanceFormatted = parseFloat(formatUnits(userBalance, 6));
  const sharePriceFormatted = sharePrice
    ? parseFloat(formatUnits(sharePrice, 6))
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 mb-8"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white mb-6">
        <TrendingUp className="text-cyan-400" size={18} />
        Vault Statistics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Vault Assets */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} />
          </div>

          <div className="relative z-10">
            <div className="text-xs font-bold text-blue-200/50 uppercase tracking-wider mb-2">
              Total Liquidity
            </div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">
              ${totalAssetsFormatted.toFixed(2)}
            </div>
            <div className="text-xs font-medium text-cyan-400">
              USDC
            </div>
          </div>
        </div>

        {/* User Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-cyan-400">
            <PieChart size={64} />
          </div>

          <div className="relative z-10">
            <div className="text-xs font-bold text-cyan-200/70 uppercase tracking-wider mb-2">
              Your Investment
            </div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              ${userBalanceFormatted.toFixed(2)}
            </div>
            <div className="text-xs font-medium text-cyan-200">
              ivUSDC Shares
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Info size={16} />
          </div>
          <div>
            <div className="text-xs font-medium text-blue-200/70">
              ERC-4626 compliant vault
            </div>
            <div className="text-[10px] text-blue-200/40 uppercase tracking-wider">
              Regulated RWA Investment
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-blue-200/50 uppercase tracking-wider mb-0.5">
            Share Price
          </div>
          <div className="text-sm font-bold text-white font-mono">
            ${sharePriceFormatted.toFixed(4)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
