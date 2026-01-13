
import React, { useState } from 'react';
import { db, DatabaseSchema } from '../../services/db';
import { User, Group, Permission, UserRole } from '../../types';

interface UserManagementScreenProps {
  dbState: DatabaseSchema;
  onUpdate: (updater: (s: DatabaseSchema) => DatabaseSchema) => void;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ dbState, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  const [groupFormData, setGroupFormData] = useState<Partial<Group>>({ name: '', permissions: [] });
  const [userFormData, setUserFormData] = useState<Partial<User>>({ username: '', password: '', displayName: '', role: UserRole.USER, groupId: '' });

  const togglePermission = (perm: Permission) => {
    const current = groupFormData.permissions || [];
    if (current.includes(perm)) {
      setGroupFormData({ ...groupFormData, permissions: current.filter(p => p !== perm) });
    } else {
      setGroupFormData({ ...groupFormData, permissions: [...current, perm] });
    }
  };

  const saveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(s => ({
      ...s,
      groups: [...s.groups, { ...groupFormData, id: `g${Date.now()}` } as Group]
    }));
    setShowGroupForm(false);
    setGroupFormData({ name: '', permissions: [] });
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(s => ({
      ...s,
      users: [...s.users, { ...userFormData, id: `u${Date.now()}` } as User]
    }));
    setShowUserForm(false);
    setUserFormData({ username: '', password: '', displayName: '', role: UserRole.USER, groupId: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Security Center</h2>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em] mt-3">Access control and member management</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Users</button>
          <button onClick={() => setActiveTab('groups')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'groups' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Groups</button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black text-slate-800">System Members</h3>
             <button onClick={() => setShowUserForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700">+ Add Member</button>
          </div>

          {showUserForm && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl animate-in slide-in-from-top-4">
              <form onSubmit={saveUser} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <input required placeholder="Display Name" value={userFormData.displayName} onChange={e => setUserFormData({...userFormData, displayName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                  <input required placeholder="Username" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                  <input required type="password" placeholder="Password" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="space-y-4">
                   <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                     <option value={UserRole.USER}>Standard User</option>
                     <option value={UserRole.ADMIN}>Administrator</option>
                   </select>
                   <select value={userFormData.groupId} onChange={e => setUserFormData({...userFormData, groupId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                     <option value="">No Group</option>
                     {dbState.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                   </select>
                   <div className="flex gap-4 pt-2">
                     <button type="button" onClick={() => setShowUserForm(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase">Cancel</button>
                     <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100">Create User</button>
                   </div>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbState.users.map(u => (
              <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {u.displayName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 tracking-tight">{u.displayName}</h4>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">@{u.username}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span>
                   <span className="text-[10px] font-black text-slate-300 uppercase">{dbState.groups.find(g => g.id === u.groupId)?.name || 'No Group'}</span>
                </div>
                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600">Edit</button>
                  <button onClick={() => onUpdate(s => ({...s, users: s.users.filter(user => user.id !== u.id)}))} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-xl font-black text-slate-800">Permission Groups</h3>
             <button onClick={() => setShowGroupForm(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700">+ Create Group</button>
          </div>

          {showGroupForm && (
             <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl animate-in slide-in-from-top-4">
              <form onSubmit={saveGroup} className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Group Identity</label>
                  <input required placeholder="e.g. Finance Team" value={groupFormData.name} onChange={e => setGroupFormData({...groupFormData, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Grant Permissions</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.values(Permission).map(perm => {
                      const active = groupFormData.permissions?.includes(perm);
                      return (
                        <button key={perm} type="button" onClick={() => togglePermission(perm)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                          {perm.replace('MANAGE_', '').replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-50">
                   <button type="button" onClick={() => setShowGroupForm(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase">Discard</button>
                   <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-100">Initialize Group</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {dbState.groups.map(g => (
               <div key={g.id} className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                 <div className="flex justify-between items-start mb-8">
                   <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{g.name}</h4>
                   <button onClick={() => onUpdate(s => ({...s, groups: s.groups.filter(group => group.id !== g.id)}))} className="text-slate-300 hover:text-red-500 transition-colors">🗑️</button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {g.permissions.map(p => (
                     <span key={p} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.replace('MANAGE_', '').replace('_', ' ')}</span>
                   ))}
                   {g.permissions.length === 0 && <span className="text-[10px] font-black text-slate-300 italic uppercase">No Permissions Assigned</span>}
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dbState.users.filter(u => u.groupId === g.id).length} Active Members</span>
                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Update Rules</button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementScreen;
