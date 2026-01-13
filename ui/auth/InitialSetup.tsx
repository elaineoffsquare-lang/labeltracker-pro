
import React, { useState, useRef } from 'react';
import InitialSetup from './InitialSetup';
import { db } from '../../services/db';
import { User, Group } from '../../types';

const SetupWizard: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'create' | 'join'>('welcome');

  const handleSetupComplete = (admin: User, group: Group) => {
    const initialState = db.get();
    db.save({
      ...initialState,
      groups: [group],
      users: [admin]
    });
    alert('Network created successfully! You will now be taken to the login screen.');
    window.location.reload();
  };
  
  const WelcomeStep = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-900/20 mb-6 mx-auto">LT</div>
      <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">LABELTRACKER PRO</h1>
      <p className="text-sm text-slate-500 font-medium mt-4 mb-12">High-performance Supply Chain & Inventory Management System</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
        <button onClick={() => setStep('join')} className="p-8 bg-blue-50 hover:bg-blue-100 rounded-3xl border-2 border-blue-100/80 transition-all text-left">
          <h2 className="font-black text-blue-800 text-lg">🔗 Join Existing Network</h2>
          <p className="text-sm text-blue-700/80 mt-1">Connect this device to a primary node already running on your LAN or VPN.</p>
        </button>
        <button onClick={() => setStep('create')} className="p-8 bg-slate-50 hover:bg-slate-100 rounded-3xl border-2 border-slate-100 transition-all text-left">
          <h2 className="font-black text-slate-800 text-lg">🚀 Create New Network</h2>
          <p className="text-sm text-slate-500 mt-1">Set up a new, independent network on this device. This will become your primary node.</p>
        </button>
      </div>
    </div>
  );

  const JoinStep = () => {
    const [serverUrl, setServerUrl] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConnect = (e: React.FormEvent) => {
      e.preventDefault();
      db.saveConfig({ ...db.getConfig(), serverUrl, rememberServerUrl: true });
      setIsConnected(true);
    };
    
    const handleImportClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') throw new Error('File could not be read.');
          const data = JSON.parse(text);
          
          if (data && data.products && data.orders && data.shipments && data.users && data.version) {
            db.save(data, { silent: true });
            alert('Sync successful! This device is now linked to the primary node.');
            window.location.reload();
          } else {
            throw new Error('Invalid or corrupted network file.');
          }
        } catch (error: any) {
          alert(`Sync failed: ${error.message}`);
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    };

    return (
      <div>
        <button onClick={() => setStep('welcome')} className="text-sm font-bold text-slate-400 mb-8 hover:text-slate-700">← Back</button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Join Existing Network</h1>
        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">Enter the IP address of your primary node to initiate a connection. This is typically the computer where you first set up LabelTracker Pro.</p>

        {!isConnected ? (
          <form onSubmit={handleConnect} className="flex items-end gap-4 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex-grow">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Primary Node Address (LAN IP)</label>
              <input
                required
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full bg-white border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all"
                placeholder="e.g., 192.168.1.50:3000"
              />
            </div>
            <button type="submit" className="h-[60px] px-8 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Connect & Sync</button>
          </form>
        ) : (
          <div className="p-8 bg-emerald-50 rounded-3xl border-2 border-emerald-200 text-center animate-in fade-in duration-500">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-black text-emerald-800">Connection Initiated!</h2>
            <p className="text-emerald-700/80 mb-6">Your primary node at <strong className="font-bold">{serverUrl}</strong> has been saved.</p>
            <p className="text-sm text-emerald-900 mb-6 max-w-md mx-auto">To complete the secure one-time data transfer, export the database from your primary device (`System` → `Export JSON`) and import it here.</p>
            <button onClick={handleImportClick} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all">
              Import Network File
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".json" />
          </div>
        )}
      </div>
    );
  };

  const CreateStep = () => (
    <div>
        <button onClick={() => setStep('welcome')} className="text-sm font-bold text-slate-400 mb-4 hover:text-slate-700">← Back</button>
        <InitialSetup onComplete={handleSetupComplete} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl p-12 animate-in fade-in zoom-in-95 duration-500">
        {step === 'welcome' && <WelcomeStep />}
        {step === 'create' && <CreateStep />}
        {step === 'join' && <JoinStep />}
      </div>
    </div>
  );
};

export default SetupWizard;
