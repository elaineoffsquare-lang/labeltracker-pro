
import React, { useState } from 'react';
import { db } from '../../services/db'; 

interface SystemScreenProps {
  setSyncStatus: (status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR') => void;
}

const SystemScreen: React.FC<SystemScreenProps> = ({ setSyncStatus }) => {
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
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">System Control</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">Manage data and network settings</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
              <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest mb-4">Internal Network Link (LAN)</h3>
              <p className="text-sm text-blue-700 font-medium mb-6">Enter the IP address of your central office computer to sync all devices on the same Wi-Fi.</p>
              <input 
                type="text"
                placeholder="e.g. http://192.168.1.50:3000"
                value={config.serverUrl}
                onChange={(e) => updateConfig({ serverUrl: e.target.value })}
                className="w-full p-4 bg-white border border-blue-200 rounded-2xl outline-none font-bold text-blue-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <button 
                onClick={handleSync}
                className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Test Connection & Sync
              </button>
            </div>

            <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
              <h3 className="font-black text-emerald-900 uppercase text-[10px] tracking-widest mb-4">Database Management</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Export a full backup of your local data, or perform a factory reset to start fresh.
              </p>
              <div className="flex gap-4">
                <button onClick={handleExport} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Export to JSON</button>
                <button onClick={db.reset} className="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">Factory Reset</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-widest mb-6">Current Nodes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-slate-700 text-sm">Local Host (This Device)</span>
                </div>
                <span className="text-[10px] font-black text-slate-300">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${config.serverUrl ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <span className="font-bold text-slate-700 text-sm">Primary Database Node</span>
                </div>
                <span className="text-[10px] font-black text-slate-300">{config.serverUrl ? 'CONFIGURED' : 'DISCONNECTED'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemScreen;
