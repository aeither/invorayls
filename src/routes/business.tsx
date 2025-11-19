import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
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
import { parseUnits } from 'viem';
import BottomNavigation from '../components/BottomNavigation';
import VerificationBanner from '../components/VerificationBanner';
import InvoiceCard from '../components/InvoiceCard';
import { contracts } from '../libs/contracts';
import { SUPPORTED_CHAIN } from '../libs/supportedChains';

function BusinessDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Form state
  const [payerAddress, setPayerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Check if user is verified
  const { data: isVerified, refetch: refetchVerified } = useReadContract({
    address: contracts.IdentityRegistry.address,
    abi: contracts.IdentityRegistry.abi,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get user's invoice count
  const { data: invoiceCount, refetch: refetchCount } = useReadContract({
    address: contracts.InvoiceToken.address,
    abi: contracts.InvoiceToken.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!isVerified },
  });

  // Fetch user's invoices
  const [invoiceIds, setInvoiceIds] = useState<number[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Contract writes
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Fetch invoice IDs when count changes
  useEffect(() => {
    if (invoiceCount && Number(invoiceCount) > 0) {
      // In a real app, you'd query tokenOfOwnerByIndex for each index
      // For now, we'll just create a range
      const count = Number(invoiceCount);
      const ids = Array.from({ length: count }, (_, i) => i);
      setInvoiceIds(ids);
    }
  }, [invoiceCount]);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      if (pendingAction === 'mint') {
        toast.success('✅ Invoice tokenized successfully!');
        refetchCount();
        setShowForm(false);
        resetForm();
      } else if (pendingAction?.startsWith('markPaid-')) {
        toast.success('✅ Invoice marked as paid!');
        refetchCount();
      }
      setPendingAction(null);
    }
  }, [isConfirmed, hash, pendingAction]);

  const resetForm = () => {
    setPayerAddress('');
    setAmount('');
    setDueDate('');
    setDescription('');
  };

  const handleMintInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || chainId !== SUPPORTED_CHAIN.id) {
      toast.error('Please connect to correct network');
      return;
    }

    if (!isVerified) {
      toast.error('You must be KYC verified to mint invoices');
      return;
    }

    if (!payerAddress || !amount || !dueDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setPendingAction('mint');
      const amountInWei = parseUnits(amount, 18);
      const dueDateTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);

      // Create metadata URI (in a real app, this would be uploaded to IPFS)
      const metadata = {
        description: description || 'Invoice',
        amount,
        dueDate,
      };
      const metadataUri = `data:application/json,${encodeURIComponent(
        JSON.stringify(metadata)
      )}`;

      await writeContract({
        address: contracts.InvoiceToken.address,
        abi: contracts.InvoiceToken.abi,
        functionName: 'mintInvoice',
        args: [payerAddress as `0x${string}`, amountInWei, BigInt(dueDateTimestamp), metadataUri],
      });

      toast.success('Transaction sent!');
    } catch (error: any) {
      const errorMsg =
        error?.shortMessage || error?.message || 'Transaction failed';
      toast.error(errorMsg);
      setPendingAction(null);
    }
  };

  const handleMarkPaid = async (tokenId: number) => {
    if (!address || chainId !== SUPPORTED_CHAIN.id) return;

    try {
      setPendingAction(`markPaid-${tokenId}`);
      await writeContract({
        address: contracts.InvoiceToken.address,
        abi: contracts.InvoiceToken.abi,
        functionName: 'markPaid',
        args: [BigInt(tokenId)],
      });
      toast.success('Transaction sent!');
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
      <div
        style={{
          minHeight: '100vh',
          paddingBottom: '70px',
          background: 'hsl(var(--background))',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            paddingTop: 'clamp(4rem, 15vw, 6rem)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Connect Wallet
          </h2>
          <p style={{ color: '#6b7280' }}>
            Connect your wallet to access the Business Dashboard
          </p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div
        style={{
          minHeight: '100vh',
          paddingBottom: '70px',
          background: 'hsl(var(--background))',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            paddingTop: '100px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#fef2f2',
              border: '3px solid #ef4444',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#991b1b', marginBottom: '1rem' }}>
              Wrong Network
            </h2>
            <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
              Please switch to <strong>{SUPPORTED_CHAIN.name}</strong>
            </p>
            <button
              onClick={() => switchChain({ chainId: SUPPORTED_CHAIN.id })}
              style={{
                backgroundColor: '#58CC02',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Switch to {SUPPORTED_CHAIN.name}
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: 'hsl(var(--background))', minHeight: '100vh' }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '1rem',
          paddingBottom: '100px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              margin: 0,
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            📄 Business Dashboard
          </h1>
          <p style={{ color: 'hsl(var(--celo-brown))', margin: 0 }}>
            Tokenize and manage your invoices
          </p>
        </div>

        {/* Verification Banner */}
        <VerificationBanner
          isVerified={!!isVerified}
          userAddress={address}
        />

        {/* Action Button */}
        {isVerified && (
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={isPending || isConfirming}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'hsl(var(--celo-purple))',
              color: 'white',
              border: '3px solid hsl(var(--celo-black))',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            {showForm ? '✕ Cancel' : '+ Create New Invoice'}
          </button>
        )}

        {/* Invoice Creation Form */}
        {showForm && isVerified && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              background: 'hsl(var(--celo-white))',
              border: '3px solid hsl(var(--celo-black))',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '1rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Tokenize New Invoice
            </h3>

            <form onSubmit={handleMintInvoice}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Payer Address *
                </label>
                <input
                  type="text"
                  value={payerAddress}
                  onChange={(e) => setPayerAddress(e.target.value)}
                  placeholder="0x..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid hsl(var(--celo-black))',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Amount (USDC) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid hsl(var(--celo-black))',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid hsl(var(--celo-black))',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Invoice description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid hsl(var(--celo-black))',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isPending || isConfirming}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background:
                    isPending || isConfirming
                      ? 'hsl(var(--celo-tan-2))'
                      : 'hsl(var(--celo-green))',
                  color:
                    isPending || isConfirming
                      ? 'hsl(var(--celo-brown))'
                      : 'white',
                  border: '3px solid hsl(var(--celo-black))',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor:
                    isPending || isConfirming ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {isPending || isConfirming
                  ? '⏳ Creating...'
                  : '✓ Create Invoice Token'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Invoices List */}
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              marginBottom: '1rem',
              fontWeight: 'bold',
            }}
          >
            Your Invoices {invoiceCount && `(${invoiceCount.toString()})`}
          </h2>

          {invoiceCount && Number(invoiceCount) > 0 ? (
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {invoiceIds.map((id) => (
                <InvoiceCardLoader
                  key={id}
                  tokenId={id}
                  onMarkPaid={handleMarkPaid}
                  isMarking={pendingAction === `markPaid-${id}`}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: 'hsl(var(--celo-white))',
                border: '3px solid hsl(var(--celo-black))',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '1rem', color: 'hsl(var(--celo-brown))' }}>
                No invoices yet. Create your first invoice to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </motion.div>
  );
}

// Helper component to load individual invoice data
function InvoiceCardLoader({
  tokenId,
  onMarkPaid,
  isMarking,
}: {
  tokenId: number;
  onMarkPaid: (tokenId: number) => void;
  isMarking: boolean;
}) {
  const { data: invoice } = useReadContract({
    address: contracts.InvoiceToken.address,
    abi: contracts.InvoiceToken.abi,
    functionName: 'getInvoice',
    args: [BigInt(tokenId)],
  });

  if (!invoice) {
    return (
      <div
        style={{
          background: 'hsl(var(--celo-tan-2))',
          border: '2px solid hsl(var(--celo-black))',
          padding: '1.25rem',
          textAlign: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <InvoiceCard
      tokenId={tokenId}
      invoice={invoice as any}
      onAction={invoice.paid ? undefined : onMarkPaid}
      actionLabel={isMarking ? '⏳ Marking...' : '✓ Mark as Paid'}
      actionDisabled={invoice.paid || isMarking}
    />
  );
}

export const Route = createFileRoute('/business')({
  component: BusinessDashboard,
});
