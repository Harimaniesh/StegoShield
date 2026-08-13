import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
}

const titles: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Security Dashboard', subtitle: 'Overview of image analysis, steganography operations, and threat telemetry.' },
  embed: { title: 'LSB Steganography Embed', subtitle: 'AES-256-GCM encrypted payload embedding into lossless RGB image channels.' },
  extract: { title: 'Payload Extraction & Decryption', subtitle: 'Recover and decrypt hidden messages or secret files using PBKDF2 key verification.' },
  steganalysis: { title: 'Forensic Steganalysis', subtitle: 'Multi-channel Shannon entropy, LSB distribution, Chi-Square, and noise risk scoring.' },
  comparison: { title: 'Forensic Image Comparison', subtitle: 'Pixel difference mapping, MAE, changed percentage, and PSNR calculations.' },
  metadata: { title: 'EXIF & Header Analysis', subtitle: 'Extract image camera hardware, creation timestamps, and color profile data.' },
  history: { title: 'Operational Audit Log', subtitle: 'Complete immutable record of all embedding, extraction, and steganalysis activity.' },
  settings: { title: 'Platform Settings', subtitle: 'System limits, encryption primitives, and engine parameters.' },
};

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const info = titles[activeTab] || { title: 'StegoShield', subtitle: 'Cybersecurity Forensic Engine' };

  return (
    <header className="h-20 bg-[#0d121f]/70 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 backdrop-blur-md z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">{info.title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Security Primitive Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>AES-256-GCM • PBKDF2</span>
        </div>

        {/* Real-time System Time Counter */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || 'SECURE SYSTEM'}</span>
        </div>
      </div>
    </header>
  );
};
