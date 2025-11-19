import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FileText, TrendingUp, Shield, Database, Layers, Link as LinkIcon, CheckCircle2, ArrowRight, Coins, Loader2 } from 'lucide-react';
import { contracts } from '../libs/contracts';
import { parseUnits } from 'viem';


function MintButton() {
  const { address } = useAccount();
  const { writeContract, isPending: isMinting, data: mintHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: mintHash
  });

  const handleMint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;

    writeContract({
      address: contracts.MockUSDC.address,
      abi: contracts.MockUSDC.abi,
      functionName: 'mint',
      args: [address, parseUnits('1000', 18)], // Assuming 18 decimals for mock
    });
  };

  return (
    <button
      onClick={handleMint}
      disabled={isMinting || isConfirming || isSuccess}
      className={`
        glass-button px-8 py-4 min-w-[200px] flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wider
        ${isSuccess ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200' : 'hover:bg-emerald-500/20 hover:border-emerald-400/40'}
      `}
    >
      {isMinting || isConfirming ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {isMinting ? 'Minting...' : 'Confirming...'}
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Minted!
        </>
      ) : (
        <>
          Mint 1,000 USDC
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

function LandingPage() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'business' | 'investor') => {
    navigate({ to: `/${role}` });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
    >
      <div className="max-w-5xl mx-auto px-4 pt-12 sm:pt-20">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-block"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <FileText className="text-white w-10 h-10" />
            </div>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              InvoRayls
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/70 max-w-2xl mx-auto leading-relaxed font-light">
            A regulated real-world asset tokenization platform for invoice
            financing, powered by blockchain technology and ERC-3643 compliance.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel p-6 mb-12 text-center max-w-lg mx-auto border-yellow-400/20 bg-yellow-500/5"
          >
            <div className="font-bold text-yellow-200 mb-2 flex items-center justify-center gap-2">
              <LinkIcon className="w-4 h-4" /> Connect Your Wallet
            </div>
            <div className="text-sm text-yellow-100/70">
              Connect your wallet using the button in the top right to get started.
            </div>
          </motion.div>
        )}

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Business Card */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('business')}
            className="glass-panel p-8 cursor-pointer group hover:border-cyan-400/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-cyan-500/20 transition-colors">
                <FileText className="w-12 h-12 text-cyan-300" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-center mb-3 text-white group-hover:text-cyan-200 transition-colors">
              Business User
            </h3>

            <p className="text-blue-100/60 text-center mb-8 text-sm">
              Tokenize your invoices and access early payment
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Upload and tokenize invoices',
                'Receive early payments',
                'Track invoice status',
                'KYC-verified transactions',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-blue-50/80">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="glass-button w-full py-3 text-center text-sm font-bold uppercase tracking-wider group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 transition-all flex items-center justify-center gap-2">
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Investor Card */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('investor')}
            className="glass-panel p-8 cursor-pointer group hover:border-purple-400/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="w-12 h-12 text-purple-300" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-center mb-3 text-white group-hover:text-purple-200 transition-colors">
              Investor
            </h3>

            <p className="text-blue-100/60 text-center mb-8 text-sm">
              Provide liquidity and earn returns on invoice financing
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Deposit USDC to earn yield',
                'ERC-4626 compliant vault',
                'Transparent on-chain tracking',
                'Regulated RWA investment',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-blue-50/80">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="glass-button w-full py-3 text-center text-sm font-bold uppercase tracking-wider group-hover:bg-purple-500/20 group-hover:border-purple-400/40 transition-all flex items-center justify-center gap-2">
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </div>

          </motion.div>
        </div>

        {/* Testnet Faucet Section */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="glass-panel p-8 relative overflow-hidden border-emerald-400/20 bg-emerald-500/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Coins className="w-8 h-8 text-emerald-400" />
                    Need Testnet Funds?
                  </h3>
                  <p className="text-blue-100/70 max-w-xl">
                    Mint free mock USDC to test the investor features of the platform.
                    You'll receive 1,000 USDC to deposit into the vault.
                  </p>
                </div>

                <MintButton />
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Platform Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'KYC Compliant',
                description: 'ERC-3643 style identity verification',
                color: 'text-emerald-400'
              },
              {
                icon: Database,
                title: 'ERC-4626 Vault',
                description: 'Standard compliant liquidity pool',
                color: 'text-blue-400'
              },
              {
                icon: Layers,
                title: 'Real Assets',
                description: 'Invoices as ERC-721 NFTs',
                color: 'text-amber-400'
              },
              {
                icon: LinkIcon,
                title: 'On-Chain',
                description: 'Transparent and immutable',
                color: 'text-purple-400'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-panel p-6 text-center hover:bg-white/5 transition-colors"
              >
                <div className={`mb-4 inline-flex p-3 rounded-xl bg-white/5 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="font-bold mb-2 text-white">
                  {feature.title}
                </div>
                <div className="text-sm text-blue-100/60 leading-relaxed">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 relative z-10">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                step: 1,
                title: 'KYC Verification',
                description: 'Both businesses and investors complete identity verification',
              },
              {
                step: 2,
                title: 'Tokenize Invoices',
                description: 'Businesses mint invoice NFTs with amount and due date',
              },
              {
                step: 3,
                title: 'Provide Liquidity',
                description: 'Investors deposit USDC into the vault to fund invoices',
              },
              {
                step: 4,
                title: 'Earn Returns',
                description: 'As invoices are paid, investors earn yield on their capital',
              },
            ].map((item) => (
              <div key={item.step} className="relative pl-4 border-l border-white/10">
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  {item.step}
                </div>
                <div className="font-bold mb-2 text-lg text-white/90">
                  {item.title}
                </div>
                <div className="text-sm text-blue-100/60 leading-relaxed">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const Route = createFileRoute('/')({
  component: LandingPage,
});
