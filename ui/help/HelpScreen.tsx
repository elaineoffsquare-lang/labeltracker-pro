
import React from 'react';

const HelpScreen: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Getting Started Guide</h2>
        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1.5">Sync data across all your devices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sync Instructions */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Linking Devices (LAN & VPN)</h3>
          <p className="text-sm text-slate-500 mb-8">Create a unified database across your devices. The first step is to clone your data, then you can link them for real-time sync (feature coming soon).</p>

          <div className="space-y-6">
            <div className="p-6 bg-blue-50/70 rounded-3xl border border-blue-100">
                <h5 className="font-bold text-blue-800 text-lg mb-2">Option A: In The Office (LAN Sync)</h5>
                <ol className="list-decimal list-inside space-y-3 text-sm text-blue-900/80">
                  <li><b>On your main (Primary) device:</b> Go to `System` and click `Export JSON` to save a backup of all your data.</li>
                  <li><b>Transfer the backup file</b> to the new device you want to set up (via email, network share, USB, etc.).</li>
                  <li><b>On the new device:</b> Open the app. It will be empty. Go to `System` and click `Import JSON`. Select the backup file. The app will reload with all your data.</li>
                  <li><b>Link for Future Syncing:</b> To prepare for real-time sync, find the Local IP Address of your Primary device (e.g., `192.168.1.XX`).</li>
                  <li><b>On the new device:</b> In `System`, select `LAN`, enter the Primary's IP address (e.g., `192.168.1.XX:3000`), and enable `Auto-Sync`.</li>
                </ol>
            </div>
            
            <div className="p-6 bg-indigo-50/70 rounded-3xl border border-indigo-100">
                <h5 className="font-bold text-indigo-800 text-lg mb-2">Option B: Remote Access (VPN Sync)</h5>
                <p className="text-sm text-indigo-900/80 mb-4">This requires a one-time setup and your own VPN software. The app does not provide the VPN service.</p>
                <ol className="list-decimal list-inside space-y-3 text-sm text-indigo-900/80">
                  <li><b>Clone Data First:</b> Follow steps 1-3 from the "LAN Sync" guide above to get your data onto the remote device.</li>
                  <li><b>Activate VPN:</b> On your remote device (e.g., your laptop at home), connect to your office network using your company's VPN client.</li>
                  <li><b>IT Setup (Port Forwarding):</b> Your office IT admin must configure the main router to forward external traffic on port `3000` to the internal IP address of your Primary Device.</li>
                  <li><b>Configure App:</b> In `System`, select `Remote via VPN` and enter your office's Public IP or domain name (e.g. `http://203.0.113.55:3000`).</li>
                </ol>
            </div>
          </div>
        </div>

        {/* Install Instructions */}
        <div className="bg-white p-10 rounded-[40px] shadow-lg shadow-slate-200/20 border border-slate-100">
           <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Install on Phone & PC</h3>
          <p className="text-sm text-slate-500 mb-8">Get a home screen icon and a full-screen experience, no app store needed.</p>

          <div className="mb-8">
            <h4 className="text-lg font-bold flex items-center mb-4"><span className="text-2xl mr-3"></span> iPhone / iOS (Safari)</h4>
            <ol className="list-decimal list-inside space-y-3 text-slate-600 font-medium">
              <li>Open this website in the <span className="font-bold">Safari</span> browser.</li>
              <li>Tap the <span className="font-bold">Share</span> button (a square with an arrow pointing up).</li>
              <li>Scroll down and tap <span className="font-bold text-blue-600">'Add to Home Screen'</span>.</li>
              <li>Confirm the name and tap 'Add'. The app icon will appear on your home screen.</li>
            </ol>
          </div>

          <div>
            <h4 className="text-lg font-bold flex items-center mb-4"><span className="text-2xl mr-3">🤖</span> Android & PC (Chrome)</h4>
            <ol className="list-decimal list-inside space-y-3 text-slate-600 font-medium">
              <li>Open this website in the <span className="font-bold">Chrome</span> browser.</li>
              <li>Look for the <span className="font-bold">Install icon</span> (a screen with a down arrow) in the address bar.</li>
              <li>Click it and then click <span className="font-bold text-blue-600">'Install'</span>.</li>
              <li>The app will be added to your desktop (PC) or home screen (Android).</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
