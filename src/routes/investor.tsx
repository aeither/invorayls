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
import { parseUnits, formatEther } from 'viem';
import BottomNavigation from '../components/BottomNavigation';
import VerificationBanner from '../components/VerificationBanner';
import VaultStatsCard from '../components/VaultStatsCard';
import InvoiceCard from '../components/InvoiceCard';
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
      const amountInWei = parseUnits(depositAmount, 6); // USDC has 6 decimals

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
      const amountInWei = parseUnits(depositAmount, 6);

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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💰</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Connect Wallet
          </h2>
          <p style={{ color: '#6b7280' }}>
            Connect your wallet to access the Investor Dashboard
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

  const usdcBal = userUsdcBalance
    ? parseFloat(formatEther(userUsdcBalance as bigint))
    : 0;

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
            💰 Investor Dashboard
          </h1>
          <p style={{ color: 'hsl(var(--celo-brown))', margin: 0 }}>
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
          />
        )}

        {/* Tabs */}
        {isVerified && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(['invest', 'portfolio'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background:
                    activeTab === tab
                      ? 'hsl(var(--celo-purple))'
                      : 'hsl(var(--celo-white))',
                  color:
                    activeTab === tab ? 'white' : 'hsl(var(--celo-black))',
                  border: '3px solid hsl(var(--celo-black))',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {tab === 'invest' ? '💵 Invest' : '📊 Portfolio'}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {isVerified && activeTab === 'invest' && (
          <div>
            {/* Deposit Section */}
            <button
              onClick={() => setShowDepositForm(!showDepositForm)}
              disabled={isPending || isConfirming}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'hsl(var(--celo-green))',
                color: 'white',
                border: '3px solid hsl(var(--celo-black))',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
              }}
            >
              {showDepositForm ? '✕ Cancel' : '💵 Deposit USDC'}
            </button>

            {/* Deposit Form */}
            {showDepositForm && (
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
                  Deposit USDC
                </h3>

                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'hsl(var(--celo-tan-2))',
                    border: '2px solid hsl(var(--celo-black))',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span>Your USDC Balance:</span>
                    <span style={{ fontWeight: 'bold' }}>
                      ${usdcBal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleDeposit}>
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
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid hsl(var(--celo-black))',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={
                        isPending || isConfirming || !depositAmount
                      }
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background:
                          isPending || isConfirming || !depositAmount
                            ? 'hsl(var(--celo-tan-2))'
                            : 'hsl(var(--celo-yellow))',
                        color:
                          isPending || isConfirming || !depositAmount
                            ? 'hsl(var(--celo-brown))'
                            : 'hsl(var(--celo-black))',
                        border: '3px solid hsl(var(--celo-black))',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor:
                          isPending || isConfirming || !depositAmount
                            ? 'not-allowed'
                            : 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      {pendingAction === 'approve'
                        ? '⏳ Approving...'
                        : '1. Approve'}
                    </button>

                    <button
                      type="submit"
                      disabled={isPending || isConfirming || !depositAmount}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background:
                          isPending || isConfirming || !depositAmount
                            ? 'hsl(var(--celo-tan-2))'
                            : 'hsl(var(--celo-green))',
                        color:
                          isPending || isConfirming || !depositAmount
                            ? 'hsl(var(--celo-brown))'
                            : 'white',
                        border: '3px solid hsl(var(--celo-black))',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor:
                          isPending || isConfirming || !depositAmount
                            ? 'not-allowed'
                            : 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      {pendingAction === 'deposit'
                        ? '⏳ Depositing...'
                        : '2. Deposit'}
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      fontSize: '0.75rem',
                      color: 'hsl(var(--celo-brown))',
                      lineHeight: 1.5,
                    }}
                  >
                    ℹ️ You'll receive ivUSDC vault tokens representing your share
                    of the pool. These tokens earn yield as invoices are funded
                    and repaid.
                  </div>
                </form>
              </motion.div>
            )}

            {/* Info Card */}
            <div
              style={{
                background: 'hsl(var(--celo-white))',
                border: '3px solid hsl(var(--celo-black))',
                padding: '1.5rem',
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
                How It Works
              </h3>

              <ol
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  lineHeight: 1.8,
                }}
              >
                <li>
                  <strong>Deposit USDC</strong> into the ERC-4626 compliant
                  vault
                </li>
                <li>
                  <strong>Receive ivUSDC tokens</strong> representing your share
                </li>
                <li>
                  <strong>Vault funds invoices</strong> selected by the admin
                </li>
                <li>
                  <strong>Earn returns</strong> as invoices are repaid
                </li>
                <li>
                  <strong>Withdraw anytime</strong> based on available liquidity
                </li>
              </ol>

              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'hsl(var(--celo-tan-2))',
                  border: '2px solid hsl(var(--celo-black))',
                  fontSize: '0.8rem',
                  color: 'hsl(var(--celo-brown))',
                }}
              >
                <strong>Note:</strong> This is a regulated real-world asset
                platform. Only KYC-verified addresses can participate.
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {isVerified && activeTab === 'portfolio' && (
          <div>
            <div
              style={{
                background: 'hsl(var(--celo-white))',
                border: '3px solid hsl(var(--celo-black))',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>
                Your Investment Portfolio
              </h3>
              <p
                style={{
                  color: 'hsl(var(--celo-brown))',
                  marginBottom: '1rem',
                }}
              >
                Vault Balance: {userVaultBalance ? formatEther(userVaultBalance as bigint) : '0'} ivUSDC
              </p>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--celo-brown))' }}>
                Your vault tokens represent a share of all funded invoices and
                available liquidity in the pool.
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </motion.div>
  );
}

export const Route = createFileRoute('/investor')({
  component: InvestorDashboard,
});
