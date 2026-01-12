
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
          <p className="text-sm text-slate-500 mb-8">Create a unified database across your devices, whether in the office or remote.</p>

          <div className="space-y-6">
            <div className="p-6 bg-blue-50/70 rounded-3xl border border-blue-100">
                <h5 className="font-bold text-blue-800 text-lg mb-2">Option A: In The Office (LAN Sync)</h5>
                <ol className="list-decimal list-inside space-y-3 text-sm text-blue-900/80">
                  <li><b>Choose Primary Device:</b> Designate one office PC as your "main" server.</li>
                  <li><b>Find Its Local IP:</b> On that PC, find its IP Address (e.g., `192.168.1.XX`) in network settings.</li>
                  <li><b>Connect Other Devices:</b> On your other devices (on the same Wi-Fi), go to `System`, select `Local Network (LAN)`, and enter the Primary's IP, adding `:3000` at the end.</li>
                  <li><b>Enable Auto-Sync:</b> Toggle on for automatic data updates.</li>
                </ol>
            </div>
            
            <div className="p-6 bg-indigo-50/70 rounded-3xl border border-indigo-100">
                <h5 className="font-bold text-indigo-800 text-lg mb-2">Option B: Remote Access (VPN Sync)</h5>
                <p className="text-sm text-indigo-900/80 mb-4">This requires a one-time setup and your own VPN software. The app does not provide the VPN service.</p>
                <ol className="list-decimal list-inside space-y-3 text-sm text-indigo-900/80">
                  <li><b>Activate VPN:</b> On your remote device (e.g., your laptop at home), connect to your office network using your company's VPN client (like Cisco AnyConnect, OpenVPN, etc).</li>
                  <li><b>IT Setup (Port Forwarding):</b> Your office IT admin must configure the main router to forward external traffic on port `3000` to the internal IP address of your Primary Device. This is a crucial step to allow access from outside.</li>
                  <li><b>Find Public IP:</b> Get your office's Public IP address (your IT admin will have this, or you can Google "what is my IP" from the Primary Device).</li>
                  <li><b>Configure App:</b> In `System`, select `Remote via VPN` and enter the Public IP or domain name (e.g. `http://203.0.113.55:3000`).</li>
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
