
import React, { useState } from 'react';
import { UserRole, Permission, Group, User } from '../../types';

interface InitialSetupProps {
  onComplete: (admin: User, group: Group) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    groupName: 'Administrators',
    adminName: '',
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGroup: Group = {
      id: 'g-initial',
      name: formData.groupName,
      permissions: Object.values(Permission)
    };

    const newAdmin: User = {
      id: 'u-initial',
      username: formData.username,
      password: formData.password,
      displayName: formData.adminName,
      role: UserRole.ADMIN,
      groupId: newGroup.id
    };

    onComplete(newAdmin, newGroup);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="p-12">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">1</div>
               <div>
                 <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Initialization</h2>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Step 1: Authority Setup</p>
               </div>
            </div>
            <div className="flex gap-1">
              <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
              <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 italic uppercase">System Bootstrap</h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">No users detected. Please initialize the primary administrative node for this network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Primary Group Name</label>
                  <input 
                    required 
                    value={formData.groupName}
                    onChange={e => setFormData({...formData, groupName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700" 
                    placeholder="e.g. Executive Board"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Admin Display Name</label>
                  <input 
                    required 
                    value={formData.adminName}
                    onChange={e => setFormData({...formData, adminName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700" 
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Root Username</label>
                  <input 
                    required 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700" 
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Security Access Key (Password)</label>
                  <input 
                    required 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Initialize Node & Proceed to Network Config
              <span>→</span>
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Database Version 4.2.0-secure-bootstrap</p>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;
