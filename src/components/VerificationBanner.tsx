import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationBannerProps {
  isVerified: boolean;
  userAddress?: string;
}

export default function VerificationBanner({
  isVerified,
  userAddress,
}: VerificationBannerProps) {
  const copyAddress = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
      toast.success('Address copied to clipboard');
    }
  };

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 mb-6 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-4"
      >
        <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
          <ShieldCheck size={24} />
        </div>
        <div>
          <div className="font-bold text-emerald-400 mb-0.5">
            KYC Verified
          </div>
          <div className="text-sm text-emerald-200/70">
            Your identity has been verified. You can now tokenize invoices and invest.
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 mb-6 border-amber-500/30 bg-amber-500/10 flex items-start gap-4"
    >
      <div className="p-2 rounded-full bg-amber-500/20 text-amber-400 mt-1">
        <AlertTriangle size={24} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-amber-400 mb-0.5">
          KYC Verification Required
        </div>
        <div className="text-sm text-amber-200/70 mb-3">
          Your address needs to be verified by an administrator before you can interact with the platform.
        </div>

        {userAddress && (
          <div
            onClick={copyAddress}
            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/20 border border-amber-500/20 cursor-pointer hover:bg-black/30 transition-colors group"
          >
            <code className="text-xs font-mono text-amber-200/80 break-all">
              {userAddress}
            </code>
            <Copy size={14} className="text-amber-400/50 group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
