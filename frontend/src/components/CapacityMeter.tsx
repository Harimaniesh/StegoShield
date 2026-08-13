import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CapacityMeterProps {
  maxCapacityBytes: number;
  payloadSizeBytes: number;
  dimensions?: string;
  format?: string;
}

export const CapacityMeter: React.FC<CapacityMeterProps> = ({
  maxCapacityBytes,
  payloadSizeBytes,
  dimensions = 'N/A',
  format = 'PNG'
}) => {
  const percentage = maxCapacityBytes > 0 
    ? Math.min(100, (payloadSizeBytes / maxCapacityBytes) * 100)
    : 0;

  const isOverflow = payloadSizeBytes > maxCapacityBytes;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Payload Capacity Meter
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Format: <strong className="text-cyan-400">{format}</strong></span>
          <span>Dimensions: <strong className="text-slate-200">{dimensions}</strong></span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOverflow
              ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]'
              : percentage > 85
              ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
              : 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">
          Payload Size: <strong className={isOverflow ? 'text-rose-400 font-bold' : 'text-slate-200'}>{formatBytes(payloadSizeBytes)}</strong>
        </span>
        <span className="text-slate-400">
          Max Capacity: <strong className="text-cyan-400">{formatBytes(maxCapacityBytes)}</strong> ({percentage.toFixed(1)}%)
        </span>
      </div>

      {isOverflow && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Warning: Payload exceeds available image LSB capacity. Select a larger cover image.</span>
        </div>
      )}
    </div>
  );
};
