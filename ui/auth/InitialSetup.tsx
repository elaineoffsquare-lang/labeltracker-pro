
import React, { useState } from 'react';
import { UserRole, Permission, Group, User } from '../../types';

interface InitialSetupProps {
  onComplete: (admin: User, group: Group) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    groupName: 'Administrators',
    adminName: '',
    username: 'admin',
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
    <div className="w-full animate-in fade-in duration-500">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Create New Network</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">This device will become the primary node. First, create the root administrator account.</p>
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
            Create Primary Node
            <span>→</span>
          </button>
        </form>
    </div>
  );
};

export default InitialSetup;
