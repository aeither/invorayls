import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Zap, Info } from 'lucide-react';

export default function RiskProfileSection() {
    const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

    const profiles = {
        conservative: {
            label: 'Conservative',
            apy: '4-6%',
            desc: 'Focus on A+ rated invoices. Lower risk, stable returns.',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/30',
            icon: ShieldCheck
        },
        moderate: {
            label: 'Moderate',
            apy: '7-10%',
            desc: 'Balanced mix of A and B rated invoices. Optimal risk-reward.',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            icon: TrendingUp
        },
        aggressive: {
            label: 'Aggressive',
            apy: '12-15%',
            desc: 'Includes higher yield B and C rated invoices. Maximum potential returns.',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
            border: 'border-purple-500/30',
            icon: Zap
        }
    };

    const current = profiles[riskProfile];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 mb-8"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-purple-400" />
                    Risk Preference
                </h3>
                <div className="text-xs text-blue-200/60 flex items-center gap-1">
                    <Info size={12} />
                    Estimates based on current pool composition
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(Object.keys(profiles) as Array<keyof typeof profiles>).map((key) => {
                    const profile = profiles[key];
                    const isSelected = riskProfile === key;
                    const Icon = profile.icon;

                    return (
                        <button
                            key={key}
                            onClick={() => setRiskProfile(key)}
                            className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${isSelected
                                    ? `${profile.bg} ${profile.border} shadow-lg`
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-black/20' : 'bg-white/5'}`}>
                                    <Icon size={20} className={profile.color} />
                                </div>
                                {isSelected && (
                                    <div className={`w-2 h-2 rounded-full ${profile.color.replace('text-', 'bg-')}`} />
                                )}
                            </div>

                            <div className="font-bold text-white mb-1">{profile.label}</div>
                            <div className={`text-sm font-mono font-bold ${profile.color} mb-2`}>
                                {profile.apy} APY
                            </div>
                            <div className="text-xs text-blue-200/60 leading-relaxed">
                                {profile.desc}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className={`p-4 rounded-xl border ${current.border} ${current.bg} flex items-center justify-between`}>
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                        Projected Annual Yield
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {current.apy}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                        Risk Score
                    </div>
                    <div className={`text-xl font-bold ${current.color}`}>
                        {riskProfile === 'conservative' ? 'Low' : riskProfile === 'moderate' ? 'Medium' : 'High'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
