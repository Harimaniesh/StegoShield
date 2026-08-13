import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  score: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  value?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, value }) => {
  const normalized = (score || 'LOW').toUpperCase();

  const configs: Record<string, { bg: string; border: string; text: string; icon: any; shadow: string }> = {
    LOW: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: ShieldCheck,
      shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    },
    MEDIUM: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      icon: ShieldAlert,
      shadow: 'shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    },
    HIGH: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: ShieldX,
      shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    },
    CRITICAL: {
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      icon: AlertOctagon,
      shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    },
  };

  const cfg = configs[normalized] || configs.LOW;
  const Icon = cfg.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.shadow}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{normalized}</span>
      {value !== undefined && <span className="opacity-80">({value}%)</span>}
    </div>
  );
};
