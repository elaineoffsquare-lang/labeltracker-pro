
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'shipments', label: 'Logistics', icon: '🚚' },
    { id: 'users', label: 'System', icon: '⚙️' },
    { id: 'help', label: 'Help / Guide', icon: '❓' },
  ];

  // Admin only tab
  if (currentUser.role === UserRole.ADMIN) {
    menuItems.splice(5, 0, { id: 'user_mgmt', label: 'User Mgmt', icon: '👤' });
  }

  const getSyncStatusColor = () => {
    switch(currentUser.syncStatus) {
      case 'SYNCING': return 'bg-blue-500 animate-spin-slow';
      case 'SUCCESS': return 'bg-emerald-500';
      case 'ERROR': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <aside className="w-[300px] bg-[#0F172A] text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-10">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-blue-900/40">LT</div>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase">LABELTRACKER</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-1">Supply Chain Pro</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-4 text-sm font-black rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`mr-4 text-xl ${isActive ? 'opacity-100' : 'opacity-50'}`}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4 bg-[#1E293B]/50 p-4 rounded-3xl border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg shadow-lg">
              {currentUser?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate text-white">{currentUser?.name || 'Admin'}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${getSyncStatusColor()}`}></div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{currentUser.syncStatus === 'SYNCING' ? 'Syncing...' : 'Encrypted'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md h-24 flex items-center justify-between px-12 z-10 border-b border-slate-100">
          <div>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{activeTab.toUpperCase()} NODE</h2>
            <div className="h-0.5 w-10 bg-blue-600 mt-2"></div>
          </div>
          <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-2.5 h-2.5 rounded-full ${getSyncStatusColor()} shadow-lg`}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {currentUser.syncStatus === 'IDLE' ? 'Local Network Connected' : 'Updating Infrastructure...'}
                </span>
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC]">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
