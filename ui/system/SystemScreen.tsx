
import React, { useState } from 'react';
import { db, DatabaseSchema } from '../../services/db'; 

interface SystemScreenProps {
  setSyncStatus: (status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR') => void;
  dbState: DatabaseSchema;
  onConfigSaved?: () => void;
  isInitialSetup?: boolean;
}

const SystemScreen: React.FC<SystemScreenProps> = ({ setSyncStatus, dbState, onConfigSaved, isInitialSetup = false }) => {
  const [config, setConfig] = useState(db.getConfig());

  const handleSync = async () => {
    setSyncStatus('SYNCING');
    const result = await db.sync(); 
    setSyncStatus(result.success ? 'SUCCESS' : 'ERROR');
    setTimeout(() => setSyncStatus('IDLE'), 3000);
  };

  const updateConfig = (newCfg: any) => {
    const updated = { ...config, ...newCfg };
    setConfig(updated);
    db.saveConfig(updated);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(db.get(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labeltracker_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Network Configuration</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Connect to your primary office node</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-slate-400 italic">LT</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
              <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest mb-4">Connection Bridge</h3>
              
              <div className="flex bg-white border border-blue-100 rounded-2xl p-1 mb-6">
                <button 
                  onClick={() => updateConfig({ connectionMode: 'LAN' })}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${config.connectionMode === 'LAN' ? 'bg-blue-600 text-white shadow' : 'text-blue-500'}`}
                >
                  LAN
                </button>
                <button 
                  onClick={() => updateConfig({ connectionMode: 'VPN' })}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${config.connectionMode === 'VPN' ? 'bg-blue-600 text-white shadow' : 'text-blue-500'}`}
                >
                  VPN
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Primary Node Address</label>
                <input 
                  type="text"
                  placeholder={config.connectionMode === 'LAN' ? "e.g. 192.168.1.50:3000" : "office-vpn.local:3000"}
                  value={config.serverUrl}
                  onChange={(e) => updateConfig({ serverUrl: e.target.value })}
                  className="w-full p-4 bg-white border border-blue-200 rounded-2xl outline-none font-bold text-blue-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between bg-white/50 p-3 rounded-2xl">
                    <label htmlFor="remember-url-toggle" className="font-bold text-blue-800 text-xs cursor-pointer ml-2 select-none">
                        Remember Connection Details
                    </label>
                    <button
                        id="remember-url-toggle"
                        onClick={() => updateConfig({ rememberServerUrl: !config.rememberServerUrl })}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${config.rememberServerUrl ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${config.rememberServerUrl ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between bg-white/50 p-3 rounded-2xl">
                    <label htmlFor="auto-sync-toggle" className="font-bold text-blue-800 text-xs cursor-pointer ml-2 select-none">
                        Real-time Auto Sync
                    </label>
                    <button
                        id="auto-sync-toggle"
                        onClick={() => updateConfig({ isAutoSyncEnabled: !config.isAutoSyncEnabled })}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${config.isAutoSyncEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${config.isAutoSyncEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
              </div>

              <button 
                onClick={handleSync}
                className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                Test Connectivity
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 mt-3">
                Current Sync Heartbeat: {new Date(dbState.lastSync).toLocaleTimeString()}
              </p>
            </div>

            <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
              <h3 className="font-black text-emerald-900 uppercase text-[10px] tracking-widest mb-4">Infrastructure Backup</h3>
              <div className="flex gap-4">
                <button onClick={handleExport} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Export JSON</button>
                <button onClick={db.reset} className="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">Factory Reset</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-widest mb-6">Topology Map</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-slate-700 text-sm">Active Interface</span>
                </div>
                <span className="text-[10px] font-black text-slate-300">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${config.serverUrl ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <span className="font-bold text-slate-700 text-sm">Target Data Node</span>
                </div>
                <span className="text-[10px] font-black text-slate-300">{config.serverUrl ? 'LINKED' : 'VOID'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemScreen;
