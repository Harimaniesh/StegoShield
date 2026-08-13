import React, { useState, useEffect } from 'react';
import { getHealthApi } from '../services/api';
import { Settings as SettingsIcon, Shield, Server, Cpu, Database, CheckCircle2, XCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    getHealthApi()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Platform Security Configuration</h2>
              <p className="text-xs text-slate-400">Security parameters & cryptographic primitives</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {health?.status === 'online' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Backend Healthy</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <XCircle className="w-3.5 h-3.5" />
                <span>Backend Unreachable</span>
              </span>
            )}
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Symmetric Encryption</span>
            </span>
            <p className="text-slate-300">AES-256-GCM (Authenticated Galois/Counter Mode)</p>
            <p className="text-slate-500 text-[11px]">16-byte random salt, 12-byte random nonce per encryption</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>Key Derivation Function (KDF)</span>
            </span>
            <p className="text-slate-300">PBKDF2-HMAC-SHA256 (100,000 Iterations)</p>
            <p className="text-slate-500 text-[11px]">Memory-hard key strengthening against brute-force</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>Server Binding & Upload Limits</span>
            </span>
            <p className="text-slate-300">127.0.0.1 (Localhost strictly) • 15 MB Max Upload</p>
            <p className="text-slate-500 text-[11px]">Pillow magic bytes header verification enforced</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Database Storage</span>
            </span>
            <p className="text-slate-300">SQLite ORM (`stegoshield.db` via SQLAlchemy)</p>
            <p className="text-slate-500 text-[11px]">No plaintext passwords or keys logged to disk</p>
          </div>
        </div>

        {/* Ethical Disclaimer Box */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
          <h4 className="font-bold text-cyan-400 uppercase tracking-wider">Educational & Forensic Notice</h4>
          <p className="leading-relaxed text-slate-300/90 font-sans text-xs">
            StegoShield is developed exclusively for authorized cybersecurity research, digital forensics education, and security posture analysis. All cryptographic operations follow industry best-practices and fail securely without leaking sensitive stack traces.
          </p>
        </div>
      </div>
    </div>
  );
};
