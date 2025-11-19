import { sdk } from '@farcaster/miniapp-sdk';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi';
import { SUPPORTED_CHAIN } from '../libs/supportedChains';
import WalletModal from './WalletModal';

interface GlobalHeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

function GlobalHeader({
  showBackButton = false,
  backTo = "/",
  backText = "Back"
}: GlobalHeaderProps) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    const detectEnvironment = async () => {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        setIsMiniApp(isInMiniApp);
      } catch (error) {
        console.error('Error detecting Mini App environment:', error);
        setIsMiniApp(false);
      }
    };
    detectEnvironment();
  }, []);

  const handleConnectWallet = () => {
    const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
    if (isMiniApp && farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else {
      setIsWalletModalOpen(true);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 sm:px-6"
      style={{
        background: "rgba(var(--glass-bg-start), 0.5)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      {/* Left side - Brand & Back */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {showBackButton && (
          <Link
            to={backTo}
            className="glass-button px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            <span>←</span>
            <span className="hidden sm:inline">{backText}</span>
          </Link>
        )}

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold tracking-tighter flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #ccc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 20px rgba(255,255,255,0.3)"
            }}
          >
            Invo<span className="font-light italic text-white/80">Rayls</span>
          </Link>
        </motion.div>
      </div>

      {/* Right side - Connect */}
      <motion.div
        className="flex items-center gap-2 flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isConnected && address ? (
          <div className="glass-panel px-3 py-1.5 flex items-center gap-3 !rounded-full !border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              <span className="text-xs sm:text-sm font-medium text-white/90 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>

            {chainId !== SUPPORTED_CHAIN.id && (
              <button
                onClick={() => switchChain({ chainId: SUPPORTED_CHAIN.id })}
                disabled={isSwitchingChain}
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
              >
                {isSwitchingChain ? '...' : 'Switch'}
              </button>
            )}

            <button
              onClick={() => disconnect()}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Disconnect"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={connectors.length === 0}
            className="glass-button-primary px-5 py-2 text-sm font-bold tracking-wide uppercase"
          >
            Connect
          </button>
        )}
      </motion.div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </header>
  );
}

export default GlobalHeader; 