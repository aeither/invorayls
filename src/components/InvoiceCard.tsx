import { formatEther } from 'viem';
import { motion } from 'framer-motion';
import { FileText, Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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

  // Mock AI Risk Evaluation
  const getRiskScore = (id: number) => {
    const scores = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
    // Deterministic pseudo-random based on ID
    const index = id % scores.length;
    const score = scores[index];

    let yieldRate = 0;
    let color = '';

    switch (score.charAt(0)) {
      case 'A':
        yieldRate = 5 + (id % 3);
        color = 'text-emerald-400';
        break;
      case 'B':
        yieldRate = 8 + (id % 4);
        color = 'text-blue-400';
        break;
      case 'C':
        yieldRate = 12 + (id % 5);
        color = 'text-amber-400';
        break;
      default:
        yieldRate = 5;
        color = 'text-emerald-400';
    }

    return { score, yieldRate, color };
  };

  const risk = getRiskScore(tokenId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300"
    >
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${invoice.paid
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : isOverdue
          ? 'bg-red-500/10 text-red-400 border-red-500/20'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
        {invoice.paid ? <CheckCircle2 size={12} /> : isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
        {invoice.paid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
      </div>

      {/* Token ID & Risk Score */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-200/50 uppercase tracking-wider">
          <FileText size={12} />
          Invoice #{tokenId}
        </div>

        {!invoice.paid && (
          <div className="flex flex-col items-end mt-8">
            <div className={`text-lg font-bold ${risk.color} flex items-center gap-1`}>
              <span className="text-[10px] text-blue-200/50 font-normal uppercase tracking-wider mr-1">AI Risk</span>
              {risk.score}
            </div>
            <div className="text-[10px] font-medium text-blue-200/60">
              ~{risk.yieldRate}% Yield
            </div>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">
          ${amount.toFixed(2)}
        </div>
        <div className="text-xs font-medium text-blue-200/50 uppercase tracking-wider">
          USDC Amount
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200/50 uppercase tracking-wider mb-1">
            <Calendar size={10} /> Due Date
          </div>
          <div className="text-sm font-medium text-white mb-1">
            {dueDate.toLocaleDateString()}
          </div>
          <div className={`text-[10px] font-medium ${isOverdue ? 'text-red-400' : 'text-blue-200/70'
            }`}>
            {invoice.paid
              ? 'Completed'
              : isOverdue
                ? `${Math.abs(daysUntilDue)} days overdue`
                : `${daysUntilDue} days left`}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200/50 uppercase tracking-wider mb-1">
            <User size={10} /> Payer
          </div>
          <div className="text-sm font-medium text-white font-mono">
            {invoice.payer.slice(0, 6)}...{invoice.payer.slice(-4)}
          </div>
        </div>
      </div>

      {showIssuer && (
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200/50 uppercase tracking-wider mb-1">
            <User size={10} /> Issuer
          </div>
          <div className="text-sm font-medium text-white font-mono">
            {invoice.issuer.slice(0, 6)}...{invoice.issuer.slice(-4)}
          </div>
        </div>
      )}

      {/* Action Button */}
      {onAction && actionLabel && (
        <button
          onClick={() => onAction(tokenId)}
          disabled={actionDisabled}
          className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${actionDisabled
            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            : 'glass-button-primary hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
