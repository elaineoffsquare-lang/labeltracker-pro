
import React from 'react';

const LiveAssistantScreen: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-dashed border-slate-200 rounded-[60px] p-20 text-center">
        <div className="text-8xl mb-10 grayscale opacity-20">🎙️</div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Live Assistant Coming Soon</h3>
        <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">Real-time voice commands and inventory queries.</p>
      </div>
    </div>
  );
};

export default LiveAssistantScreen;
