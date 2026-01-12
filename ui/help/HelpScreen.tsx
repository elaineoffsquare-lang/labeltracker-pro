
import React from 'react';

const HelpScreen: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Getting Started Guide</h2>
        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1.5">Use LabelTracker Pro like a native app on your phone</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Install Instructions */}
        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Install on Your Phone & PC</h3>
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

        {/* Data Storage Explanation */}
        <div className="bg-white p-10 rounded-[40px] shadow-lg shadow-slate-200/20 border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">How Your Data is Linked</h3>
          <p className="text-sm text-slate-500 mb-8">Understand how your inventory information is saved and synced.</p>
          
          <div className="space-y-6">
              <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1">📱</div>
                  <div>
                      <h5 className="font-bold text-slate-700">Local-First Storage</h5>
                      <p className="text-slate-600 text-sm">All data you enter is saved directly and securely on your current device (e.g., your phone). This makes the app very fast and usable even without an internet connection.</p>
                  </div>
              </div>
              <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1">🔄</div>
                  <div>
                      <h5 className="font-bold text-slate-700">Manual Syncing</h5>
                      <p className="text-slate-600 text-sm">The data on your phone is <span className="font-bold">separate</span> from the data on your PC. They do not sync automatically in the background.</p>
                  </div>
              </div>
              <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1">⚙️</div>
                  <div>
                      <h5 className="font-bold text-slate-700">How to Link Devices</h5>
                      <p className="text-slate-600 text-sm">To share one database, you must set up a central server on your office PC and use the <span className="font-bold">System {'>'} Internal Network Link</span> feature on your other devices (like your phone) to connect to it. This is an advanced setup for multi-user environments.</p>
                  </div>
              </div>
              <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1">📤</div>
                  <div>
                      <h5 className="font-bold text-slate-700">Backup Your Data</h5>
                      <p className="text-slate-600 text-sm">You can download a full backup of your device's data at any time. Go to the <span className="font-bold">System</span> tab and click <span className="font-bold text-emerald-600">'Export to JSON'</span>.</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
