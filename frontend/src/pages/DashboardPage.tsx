import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  Lock,
  Unlock,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { DashboardStats } from '../types/stego';
import { getDashboardStatsApi } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStatsApi();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const riskData = [
    { name: 'Low', count: stats?.risk_distribution?.LOW || 0, color: '#10b981' },
    { name: 'Medium', count: stats?.risk_distribution?.MEDIUM || 0, color: '#06b6d4' },
    { name: 'High', count: stats?.risk_distribution?.HIGH || 0, color: '#f59e0b' },
    { name: 'Critical', count: stats?.risk_distribution?.CRITICAL || 0, color: '#ef4444' },
  ];

  const dummyTimeline = [
    { time: '08:00', analysis: 2, embeds: 1 },
    { time: '10:00', analysis: 5, embeds: 3 },
    { time: '12:00', analysis: 8, embeds: 4 },
    { time: '14:00', analysis: 4, embeds: 2 },
    { time: '16:00', analysis: 9, embeds: 6 },
    { time: '18:00', analysis: 6, embeds: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">
            Security Intelligence Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time steganography telemetry & forensic risk distribution
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Images Analyzed */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Images Analyzed</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">{stats?.images_analyzed || 0}</div>
            <span className="text-[11px] text-cyan-400/80 font-mono">Forensic scans completed</span>
          </div>
        </div>

        {/* Messages Embedded */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Messages Embedded</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">{stats?.messages_embedded || 0}</div>
            <span className="text-[11px] text-emerald-400/80 font-mono">AES-256 encrypted stego PNGs</span>
          </div>
        </div>

        {/* Payloads Extracted */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Payloads Extracted</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">{stats?.payloads_extracted || 0}</div>
            <span className="text-[11px] text-blue-400/80 font-mono">Successful key recoveries</span>
          </div>
        </div>

        {/* Suspicious Images */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Suspicious Images</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-400">{stats?.suspicious_images || 0}</div>
            <span className="text-[11px] text-amber-400/80 font-mono">High / Critical entropy flag</span>
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Avg Risk Score</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">{stats?.average_risk_score || 0}%</div>
            <div className="mt-1">
              <RiskBadge score={stats?.average_risk_rating || 'LOW'} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Timeline */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
                Telemetry Activity Timeline
              </h3>
              <p className="text-xs text-slate-400">Hourly steganography analysis vs embedding rate</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnalysis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorEmbeds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="analysis" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAnalysis)" name="Scans" />
                <Area type="monotone" dataKey="embeds" stroke="#10b981" fillOpacity={1} fill="url(#colorEmbeds)" name="Embeds" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Risk Level Distribution
            </h3>
            <p className="text-xs text-slate-400">Forensic threat category aggregation</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Recent Forensic Activity
            </h3>
            <p className="text-xs text-slate-400">Latest operations executed on the platform</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!stats?.recent_activity || stats.recent_activity.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
            <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No activity logged yet</p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Start by embedding a secret message or running a forensic steganalysis scan.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => onNavigate('embed')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20"
              >
                Embed Secret
              </button>
              <button
                onClick={() => onNavigate('steganalysis')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono hover:bg-slate-700"
              >
                Steganalyze Image
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">SHA-256 Hash</th>
                  <th className="p-3">Risk Assessment</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stats.recent_activity.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.action_type === 'EMBED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.action_type === 'EXTRACT'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : item.action_type === 'STEGANALYZE'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {item.action_type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-100">{item.filename}</td>
                    <td className="p-3 text-slate-400">{item.image_dimensions}</td>
                    <td className="p-3 text-slate-500 truncate max-w-[120px]" title={item.sha256_hash}>
                      {item.sha256_hash.slice(0, 12)}...
                    </td>
                    <td className="p-3">
                      {item.risk_score ? (
                        <RiskBadge score={item.risk_score} value={item.risk_value} />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">{item.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
