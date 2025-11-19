import { formatEther } from 'viem';
import { motion } from 'framer-motion';

interface Invoice {
  amount: bigint;
  issuer: string;
  payer: string;
  dueDate: bigint;
  paid: boolean;
  exists: boolean;
}

interface InvoiceCardProps {
  tokenId: number;
  invoice: Invoice;
  onAction?: (tokenId: number) => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  showIssuer?: boolean;
}

export default function InvoiceCard({
  tokenId,
  invoice,
  onAction,
  actionLabel,
  actionDisabled = false,
  showIssuer = false,
}: InvoiceCardProps) {
  const amount = parseFloat(formatEther(invoice.amount));
  const dueDate = new Date(Number(invoice.dueDate) * 1000);
  const isOverdue = !invoice.paid && dueDate < new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'hsl(var(--celo-white))',
        border: '3px solid hsl(var(--celo-black))',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Status Badge */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          padding: '0.25rem 0.75rem',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          border: '2px solid hsl(var(--celo-black))',
          background: invoice.paid
            ? 'hsl(var(--celo-green))'
            : isOverdue
            ? 'hsl(var(--celo-red))'
            : 'hsl(var(--celo-yellow))',
          color: invoice.paid || isOverdue ? 'white' : 'hsl(var(--celo-black))',
        }}
      >
        {invoice.paid ? '✓ Paid' : isOverdue ? '! Overdue' : '○ Pending'}
      </div>

      {/* Token ID */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'hsl(var(--celo-brown))',
          marginBottom: '0.5rem',
          fontWeight: 600,
        }}
      >
        Invoice #{tokenId}
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'hsl(var(--celo-black))',
          }}
        >
          ${amount.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'hsl(var(--celo-brown))',
          }}
        >
          USDC
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'hsl(var(--celo-brown))',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
            }}
          >
            Due Date
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {dueDate.toLocaleDateString()}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: isOverdue ? 'hsl(var(--celo-red))' : 'hsl(var(--celo-brown))',
            }}
          >
            {invoice.paid
              ? 'Completed'
              : isOverdue
              ? `${Math.abs(daysUntilDue)} days overdue`
              : `${daysUntilDue} days left`}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'hsl(var(--celo-brown))',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
            }}
          >
            Payer
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            {invoice.payer.slice(0, 6)}...{invoice.payer.slice(-4)}
          </div>
        </div>
      </div>

      {showIssuer && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'hsl(var(--celo-brown))',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
            }}
          >
            Issuer
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            {invoice.issuer.slice(0, 6)}...{invoice.issuer.slice(-4)}
          </div>
        </div>
      )}

      {/* Action Button */}
      {onAction && actionLabel && (
        <button
          onClick={() => onAction(tokenId)}
          disabled={actionDisabled}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: actionDisabled
              ? 'hsl(var(--celo-tan-2))'
              : 'hsl(var(--celo-purple))',
            color: actionDisabled ? 'hsl(var(--celo-brown))' : 'white',
            border: '2px solid hsl(var(--celo-black))',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: actionDisabled ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
