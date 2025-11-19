import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract, useChainId, useSwitchChain } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import BottomNavigation from '../components/BottomNavigation'
import { bunnyGameABI } from '../libs/bunnyGameABI'
import { eggTokenABI } from '../libs/eggTokenABI'
import { megaEggABI } from '../libs/megaEggABI'
import { SUPPORTED_CHAIN } from '../libs/supportedChains'
import { BUNNY_GAME_ADDRESS, EGG_TOKEN_ADDRESS, MEGA_EGG_ADDRESS } from '../libs/constants'

function ShopPage() {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [buyEggsAmount, setBuyEggsAmount] = useState(1)
  const [mergeEggsAmount, setMergeEggsAmount] = useState(10)

  // Contract reads
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

  const { data: eggPrice, isLoading: isLoadingPrice, error: eggPriceError } = useReadContract({
    address: BUNNY_GAME_ADDRESS,
    abi: bunnyGameABI,
    functionName: 'eggPrice',
    query: { enabled: chainId === SUPPORTED_CHAIN.id, refetchInterval: 5000 },
  });

  const { data: eggAllowance, refetch: refetchAllowance } = useReadContract({
    address: EGG_TOKEN_ADDRESS,
    abi: eggTokenABI,
    functionName: 'allowance',
    args: address ? [address, BUNNY_GAME_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Contract writes
  const { writeContract: buyEggsWrite, data: buyHash, isPending: isBuyPending } = useWriteContract()
  const { writeContract: approveEgg, data: approveHash, isPending: isApprovePending } = useWriteContract()
  const { writeContract: mergeEggs, data: mergeHash, isPending: isMergePending } = useWriteContract()

  // Wait for confirmations
  const { isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyHash })
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: isMergeSuccess } = useWaitForTransactionReceipt({ hash: mergeHash })

  const isAnyPending = isBuyPending || isApprovePending || isMergePending

  // Format balances
  const eggBal = eggBalance ? parseFloat(formatEther(eggBalance as bigint)) : 0
  const megaEggBal = megaEggBalance ? parseFloat(formatEther(megaEggBalance as bigint)) : 0

  // Success handlers
  useEffect(() => {
    if (isBuySuccess && buyHash && chain) {
      toast.success('✅ Eggs purchased!')
      refetchEggBalance()
    }
  }, [isBuySuccess])

  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('✅ Approval confirmed!')
      refetchAllowance()
    }
  }, [isApproveSuccess])

  useEffect(() => {
    if (isMergeSuccess && mergeHash && chain) {
      toast.success('✨ Eggs merged to MegaEgg!')
      refetchEggBalance()
    }
  }, [isMergeSuccess])

  const handleBuyEggs = () => {
    if (!address || chainId !== SUPPORTED_CHAIN.id || !eggPrice) return
    const price = eggPrice as bigint
    const totalCost = price * BigInt(buyEggsAmount)

    buyEggsWrite({
      address: BUNNY_GAME_ADDRESS,
      abi: bunnyGameABI,
      functionName: 'buyEggs',
      value: totalCost,
      chainId: SUPPORTED_CHAIN.id,
    })
  }

  const handleApprove = () => {
    if (!address) return
    const amount = parseEther(mergeEggsAmount.toString())

    approveEgg({
      address: EGG_TOKEN_ADDRESS,
      abi: eggTokenABI,
      functionName: 'approve',
      args: [BUNNY_GAME_ADDRESS, amount],
      chainId: SUPPORTED_CHAIN.id,
    })
  }

  const handleMerge = () => {
    if (!address || chainId !== SUPPORTED_CHAIN.id) return
    const amount = parseEther(mergeEggsAmount.toString())

    mergeEggs({
      address: BUNNY_GAME_ADDRESS,
      abi: bunnyGameABI,
      functionName: 'mergeEggsForMegaEgg',
      args: [amount],
      value: parseEther('0.01'),
      chainId: SUPPORTED_CHAIN.id,
    })
  }

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN.id

  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh', paddingBottom: '70px', background: 'hsl(var(--background))' }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", paddingTop: "100px", textAlign: "center" }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet</h2>
          <p style={{ color: "#6b7280" }}>Connect your wallet to access the shop</p>
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

  const needsApproval = eggAllowance ? (eggAllowance as bigint) < parseEther(mergeEggsAmount.toString()) : true

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: '100vh', paddingBottom: '70px', background: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0.75rem", paddingTop: "80px" }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>🛒 Shop</h1>
        </div>

        {/* Balances */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '1rem', border: '3px solid hsl(var(--celo-black))', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))', textTransform: 'uppercase', marginBottom: '0.25rem' }}>EGG</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{eggBal.toFixed(0)} 🥚</div>
          </div>
          <div style={{ background: 'hsl(var(--celo-tan-2))', padding: '1rem', border: '3px solid hsl(var(--celo-black))', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--celo-brown))', textTransform: 'uppercase', marginBottom: '0.25rem' }}>MEGA</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{megaEggBal.toFixed(0)} ✨</div>
          </div>
        </div>

        {/* Buy Eggs */}
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'hsl(var(--celo-tan-2))', border: '3px solid hsl(var(--celo-black))' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Buy Eggs with ETH</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input
              type="number"
              min="1"
              value={buyEggsAmount}
              onChange={(e) => setBuyEggsAmount(parseInt(e.target.value) || 1)}
              style={{ flex: 1, padding: '0.75rem', border: '3px solid hsl(var(--celo-black))', fontSize: '1rem', fontWeight: 'bold' }}
            />
            <button
              onClick={handleBuyEggs}
              disabled={isAnyPending}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'hsl(var(--celo-yellow))',
                border: '3px solid hsl(var(--celo-black))',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: isAnyPending ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {isBuyPending ? '⏳ Buying...' : 'Buy'}
            </button>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--celo-brown))' }}>
            Cost: {eggPrice != null 
              ? formatEther((eggPrice as bigint) * BigInt(buyEggsAmount || 1)) 
              : isLoadingPrice 
                ? 'Loading...' 
                : '...'} ETH
            {eggPriceError && <div style={{ fontSize: '0.7rem', color: 'red', marginTop: '0.25rem' }}>Error loading price</div>}
          </div>
        </div>

        {/* Merge Eggs */}
        <div style={{ padding: '1rem', background: 'hsl(var(--celo-tan-2))', border: '3px solid hsl(var(--celo-black))' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Merge to MegaEgg</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input
              type="number"
              min="10"
              step="10"
              value={mergeEggsAmount}
              onChange={(e) => setMergeEggsAmount(parseInt(e.target.value) || 10)}
              style={{ flex: 1, padding: '0.75rem', border: '3px solid hsl(var(--celo-black))', fontSize: '1rem', fontWeight: 'bold' }}
            />
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isAnyPending}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'hsl(var(--celo-purple))',
                  color: 'white',
                  border: '3px solid hsl(var(--celo-black))',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: isAnyPending ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {isApprovePending ? '⏳ Approving...' : 'Approve'}
              </button>
            ) : (
              <button
                onClick={handleMerge}
                disabled={isAnyPending}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'hsl(var(--celo-purple))',
                  color: 'white',
                  border: '3px solid hsl(var(--celo-black))',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: isAnyPending ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {isMergePending ? '⏳ Merging...' : 'Merge'}
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--celo-brown))' }}>
            Fee: 0.01 ETH + {mergeEggsAmount} EGG → {mergeEggsAmount / 10} MEGG
          </div>
        </div>
      </div>

      <BottomNavigation />
    </motion.div>
  )
}

export const Route = createFileRoute('/shop')({
  component: ShopPage,
})
