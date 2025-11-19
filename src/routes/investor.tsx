import { createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { parseUnits, formatEther, formatUnits } from 'viem';
import {
  TrendingUp,
  Wallet,
  PieChart,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import VerificationBanner from '../components/VerificationBanner';
import VaultStatsCard from '../components/VaultStatsCard';
import RiskProfileSection from '../components/RiskProfileSection';
import { contracts } from '../libs/contracts';
import { SUPPORTED_CHAIN } from '../libs/supportedChains';

function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Tabs
  const [activeTab, setActiveTab] = useState<'invest' | 'portfolio'>('invest');

  // Investment form
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);

  // Check if user is verified
  const { data: isVerified } = useReadContract({
    address: contracts.IdentityRegistry.address,
    abi: contracts.IdentityRegistry.abi,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Vault stats
  const { data: totalAssets, refetch: refetchAssets } = useReadContract({
    address: contracts.InvoiceVault.address,
    abi: contracts.InvoiceVault.abi,
    functionName: 'totalAssets',
    query: { refetchInterval: 5000 },
  });

  const { data: userVaultBalance, refetch: refetchBalance } = useReadContract({
    address: contracts.InvoiceVault.address,
    abi: contracts.InvoiceVault.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // USDC balance (for deposits)
  const { data: usdcBalance } = useReadContract({
    address: contracts.InvoiceVault.address,
    abi: contracts.InvoiceVault.abi,
    functionName: 'asset',
  });

  // Fetch USDC decimals
  const { data: usdcDecimals } = useReadContract({
    address: usdcBalance as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'decimals',
    query: { enabled: !!usdcBalance },
  });

  const { data: userUsdcBalance } = useReadContract({
    address: usdcBalance as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdcBalance },
  });

  // Fetch vault token decimals
  const { data: vaultDecimals } = useReadContract({
    address: contracts.InvoiceVault.address,
    abi: contracts.InvoiceVault.abi,
    functionName: 'decimals',
  });

  // Contract writes
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      if (pendingAction === 'deposit') {
        toast.success('✅ Deposit successful!');
        refetchAssets();
        refetchBalance();
        setShowDepositForm(false);
        setDepositAmount('');
      } else if (pendingAction === 'approve') {
        toast.success('✅ USDC approved! Now you can deposit.');
      }
      setPendingAction(null);
    }
  }, [isConfirmed, hash, pendingAction]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || chainId !== SUPPORTED_CHAIN.id) {
      toast.error('Please connect to correct network');
      return;
    }

    if (!isVerified) {
      toast.error('You must be KYC verified to invest');
      return;
    }

    if (!depositAmount) {
      toast.error('Please enter an amount');
      return;
    }

    try {
      setPendingAction('deposit');
      const amountInWei = parseUnits(depositAmount, usdcDecimals || 6); // Use fetched decimals

      await writeContract({
        address: contracts.InvoiceVault.address,
        abi: contracts.InvoiceVault.abi,
        functionName: 'deposit',
        args: [amountInWei, address],
      });

      toast.success('Transaction sent!');
    } catch (error: any) {
      const errorMsg =
        error?.shortMessage || error?.message || 'Transaction failed';
      toast.error(errorMsg);
      setPendingAction(null);
    }
  };

  const handleApprove = async () => {
    if (!address || !usdcBalance || !depositAmount) return;

    try {
      setPendingAction('approve');
      const amountInWei = parseUnits(depositAmount, usdcDecimals || 6);

      await writeContract({
        address: usdcBalance as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const,
        functionName: 'approve',
        args: [contracts.InvoiceVault.address, amountInWei],
      });

      toast.success('Approval sent!');
    } catch (error: any) {
      const errorMsg =
        error?.shortMessage || error?.message || 'Transaction failed';
      toast.error(errorMsg);
      setPendingAction(null);
    }
  };

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN.id;

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] mb-6">
            <TrendingUp className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-blue-100/60 mb-6">
            Connect your wallet to access the Investor Dashboard
          </p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center border-red-500/30 bg-red-500/10">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-red-400 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Wrong Network</h2>
          <p className="text-red-200/70 mb-6">
            Please switch to <strong>{SUPPORTED_CHAIN.name}</strong>
          </p>
          <button
            onClick={() => switchChain({ chainId: SUPPORTED_CHAIN.id })}
            className="glass-button w-full py-3 bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-100"
          >
            Switch to {SUPPORTED_CHAIN.name}
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const usdcBal = userUsdcBalance && usdcDecimals
    ? parseFloat(formatUnits(userUsdcBalance as bigint, usdcDecimals))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="text-purple-400" />
            Investor Dashboard
          </h1>
          <p className="text-blue-100/60">
            Provide liquidity and earn returns on invoice financing
          </p>
        </div>

        {/* Verification Banner */}
        <VerificationBanner
          isVerified={!!isVerified}
          userAddress={address}
        />

        {/* Vault Stats */}
        {isVerified && (
          <VaultStatsCard
            totalAssets={totalAssets || BigInt(0)}
            userBalance={userVaultBalance || BigInt(0)}
            assetDecimals={usdcDecimals}
            vaultDecimals={vaultDecimals}
          />
        )}

        {/* Risk Profile Selector */}
        {isVerified && (
          <RiskProfileSection />
        )}

        {/* Tabs */}
        {isVerified && (
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10">
            {(['invest', 'portfolio'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg'
                  : 'text-blue-200/60 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {tab === 'invest' ? <><Wallet size={16} /> Invest</> : <><PieChart size={16} /> Portfolio</>}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {isVerified && activeTab === 'invest' && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Deposit Section */}
              <button
                onClick={() => setShowDepositForm(!showDepositForm)}
                disabled={isPending || isConfirming}
                className={`w-full p-4 mb-6 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all duration-300 ${showDepositForm
                  ? 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  : 'glass-button-primary hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                  }`}
              >
                {showDepositForm ? <><X size={20} /> Cancel</> : <><Plus size={20} /> Deposit USDC</>}
              </button>

              {/* Deposit Form */}
              <AnimatePresence>
                {showDepositForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="glass-panel overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-400 rounded-full" />
                        Deposit USDC
                      </h3>

                      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl flex justify-between items-center">
                        <span className="text-blue-200/80 text-sm">Your USDC Balance:</span>
                        <span className="text-white font-mono font-bold text-lg">
                          ${usdcBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <form onSubmit={handleDeposit} className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">
                            Amount (USDC)
                          </label>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="100"
                            step="0.01"
                            min="0"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={handleApprove}
                            disabled={isPending || isConfirming || !depositAmount}
                            className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isPending || isConfirming || !depositAmount
                              ? 'bg-white/5 text-white/40 cursor-not-allowed'
                              : 'glass-button hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-200'
                              }`}
                          >
                            {pendingAction === 'approve' ? (
                              <><Loader2 className="animate-spin" size={20} /> Approving...</>
                            ) : (
                              <><CheckCircle2 size={20} /> 1. Approve</>
                            )}
                          </button>

                          <button
                            type="submit"
                            disabled={isPending || isConfirming || !depositAmount}
                            className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isPending || isConfirming || !depositAmount
                              ? 'bg-white/5 text-white/40 cursor-not-allowed'
                              : 'glass-button-primary'
                              }`}
                          >
                            {pendingAction === 'deposit' ? (
                              <><Loader2 className="animate-spin" size={20} /> Depositing...</>
                            ) : (
                              <><ArrowRight size={20} /> 2. Deposit</>
                            )}
                          </button>
                        </div>

                        <div className="text-xs text-blue-200/50 flex gap-2 items-start">
                          <Info size={14} className="mt-0.5 shrink-0" />
                          You'll receive ivUSDC vault tokens representing your share of the pool. These tokens earn yield as invoices are funded and repaid.
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info Card */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="text-cyan-400" size={20} />
                  How It Works
                </h3>

                <div className="space-y-4">
                  {[
                    { title: 'Deposit USDC', desc: 'into the ERC-4626 compliant vault' },
                    { title: 'Receive ivUSDC tokens', desc: 'representing your share' },
                    { title: 'Vault funds invoices', desc: 'selected by the admin' },
                    { title: 'Earn returns', desc: 'as invoices are repaid' },
                    { title: 'Withdraw anytime', desc: 'based on available liquidity' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <strong className="text-white block">{step.title}</strong>
                        <span className="text-blue-200/60 text-sm">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 items-start">
                  <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
                  <div className="text-sm text-yellow-100/80">
                    <strong>Note:</strong> This is a regulated real-world asset platform. Only KYC-verified addresses can participate.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Portfolio Tab */}
          {isVerified && activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="glass-panel p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <PieChart className="text-purple-300 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Your Investment Portfolio
                </h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                  {userVaultBalance && vaultDecimals ? parseFloat(formatUnits(userVaultBalance as bigint, vaultDecimals)).toFixed(2) : '0.00'} <span className="text-lg text-white/50">ivUSDC</span>
                </div>
                <p className="text-blue-200/60 max-w-md mx-auto">
                  Your vault tokens represent a share of all funded invoices and available liquidity in the pool.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
    </motion.div>
  );
}

export const Route = createFileRoute('/investor')({
  component: InvestorDashboard,
});
