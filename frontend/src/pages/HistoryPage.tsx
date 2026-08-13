import React, { useState, useEffect } from 'react';
import { getHistoryApi } from '../services/api';
import { HistoryItem } from '../types/stego';
import { RiskBadge } from '../components/RiskBadge';
import { History as HistoryIcon, Download, Search, Filter, RefreshCw, ShieldCheck } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistoryApi(actionFilter === 'ALL' ? undefined : actionFilter);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [actionFilter]);

  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase()) ||
    item.sha256_hash.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    if (filteredHistory.length === 0) return;
    const headers = ['ID', 'Action', 'Filename', 'File Size (Bytes)', 'Dimensions', 'SHA-256 Hash', 'Risk Score', 'Timestamp'];
    const rows = filteredHistory.map(i => [
      i.id,
      i.action_type,
      `"${i.filename}"`,
      i.file_size_bytes,
      i.image_dimensions,
      i.sha256_hash,
      i.risk_score || 'N/A',
      i.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stegoshield_audit_log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-mono">Operational Audit Log</h2>
            <p className="text-xs text-slate-400 font-mono">Immutable database history of steganography events</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="EMBED">Embed</option>
              <option value="EXTRACT">Extract</option>
              <option value="STEGANALYZE">Steganalyze</option>
              <option value="COMPARE">Compare</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search filename / hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-48"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Loading audit log entries...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No history records match the selected filter query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Filename</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">SHA-256 Checksum</th>
                  <th className="p-3">Forensic Rating</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
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
                    <td className="p-3 text-slate-400">{(item.file_size_bytes / 1024).toFixed(1)} KB</td>
                    <td className="p-3 text-slate-400">{item.image_dimensions}</td>
                    <td className="p-3 text-slate-500 truncate max-w-[140px]" title={item.sha256_hash}>
                      {item.sha256_hash}
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
