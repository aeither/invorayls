import { motion } from 'framer-motion';

interface VerificationBannerProps {
  isVerified: boolean;
  userAddress?: string;
}

export default function VerificationBanner({
  isVerified,
  userAddress,
}: VerificationBannerProps) {
  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'hsl(var(--celo-green))',
          color: 'white',
          padding: '1rem',
          border: '3px solid hsl(var(--celo-black))',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div style={{ fontSize: '1.5rem' }}>✓</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            KYC Verified
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Your identity has been verified. You can now tokenize invoices and
            invest.
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'hsl(var(--celo-yellow))',
        color: 'hsl(var(--celo-black))',
        padding: '1rem',
        border: '3px solid hsl(var(--celo-black))',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '1.5rem' }}>⚠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            KYC Verification Required
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Your address needs to be verified by an administrator before you can
            interact with the platform.
          </div>
          {userAddress && (
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                background: 'white',
                padding: '0.5rem',
                border: '2px solid hsl(var(--celo-black))',
                wordBreak: 'break-all',
              }}
            >
              {userAddress}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
