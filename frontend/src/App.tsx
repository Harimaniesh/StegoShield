import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastType } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { EmbedPage } from './pages/EmbedPage';
import { ExtractPage } from './pages/ExtractPage';
import { SteganalysisPage } from './pages/SteganalysisPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { MetadataPage } from './pages/MetadataPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { getHealthApi } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Poll backend health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await getHealthApi();
        setBackendOnline(true);
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const notify = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'embed':
        return <EmbedPage onNotify={notify} />;
      case 'extract':
        return <ExtractPage onNotify={notify} />;
      case 'steganalysis':
        return <SteganalysisPage onNotify={notify} />;
      case 'comparison':
        return <ComparisonPage onNotify={notify} />;
      case 'metadata':
        return <MetadataPage onNotify={notify} />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-slate-100 bg-cyber-grid">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} backendOnline={backendOnline} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
export default App;
