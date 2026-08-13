import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { steganalyzeApi } from '../services/api';
import { SteganalysisResponse } from '../types/stego';
import { RiskBadge } from '../components/RiskBadge';
import {
  ShieldAlert,
  Activity,
  FileSearch,
  Hash,
  Info,
  BarChart2,
  Sliders,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SteganalysisPageProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export const SteganalysisPage: React.FC<SteganalysisPageProps> = ({ onNotify }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SteganalysisResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      onNotify('Please select an image file to analyze.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await steganalyzeApi(imageFile);
      setResult(data);
      onNotify('Forensic steganalysis complete.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Steganalysis scan failed.';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const lsbChartData = result
    ? Object.entries(result.lsb_distribution).map(([ch, ratio]) => ({
        channel: ch,
        ratio: ratio,
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Upload Form */}
      <form onSubmit={handleAnalyze} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Forensic Steganalysis Engine</span>
          </h2>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            Shannon Entropy • Chi-Square
          </span>
        </div>

        <Dropzone
          label="Upload Suspect Image (PNG / JPEG / BMP)"
          selectedFile={imageFile}
          onFileSelect={setImageFile}
          helperText="Select target image to calculate LSB randomness & channel entropy"
        />

        <button
          type="submit"
          disabled={loading || !imageFile}
          className="w-full py-3 rounded-xl cyber-button text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Processing Forensic Algorithms...</span>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Run Steganalysis Scan</span>
            </>
          )}
        </button>
      </form>

      {/* Forensic Report Output */}
      {result && (
        <div className="space-y-6">
          {/* Risk Assessment Card */}
          <div className="glass-panel-glow p-6 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">
                  Target: {result.filename}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-xl font-bold text-slate-100 font-sans">Risk Assessment Rating</h3>
                  <RiskBadge score={result.risk_score} value={result.risk_value} />
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-slate-400">
                <span>Overall Shannon Entropy: </span>
                <strong className="text-cyan-400 text-sm block font-bold">
                  {result.overall_entropy} bits / byte
                </strong>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-2.5 text-cyan-300 text-xs font-mono">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>

            {/* Steganography Indicators Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
                Detected Forensic Indicators:
              </h4>
              <div className="space-y-1.5">
                {result.stego_indicators.map((ind, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">DIMENSIONS & CHANNELS</span>
              <span className="text-slate-100 font-bold text-sm">{result.dimensions}</span>
              <span className="text-slate-400 block text-[10px]">{result.channels} Color Channels (RGB)</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">PIXEL VARIANCE</span>
              <span className="text-cyan-400 font-bold text-sm">{result.pixel_variance}</span>
              <span className="text-slate-400 block text-[10px]">Spatial intensity variance</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">NOISE VARIANCE (LAPLACIAN)</span>
              <span className="text-cyan-400 font-bold text-sm">{result.noise_level}</span>
              <span className="text-slate-400 block text-[10px]">High-frequency noise domain</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">CHI-SQUARE PAIR UNIFORMITY</span>
              <span className="text-cyan-400 font-bold text-sm">{result.chi_square_p_value}</span>
              <span className="text-slate-400 block text-[10px]">Adjacent pair randomness</span>
            </div>
          </div>

          {/* Charts & Channel Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LSB Distribution Histogram */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>LSB Bit Distribution (% 1s per channel)</span>
              </h4>
              <p className="text-xs text-slate-400">
                Natural images usually exhibit correlated non-50% LSB ratios. Ratios near 50.0% indicate random encrypted data.
              </p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lsbChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="channel" stroke="#475569" fontSize={11} fontFamily="monospace" />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                    <Bar dataKey="ratio" radius={[6, 6, 0, 0]}>
                      {lsbChartData.map((entry, idx) => {
                        const colors: Record<string, string> = { Red: '#ef4444', Green: '#10b981', Blue: '#3b82f6' };
                        return <Cell key={idx} fill={colors[entry.channel] || '#06b6d4'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RGB Channel Statistics Table */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>RGB Channel Statistics</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Channel</th>
                      <th className="p-2">Mean</th>
                      <th className="p-2">Std Dev</th>
                      <th className="p-2">Entropy</th>
                      <th className="p-2">LSB Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {Object.entries(result.channel_stats).map(([ch, stats]) => (
                      <tr key={ch}>
                        <td className="p-2 font-bold text-slate-100">{ch}</td>
                        <td className="p-2">{stats.mean}</td>
                        <td className="p-2">{stats.std_dev}</td>
                        <td className="p-2 text-cyan-400 font-bold">{stats.entropy}</td>
                        <td className="p-2">{stats.lsb_ratio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
