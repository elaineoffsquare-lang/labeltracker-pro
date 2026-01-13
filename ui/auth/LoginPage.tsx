
import React, { useState } from 'react';
import { db } from '../../services/db';
import { User } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const database = db.get();
    const foundUser = database.users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-900/20 mb-4">LT</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase text-center leading-none">LABELTRACKER<br/><span className="text-blue-600 not-italic">PRO</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-4">Multi-Node Authentication</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Network ID (Username)</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Access Key (Password)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-pulse">{error}</p>}

            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Verify & Link Node
            </button>
            
            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={() => db.reset()}
                className="text-[9px] text-slate-300 font-bold uppercase tracking-widest hover:text-red-400 transition-colors"
              >
                Lost access? Reset entire node
              </button>
            </div>
          </form>
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Database Node Online</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
