import { createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
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
import { FileText, Plus, X, Loader2, Wallet, AlertTriangle, ArrowRight, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import VerificationBanner from '../components/VerificationBanner';
import InvoiceCard from '../components/InvoiceCard';
import { contracts } from '../libs/contracts';
import { SUPPORTED_CHAIN } from '../libs/supportedChains';

interface AIRiskEvaluation {
  score: string;
  confidence: number;
  yieldRate: number;
  factors: { label: string; value: string }[];
}

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<AIRiskEvaluation | null>(null);

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
    setUploadedFile(null);
    setAiEvaluation(null);
  };

  // Mock AI Analysis Function
  const performAIAnalysis = async (file: File, amount: string, dueDate: string): Promise<AIRiskEvaluation> => {
    // Simulate AI processing time (2-4 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Generate mock risk evaluation based on file name, amount, and due date
    const hash = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const amountNum = parseFloat(amount) || 1000;
    const daysUntilDue = Math.floor((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const riskScores = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
    const scoreIndex = Math.abs((hash + Math.floor(amountNum)) % riskScores.length);
    const score = riskScores[scoreIndex];

    // Calculate yield rate based on risk score
    let yieldRate: number;
    if (score.startsWith('A')) {
      yieldRate = 5 + Math.random() * 2; // 5-7%
    } else if (score.startsWith('B')) {
      yieldRate = 8 + Math.random() * 3; // 8-11%
    } else {
      yieldRate = 12 + Math.random() * 4; // 12-16%
    }

    const confidence = 85 + Math.random() * 10; // 85-95% confidence

    // Generate risk factors based on the analysis
    const factors = [
      { label: 'Payment History', value: ['Excellent', 'Good', 'Fair', 'Limited'][Math.abs(hash % 4)] },
      { label: 'Invoice Amount', value: amountNum > 10000 ? 'High Value' : amountNum > 5000 ? 'Medium Value' : 'Standard' },
      { label: 'Payment Terms', value: daysUntilDue > 60 ? 'Long Term' : daysUntilDue > 30 ? 'Standard' : 'Short Term' },
      { label: 'Industry Risk', value: ['Low', 'Moderate', 'Medium'][Math.abs(hash % 3)] },
    ];

    return {
      score,
      confidence: Math.round(confidence * 10) / 10,
      yieldRate: Math.round(yieldRate * 10) / 10,
      factors,
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, PNG, JPG)
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or image file (PNG, JPG)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      setAiEvaluation(null); // Reset evaluation when new file is uploaded
      toast.success(`📄 ${file.name} uploaded`);
    }
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

    if (!uploadedFile) {
      toast.error('Please upload an invoice file');
      return;
    }

    try {
      setPendingAction('mint');
      setAiAnalyzing(true);

      // Perform AI Analysis
      toast.info('🤖 Analyzing invoice with AI...');
      const evaluation = await performAIAnalysis(uploadedFile, amount, dueDate);
      setAiEvaluation(evaluation);

      toast.success(`✅ AI Risk Score: ${evaluation.score} | Yield: ${evaluation.yieldRate}%`);

      // Create Invoice Token
      const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
      const dueDateTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);

      // Create metadata URI with AI evaluation (in a real app, this would be uploaded to IPFS)
      const metadata = {
        description: description || 'Invoice',
        amount,
        dueDate,
        fileName: uploadedFile.name,
        aiRiskScore: evaluation.score,
        aiYieldRate: evaluation.yieldRate,
        aiConfidence: evaluation.confidence,
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
    } finally {
      setAiAnalyzing(false);
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
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-6">
            <Wallet className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-blue-100/60 mb-6">
            Connect your wallet to access the Business Dashboard
          </p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center border-red-500/30 bg-red-500/10">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-red-400 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Wrong Network</h2>
          <p className="text-red-200/70 mb-6">
            Please switch to <strong>{SUPPORTED_CHAIN.name}</strong>
          </p>
          <button
            onClick={() => switchChain({ chainId: SUPPORTED_CHAIN.id })}
            className="glass-button w-full py-3 bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-100"
          >
            Switch to {SUPPORTED_CHAIN.name}
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="text-cyan-400" />
            Business Dashboard
          </h1>
          <p className="text-blue-100/60">
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
            className={`w-full p-4 mb-6 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all duration-300 ${showForm
              ? 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              : 'glass-button-primary hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
              }`}
          >
            {showForm ? <><X size={20} /> Cancel</> : <><Plus size={20} /> Create New Invoice</>}
          </button>
        )}

        {/* Invoice Creation Form */}
        <AnimatePresence>
          {showForm && isVerified && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="glass-panel overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-cyan-400 rounded-full" />
                  Tokenize New Invoice
                </h3>

                <form onSubmit={handleMintInvoice} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">
                      Upload Invoice File *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.png,.jpg,.jpeg"
                        required
                        className="hidden"
                        id="invoice-file-upload"
                      />
                      <label
                        htmlFor="invoice-file-upload"
                        className="w-full bg-black/20 border-2 border-dashed border-white/10 hover:border-cyan-400/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                      >
                        {uploadedFile ? (
                          <div className="flex items-center gap-3 text-cyan-400">
                            <CheckCircle2 size={24} />
                            <div className="text-left">
                              <p className="font-medium">{uploadedFile.name}</p>
                              <p className="text-xs text-blue-200/50">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="text-white/30 group-hover:text-cyan-400/70 transition-colors mb-2" size={32} />
                            <p className="text-white/60 text-sm">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-white/30 text-xs mt-1">
                              PDF, PNG, or JPG (max 10MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">
                      Payer Address *
                    </label>
                    <input
                      type="text"
                      value={payerAddress}
                      onChange={(e) => setPayerAddress(e.target.value)}
                      placeholder="0x..."
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">
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
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Invoice description..."
                      rows={3}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || isConfirming || aiAnalyzing}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isPending || isConfirming || aiAnalyzing
                        ? 'bg-white/5 text-white/40 cursor-not-allowed'
                        : 'glass-button-primary hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {aiAnalyzing ? (
                      <>
                        <Sparkles className="animate-spin" size={20} />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : isPending || isConfirming ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Creating Invoice Token...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        <span>Create Invoice Token</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoices List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            Your Invoices
            {invoiceCount !== undefined && (
              <span className="text-sm font-normal text-blue-200/50 bg-white/5 px-2 py-0.5 rounded-full">
                {invoiceCount.toString()}
              </span>
            )}
          </h2>

          {invoiceCount && Number(invoiceCount) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="glass-panel p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-white/20 w-8 h-8" />
              </div>
              <p className="text-blue-100/60">
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
      <div className="glass-panel p-6 flex items-center justify-center h-[300px]">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  return (
    <InvoiceCard
      tokenId={tokenId}
      invoice={invoice as any}
      onAction={invoice.paid ? undefined : onMarkPaid}
      actionLabel={isMarking ? '⏳ Marking...' : 'Mark as Paid'}
      actionDisabled={invoice.paid || isMarking}
    />
  );
}

export const Route = createFileRoute('/business')({
  component: BusinessDashboard,
});
