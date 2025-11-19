import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract, useChainId, useSwitchChain } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import BottomNavigation from '../components/BottomNavigation'
import { bunnyGameABI } from '../libs/bunnyGameABI'
import { eggTokenABI } from '../libs/eggTokenABI'
import { megaEggABI } from '../libs/megaEggABI'
import { dailyRewardsABI } from '../libs/dailyRewardsABI'
import { SUPPORTED_CHAIN } from '../libs/supportedChains'
import { BUNNY_GAME_ADDRESS, EGG_TOKEN_ADDRESS, MEGA_EGG_ADDRESS, DAILY_REWARDS_ADDRESS } from '../libs/constants'

type TabType = 'care' | 'daily';

function BunnyPage() {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/' }) as { referrer?: string }

  const [activeTab, setActiveTab] = useState<TabType>('care')
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [referrerAddress, setReferrerAddress] = useState('')

  // Handle referrer from URL
  useEffect(() => {
    if (searchParams.referrer && address) {
      setReferrerAddress(searchParams.referrer)
      setShowReferralModal(true)
    }
  }, [searchParams.referrer, address])

  // Contract reads - Bunny Game
  const { data: bunnyData, refetch: refetchBunny } = useReadContract({
    address: BUNNY_GAME_ADDRESS,
    abi: bunnyGameABI,
    functionName: 'getBunny',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const happiness = bunnyData ? Number(bunnyData[0]) : 0
  const claimableActions = bunnyData ? Number(bunnyData[1]) : 0
  const totalEggsLaid = bunnyData ? Number(bunnyData[3]) : 0
  const instantActionsRemaining = bunnyData ? Number(bunnyData[4]) : 0

  const { data: canLayEgg } = useReadContract({
    address: BUNNY_GAME_ADDRESS,
    abi: bunnyGameABI,
    functionName: 'canLayEgg',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: isActionAvailable } = useReadContract({
    address: BUNNY_GAME_ADDRESS,
    abi: bunnyGameABI,
    functionName: 'isActionAvailable',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Balances
  const { data: eggBalance, refetch: refetchEggBalance } = useReadContract({
    address: EGG_TOKEN_ADDRESS,
    abi: eggTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: megaEggBalance } = useReadContract({
    address: MEGA_EGG_ADDRESS,
    abi: megaEggABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Daily Rewards
  const { data: retentionData, refetch: refetchRetention } = useReadContract({
    address: DAILY_REWARDS_ADDRESS,
    abi: dailyRewardsABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: timeUntilCheckIn } = useReadContract({
    address: DAILY_REWARDS_ADDRESS,
    abi: dailyRewardsABI,
    functionName: 'timeUntilNextCheckIn',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const streak = retentionData ? Number(retentionData[1]) : 0
  const referralCount = retentionData ? Number(retentionData[3]) : 0
  const canCheckIn = retentionData ? Boolean(retentionData[4]) : false
  const timeRemaining = timeUntilCheckIn ? Number(timeUntilCheckIn) : 0

  // Format balances
  const eggBal = eggBalance ? parseFloat(formatEther(eggBalance as bigint)) : 0
  const megaEggBal = megaEggBalance ? parseFloat(formatEther(megaEggBalance as bigint)) : 0

  // Contract writes - use single hook like contract.tsx
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const isAnyPending = isPending || isConfirming

  // Format countdown timer
  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${secs}s`
  }

  // Success handler - check which action was pending
  useEffect(() => {
    if (isConfirmed && hash && chain && pendingAction) {
      switch (pendingAction) {
        case 'feed':
          toast.success('🍗 Fed! +10 happiness')
          refetchBunny()
          break
        case 'pet':
          toast.success('❤️ Petted! +10 happiness')
          refetchBunny()
          break
        case 'play':
          toast.success('🎾 Played! +10 happiness')
          refetchBunny()
          break
        case 'layEgg':
          toast.success('🥚 Egg laid! +1 EGG')
          refetchBunny()
          refetchEggBalance()
          break
        case 'checkIn':
          toast.success('✅ Checked in! Eggs earned!')
          refetchRetention()
          refetchEggBalance()
          break
        case 'checkInWithRef':
          toast.success('🎉 Checked in with referral! Bonus eggs!')
          refetchRetention()
          refetchEggBalance()
          setShowReferralModal(false)
          break
      }
      setPendingAction(null)
    }
  }, [isConfirmed, hash, chain, pendingAction])

  // Action handlers with proper error handling
  const handleAction = async (action: 'feed' | 'pet' | 'play') => {
    if (!address || chainId !== SUPPORTED_CHAIN.id) {
      toast.error('Please connect to correct network')
      return
    }

    const names = { feed: 'feedBunny', pet: 'petBunny', play: 'playWithBunny' }

    try {
      setPendingAction(action)
      await writeContract({
        address: BUNNY_GAME_ADDRESS,
        abi: bunnyGameABI,
        functionName: names[action] as any,
      })
      toast.success('Transaction sent!')
    } catch (error: any) {
      const errorMsg = error?.shortMessage || error?.message || 'Transaction failed'
      toast.error(errorMsg)
      setPendingAction(null)
    }
  }

  const handleLayEgg = async () => {
    if (!address || chainId !== SUPPORTED_CHAIN.id) return

    try {
      setPendingAction('layEgg')
      await writeContract({
        address: BUNNY_GAME_ADDRESS,
        abi: bunnyGameABI,
        functionName: 'layEgg',
      })
      toast.success('Transaction sent!')
    } catch (error: any) {
      const errorMsg = error?.shortMessage || error?.message || 'Transaction failed'
      toast.error(errorMsg)
      setPendingAction(null)
    }
  }

  const handleCheckIn = async () => {
    if (!address || chainId !== SUPPORTED_CHAIN.id) return

    try {
      setPendingAction('checkIn')
      await writeContract({
        address: DAILY_REWARDS_ADDRESS,
        abi: dailyRewardsABI,
        functionName: 'checkIn',
      })
      toast.success('Transaction sent!')
    } catch (error: any) {
      const errorMsg = error?.shortMessage || error?.message || 'Transaction failed'
      toast.error(errorMsg)
      setPendingAction(null)
    }
  }

  const handleRefCheckIn = async () => {
    if (!address || chainId !== SUPPORTED_CHAIN.id || !referrerAddress) return

    try {
      setPendingAction('checkInWithRef')
      await writeContract({
        address: DAILY_REWARDS_ADDRESS,
        abi: dailyRewardsABI,
        functionName: 'checkInWithReferral',
        args: [referrerAddress as `0x${string}`],
      })
      toast.success('Transaction sent!')
    } catch (error: any) {
      const errorMsg = error?.shortMessage || error?.message || 'Transaction failed'
      toast.error(errorMsg)
      setPendingAction(null)
    }
  }

  const shareReferralLink = () => {
    const link = `${window.location.origin}/?referrer=${address}`
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied!')
  }

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN.id

  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh', paddingBottom: '70px', background: 'hsl(var(--background))' }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", paddingTop: "clamp(4rem, 15vw, 6rem)", textAlign: "center" }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐰</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet</h2>
          <p style={{ color: "#6b7280" }}>Connect your wallet to play Bunny Game</p>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div style={{ minHeight: '100vh', paddingBottom: '70px', background: 'hsl(var(--background))' }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", paddingTop: "100px", textAlign: "center" }}>
          <div style={{ background: "#fef2f2", border: "3px solid #ef4444", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ color: "#991b1b", marginBottom: "1rem" }}>Wrong Network</h2>
            <p style={{ color: "#7f1d1d", marginBottom: "1.5rem" }}>
              Please switch to <strong>{SUPPORTED_CHAIN.name}</strong>
            </p>
            <button
              onClick={() => switchChain({ chainId: SUPPORTED_CHAIN.id })}
              style={{
                backgroundColor: "#58CC02",
                color: "#ffffff",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Switch to {SUPPORTED_CHAIN.name}
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0.75rem", paddingTop: "80px" }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>🐰 Bunny</h1>
        </div>

        {/* Balances */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.75rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))', textTransform: 'uppercase' }}>EGG</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{eggBal.toFixed(0)} 🥚</div>
          </div>
          <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.75rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))', textTransform: 'uppercase' }}>MEGA</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{megaEggBal.toFixed(0)} ✨</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {(['care', 'daily'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: activeTab === tab ? 'hsl(var(--celo-yellow))' : 'hsl(var(--celo-white))',
                border: '2px solid hsl(var(--celo-black))',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              {tab === 'care' ? '🐰' : '📅'} {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: 'hsl(var(--celo-white))', padding: '1rem', border: '3px solid hsl(var(--celo-black))' }}>

          {/* Care Tab */}
          {activeTab === 'care' && (
            <div>
              <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>🐰</div>

              {/* Happiness Bar */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Happiness</span>
                  <span>{happiness}/100</span>
                </div>
                <div style={{ height: '20px', background: 'hsl(var(--celo-tan-2))', border: '2px solid hsl(var(--celo-black))' }}>
                  <div style={{ width: `${happiness}%`, height: '100%', background: happiness >= 100 ? 'hsl(var(--celo-green))' : 'hsl(var(--celo-yellow))', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.5rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--celo-brown))', marginBottom: '0.25rem' }}>LAID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{totalEggsLaid}</div>
                </div>
                <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.5rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--celo-brown))', marginBottom: '0.25rem' }}>⚡</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{instantActionsRemaining}</div>
                </div>
                <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.5rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--celo-brown))', marginBottom: '0.25rem' }}>⏰</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{claimableActions}</div>
                </div>
              </div>

              {/* Lay Egg */}
              {canLayEgg && (
                <button
                  onClick={handleLayEgg}
                  disabled={isAnyPending}
                  style={{
                    width: '100%',
                    background: 'hsl(var(--celo-green))',
                    color: 'white',
                    border: '3px solid hsl(var(--celo-black))',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    cursor: isAnyPending ? 'not-allowed' : 'pointer',
                    opacity: isAnyPending ? 0.6 : 1
                  }}
                >
                  {pendingAction === 'layEgg' ? (isConfirming ? '⏳ Confirming...' : '⏳ Laying...') : '🥚 Lay Egg'}
                </button>
              )}

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { emoji: '🍗', label: 'Feed', action: 'feed' as const },
                  { emoji: '❤️', label: 'Pet', action: 'pet' as const },
                  { emoji: '🎾', label: 'Play', action: 'play' as const }
                ].map(({ emoji, label, action }) => {
                  const isActionPending = pendingAction === action
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action)}
                      disabled={!isActionAvailable || isAnyPending}
                      style={{
                        background: isActionAvailable && !isAnyPending ? 'hsl(var(--celo-white))' : 'hsl(var(--celo-tan-2))',
                        border: '2px solid hsl(var(--celo-black))',
                        padding: '0.75rem 0.5rem',
                        cursor: isActionAvailable && !isAnyPending ? 'pointer' : 'not-allowed',
                        opacity: isActionAvailable && !isAnyPending ? 1 : 0.6
                      }}
                    >
                      <div style={{ fontSize: '1.75rem' }}>{emoji}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                        {isActionPending ? (isConfirming ? '⏳...' : '⏳') : label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Daily Tab */}
          {activeTab === 'daily' && (
            <div>
              <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '0.75rem' }}>📅 Daily Check-in</h3>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.75rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))' }}>Streak</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🔥 {streak}</div>
                </div>
                <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '0.75rem', border: '2px solid hsl(var(--celo-black))', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))' }}>Referrals</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👥 {referralCount}</div>
                </div>
              </div>

              {/* Check-in Button */}
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn || isAnyPending}
                style={{
                  width: '100%',
                  background: canCheckIn && !isAnyPending ? 'hsl(var(--celo-green))' : 'hsl(var(--celo-tan-2))',
                  color: canCheckIn && !isAnyPending ? 'white' : 'hsl(var(--celo-brown))',
                  border: '3px solid hsl(var(--celo-black))',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                  cursor: canCheckIn && !isAnyPending ? 'pointer' : 'not-allowed'
                }}
              >
                {pendingAction === 'checkIn' ? (isConfirming ? '⏳ Confirming...' : '⏳ Checking in...') : canCheckIn ? '✅ Check In Now' : `⏰ Next check-in: ${formatCountdown(timeRemaining)}`}
              </button>

              {/* Share Referral */}
              <button
                onClick={shareReferralLink}
                style={{
                  width: '100%',
                  background: 'hsl(var(--celo-yellow))',
                  border: '3px solid hsl(var(--celo-black))',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📤 Share Referral Link
              </button>

              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'hsl(var(--celo-tan-2))', border: '2px solid hsl(var(--celo-black))', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Rewards:</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                  <li>1 EGG/day (1-2 days)</li>
                  <li>2 EGG/day (3-6 days)</li>
                  <li>3 EGG/day (7+ days)</li>
                  <li>5 EGG bonus for referrals!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            border: '3px solid black',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🎉 Referral Bonus!</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              You've been referred by <strong>{referrerAddress.slice(0, 6)}...{referrerAddress.slice(-4)}</strong>!
            </p>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              Check in now to earn <strong>5 bonus EGG tokens</strong> for both you and your referrer!
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowReferralModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'white',
                  border: '2px solid black',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRefCheckIn}
                disabled={isAnyPending}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'hsl(var(--celo-green))',
                  color: 'white',
                  border: '2px solid hsl(var(--celo-black))',
                  fontWeight: 'bold',
                  cursor: isAnyPending ? 'not-allowed' : 'pointer'
                }}
              >
                {pendingAction === 'checkInWithRef' ? (isConfirming ? '⏳ Confirming...' : '⏳ Sending...') : '✅ Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </motion.div>
  )
}

export const Route = createFileRoute('/')({
  component: BunnyPage,
  validateSearch: (search: Record<string, unknown>): { referrer?: string } => {
    return {
      referrer: typeof search.referrer === 'string' ? search.referrer : undefined,
    }
  },
})
