import React from 'react';
import {
  ShieldAlert,
  Lock,
  Unlock,
  Activity,
  GitCompare,
  FileSearch,
  History,
  Settings as SettingsIcon,
  ShieldCheck,
  Radio
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'embed'
  | 'extract'
  | 'steganalysis'
  | 'comparison'
  | 'metadata'
  | 'history'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  backendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, backendOnline }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'embed', label: 'Steganography', icon: Lock },
    { id: 'extract', label: 'Extract', icon: Unlock },
    { id: 'steganalysis', label: 'Steganalysis', icon: ShieldAlert },
    { id: 'comparison', label: 'Image Comparison', icon: GitCompare },
    { id: 'metadata', label: 'Metadata Analysis', icon: FileSearch },
    { id: 'history', label: 'Audit History', icon: History },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#0d121f]/90 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-wide font-mono flex items-center gap-1.5">
              STEGO<span className="text-cyan-400">SHIELD</span>
            </h1>
            <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-mono">
              v1.0 • Forensic Platform
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${backendOnline ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
            <span className="text-xs text-slate-300 font-mono">
              {backendOnline ? 'Engine Online' : 'Engine Offline'}
            </span>
          </div>
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
        </div>
      </div>
    </aside>
  );
};
