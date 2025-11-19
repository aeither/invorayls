import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContracts } from 'wagmi'
import { parseEther, formatEther, formatUnits, parseUnits } from 'viem'
import { bunnyGameABI } from '../libs/bunnyGameABI'
import { eggTokenABI } from '../libs/eggTokenABI'
import { megaEggABI } from '../libs/megaEggABI'
import { dailyRewardsABI } from '../libs/dailyRewardsABI'
import { BUNNY_GAME_ADDRESS, EGG_TOKEN_ADDRESS, MEGA_EGG_ADDRESS, DAILY_REWARDS_ADDRESS } from '../libs/constants'
import { SUPPORTED_CHAIN } from '../libs/supportedChains'

function ContractPlayground() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { writeContract, data: hash, isPending, reset: resetWrite } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Auto-refetch data after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction confirmed!')
      refetchAll()
      resetWrite()
    }
  }, [isConfirmed])

  // Read all BunnyGame data automatically
  const { data: bunnyGameData, refetch: refetchBunnyGame } = useReadContracts({
    contracts: [
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'getBunny', args: address ? [address] : undefined },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'canLayEgg', args: address ? [address] : undefined },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'isActionAvailable', args: address ? [address] : undefined },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'getTimeUntilNextAction', args: address ? [address] : undefined },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'eggPrice' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'owner' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'vaultAddress' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'getStakedBalance', args: address ? [address] : undefined },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'getContractBalance' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'ACTION_ACCUMULATION_TIME' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'MAX_CLAIMABLE_ACTIONS' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'HAPPINESS_PER_ACTION' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'MAX_HAPPINESS' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'EGG_REWARD' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'mergeFee' },
      { address: BUNNY_GAME_ADDRESS, abi: bunnyGameABI, functionName: 'MIN_EGGS_TO_MERGE' },
    ],
    query: { enabled: !!address },
  })

  // Read EggToken data
  const { data: eggTokenData, refetch: refetchEggToken } = useReadContracts({
    contracts: [
      { address: EGG_TOKEN_ADDRESS, abi: eggTokenABI, functionName: 'balanceOf', args: address ? [address] : undefined },
      { address: EGG_TOKEN_ADDRESS, abi: eggTokenABI, functionName: 'totalSupply' },
      { address: EGG_TOKEN_ADDRESS, abi: eggTokenABI, functionName: 'name' },
      { address: EGG_TOKEN_ADDRESS, abi: eggTokenABI, functionName: 'symbol' },
    ],
    query: { enabled: !!address },
  })

  // Read MegaEgg data
  const { data: megaEggData, refetch: refetchMegaEgg } = useReadContracts({
    contracts: [
      { address: MEGA_EGG_ADDRESS, abi: megaEggABI, functionName: 'balanceOf', args: address ? [address] : undefined },
      { address: MEGA_EGG_ADDRESS, abi: megaEggABI, functionName: 'totalSupply' },
    ],
    query: { enabled: !!address },
  })

  // Read DailyRewards data
  const { data: dailyRewardsData, refetch: refetchDailyRewards } = useReadContracts({
    contracts: [
      { address: DAILY_REWARDS_ADDRESS, abi: dailyRewardsABI, functionName: 'getUserStats', args: address ? [address] : undefined },
      { address: DAILY_REWARDS_ADDRESS, abi: dailyRewardsABI, functionName: 'getNextReward', args: address ? [address] : undefined },
      { address: DAILY_REWARDS_ADDRESS, abi: dailyRewardsABI, functionName: 'timeUntilNextCheckIn', args: address ? [address] : undefined },
    ],
    query: { enabled: !!address },
  })

  const refetchAll = () => {
    refetchBunnyGame()
    refetchEggToken()
    refetchMegaEgg()
    refetchDailyRewards()
  }

  // Parse data
  const bunny = bunnyGameData?.[0]?.result as any
  const canLayEgg = bunnyGameData?.[1]?.result as boolean
  const isActionAvailable = bunnyGameData?.[2]?.result as boolean
  const timeUntilNextAction = bunnyGameData?.[3]?.result as bigint
  const eggPrice = bunnyGameData?.[4]?.result as bigint
  const owner = bunnyGameData?.[5]?.result as string
  const vaultAddress = bunnyGameData?.[6]?.result as string
  const stakedBalance = bunnyGameData?.[7]?.result as bigint
  const contractBalance = bunnyGameData?.[8]?.result as bigint
  const ACTION_ACCUMULATION_TIME = bunnyGameData?.[9]?.result as bigint
  const MAX_CLAIMABLE_ACTIONS = bunnyGameData?.[10]?.result as bigint
  const HAPPINESS_PER_ACTION = bunnyGameData?.[11]?.result as bigint
  const MAX_HAPPINESS = bunnyGameData?.[12]?.result as bigint
  const EGG_REWARD = bunnyGameData?.[13]?.result as bigint
  const MERGE_FEE = bunnyGameData?.[14]?.result as bigint
  const MIN_EGGS_TO_MERGE = bunnyGameData?.[15]?.result as bigint

  const eggBalance = eggTokenData?.[0]?.result as bigint
  const eggTotalSupply = eggTokenData?.[1]?.result as bigint
  const eggName = eggTokenData?.[2]?.result as string
  const eggSymbol = eggTokenData?.[3]?.result as string

  const megaEggBalance = megaEggData?.[0]?.result as bigint
  const megaEggTotalSupply = megaEggData?.[1]?.result as bigint

  const userStats = dailyRewardsData?.[0]?.result as any
  const nextReward = dailyRewardsData?.[1]?.result as bigint
  const timeUntilCheckIn = dailyRewardsData?.[2]?.result as bigint

  // State for write functions
  const [ethAmountToBuy, setEthAmountToBuy] = useState('0.001')
  const [eggsToMerge, setEggsToMerge] = useState('')
  const [usdtToStake, setUsdtToStake] = useState('')
  const [usdtToUnstake, setUsdtToUnstake] = useState('')
  const [newEggPrice, setNewEggPrice] = useState('')
  const [newMergeFee, setNewMergeFee] = useState('')
  const [newVaultAddress, setNewVaultAddress] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [referrerAddress, setReferrerAddress] = useState('')

  const handleWrite = async (contractAddress: `0x${string}`, abi: any, functionName: string, args?: any[], value?: bigint) => {
    try {
      const contractConfig: any = {
        address: contractAddress,
        abi,
        functionName,
      }
      if (args) {
        contractConfig.args = args
      }
      if (value !== undefined) {
        contractConfig.value = value
      }
      await writeContract(contractConfig)
    } catch (error: any) {
      toast.error(error?.shortMessage || error?.message || 'Transaction failed')
    }
  }

  if (chainId !== SUPPORTED_CHAIN.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Wrong Network</h2>
          <p className="text-yellow-700">Please switch to {SUPPORTED_CHAIN.name} (Chain ID: {SUPPORTED_CHAIN.id})</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">Please connect your wallet to interact with contracts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contract Debug Dashboard</h1>
          <p className="text-gray-600">All data auto-refreshes after transactions</p>
        </div>
        <button
          onClick={refetchAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Refresh All Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BUNNY STATUS */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-purple-900">Your Bunny Status</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Happiness:</span>
              <span>{bunny?.happiness?.toString() || '0'} / {MAX_HAPPINESS?.toString() || '100'}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Claimable Actions:</span>
              <span>{bunny?.claimableActions?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Instant Actions Left:</span>
              <span>{bunny?.instantActionsRemaining?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Total Eggs Laid:</span>
              <span>{bunny?.totalEggsLaid?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Can Lay Egg:</span>
              <span>{canLayEgg ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Action Available:</span>
              <span>{isActionAvailable ? 'Yes' : `Wait ${timeUntilNextAction?.toString() || '0'}s`}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Initialized:</span>
              <span>{bunny?.initialized ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'petBunny')}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium"
            >
              Pet Bunny (+{HAPPINESS_PER_ACTION?.toString() || '10'} happiness)
            </button>
            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'feedBunny')}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              Feed Bunny (+{HAPPINESS_PER_ACTION?.toString() || '10'} happiness)
            </button>
            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'playWithBunny')}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              Play with Bunny (+{HAPPINESS_PER_ACTION?.toString() || '10'} happiness)
            </button>
            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'layEgg')}
              disabled={isPending || isConfirming || !canLayEgg}
              className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
            >
              Lay Egg (+{EGG_REWARD ? formatEther(EGG_REWARD) : '1'} eggs)
            </button>
          </div>
        </div>

        {/* EGG & MEGAEGG BALANCES */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-green-900">Token Balances</h2>

          <div className="space-y-3 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{eggName} ({eggSymbol})</div>
              <div className="text-2xl font-bold">{eggBalance ? formatUnits(eggBalance, 18) : '0'}</div>
              <div className="text-xs text-gray-500 mt-1">Total Supply: {eggTotalSupply ? formatUnits(eggTotalSupply, 18) : '0'}</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">MegaEgg</div>
              <div className="text-2xl font-bold">{megaEggBalance ? formatUnits(megaEggBalance, 18) : '0'}</div>
              <div className="text-xs text-gray-500 mt-1">Total Supply: {megaEggTotalSupply ? formatUnits(megaEggTotalSupply, 18) : '0'}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-3">Buy Eggs with ETH</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">ETH Amount</label>
              <input
                type="number"
                step="0.001"
                value={ethAmountToBuy}
                onChange={(e) => setEthAmountToBuy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current price: {eggPrice ? formatEther(eggPrice) : '0'} ETH per egg
              </p>
            </div>
            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'buyEggs', undefined, parseEther(ethAmountToBuy))}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Buy Eggs
            </button>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-bold mb-3">Merge Eggs to MegaEgg</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Eggs to Merge</label>
              <input
                type="number"
                value={eggsToMerge}
                onChange={(e) => setEggsToMerge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: {MIN_EGGS_TO_MERGE ? formatEther(MIN_EGGS_TO_MERGE) : '0'} eggs, Fee: {MERGE_FEE ? formatEther(MERGE_FEE) : '0'} ETH
              </p>
            </div>
            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'mergeEggsForMegaEgg', [parseEther(eggsToMerge || '0')], MERGE_FEE)}
              disabled={isPending || isConfirming || !eggsToMerge}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              Merge to MegaEgg
            </button>
          </div>
        </div>

        {/* USDT STAKING */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-900">USDT Staking</h2>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <div className="text-sm text-gray-600 mb-1">Your Staked Balance</div>
            <div className="text-2xl font-bold">{stakedBalance ? formatUnits(stakedBalance, 6) : '0'} USDT</div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stake USDT</label>
              <input
                type="number"
                value={usdtToStake}
                onChange={(e) => setUsdtToStake(e.target.value)}
                placeholder="Amount in USDT"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'stakeUSDT', [parseUnits(usdtToStake || '0', 6)])}
                disabled={isPending || isConfirming || !usdtToStake}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Stake USDT
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unstake USDT</label>
              <input
                type="number"
                value={usdtToUnstake}
                onChange={(e) => setUsdtToUnstake(e.target.value)}
                placeholder="Amount in USDT"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'unstakeUSDT', [parseUnits(usdtToUnstake || '0', 6)])}
                disabled={isPending || isConfirming || !usdtToUnstake}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                Unstake USDT
              </button>
            </div>
          </div>
        </div>

        {/* DAILY REWARDS */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-900">Daily Rewards</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span className="font-medium">Current Streak:</span>
              <span>{userStats?.[1]?.toString() || '0'} days</span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span className="font-medium">Next Reward:</span>
              <span>{nextReward ? formatUnits(nextReward, 18) : '0'} eggs</span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span className="font-medium">Can Check In:</span>
              <span>{userStats?.[4] ? 'Yes' : `Wait ${timeUntilCheckIn?.toString() || '0'}s`}</span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span className="font-medium">Referrals:</span>
              <span>{userStats?.[3]?.toString() || '0'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleWrite(DAILY_REWARDS_ADDRESS, dailyRewardsABI, 'checkIn')}
              disabled={isPending || isConfirming || !userStats?.[4]}
              className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
            >
              Check In (Earn {nextReward ? formatUnits(nextReward, 18) : '0'} eggs)
            </button>

            <div className="border-t pt-3 mt-3">
              <label className="block text-sm font-medium mb-1">Check In with Referrer</label>
              <input
                type="text"
                value={referrerAddress}
                onChange={(e) => setReferrerAddress(e.target.value)}
                placeholder="Referrer address (0x...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(DAILY_REWARDS_ADDRESS, dailyRewardsABI, 'checkInWithReferral', [referrerAddress as `0x${string}`])}
                disabled={isPending || isConfirming || !referrerAddress || !userStats?.[4]}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                Check In with Referral
              </button>
            </div>
          </div>
        </div>

        {/* GAME CONSTANTS */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Game Constants</h2>

          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Action Accumulation Time:</span>
              <span>{ACTION_ACCUMULATION_TIME?.toString() || '0'}s</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Max Claimable Actions:</span>
              <span>{MAX_CLAIMABLE_ACTIONS?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Happiness Per Action:</span>
              <span>{HAPPINESS_PER_ACTION?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Max Happiness:</span>
              <span>{MAX_HAPPINESS?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Egg Reward:</span>
              <span>{EGG_REWARD ? formatEther(EGG_REWARD) : '0'} eggs</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Min Eggs to Merge:</span>
              <span>{MIN_EGGS_TO_MERGE ? formatEther(MIN_EGGS_TO_MERGE) : '0'} eggs</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
              <span>Merge Fee:</span>
              <span>{MERGE_FEE ? formatEther(MERGE_FEE) : '0'} ETH</span>
            </div>
          </div>
        </div>

        {/* ADMIN FUNCTIONS */}
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-red-900">Admin Functions</h2>

          <div className="space-y-3 mb-6">
            <div className="p-3 bg-red-50 rounded">
              <div className="text-sm text-gray-600">Owner</div>
              <div className="font-mono text-xs break-all">{owner || 'Loading...'}</div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="text-sm text-gray-600">Vault Address</div>
              <div className="font-mono text-xs break-all">{vaultAddress || 'Loading...'}</div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="text-sm text-gray-600">Contract Balance</div>
              <div className="font-mono text-xs">{contractBalance ? formatEther(contractBalance) : '0'} ETH</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Set Egg Price</label>
              <input
                type="number"
                step="0.0001"
                value={newEggPrice}
                onChange={(e) => setNewEggPrice(e.target.value)}
                placeholder="Price in ETH"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'setEggPrice', [parseEther(newEggPrice || '0')])}
                disabled={isPending || isConfirming || !newEggPrice}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Update Egg Price
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Set Merge Fee</label>
              <input
                type="number"
                step="0.001"
                value={newMergeFee}
                onChange={(e) => setNewMergeFee(e.target.value)}
                placeholder="Fee in ETH"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'setMergeFee', [parseEther(newMergeFee || '0')])}
                disabled={isPending || isConfirming || !newMergeFee}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Update Merge Fee
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Set Vault Address</label>
              <input
                type="text"
                value={newVaultAddress}
                onChange={(e) => setNewVaultAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'setVaultAddress', [newVaultAddress as `0x${string}`])}
                disabled={isPending || isConfirming || !newVaultAddress}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Update Vault Address
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Transfer Ownership</label>
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button
                onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'transferOwnership', [newOwner as `0x${string}`])}
                disabled={isPending || isConfirming || !newOwner}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Transfer Ownership
              </button>
            </div>

            <button
              onClick={() => handleWrite(BUNNY_GAME_ADDRESS, bunnyGameABI, 'withdrawETH')}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              Withdraw ETH
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
          <p className="font-medium text-blue-900">
            {isPending ? 'Waiting for confirmation...' : 'Processing transaction...'}
          </p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/contract')({
  component: ContractPlayground,
})
