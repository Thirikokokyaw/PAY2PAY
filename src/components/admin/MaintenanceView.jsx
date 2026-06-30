import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export default function MaintenanceView({ 
  theme, 
  feeRate, 
  setFeeRate, 
  isPlatformOnline, 
  setIsPlatformOnline, 
  maintenanceMessage, 
  setMaintenanceMessage 
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>System Settings & Operational Control</h2>
        <p className={`text-xs mt-1 ${theme.textMuted}`}>Adjust commercial transactional rates and set public network availability gates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Global Rate Margins</h3>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Processing Fee %</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={feeRate} 
                onChange={e => setFeeRate(Number(e.target.value))} 
                className={`w-24 rounded-xl px-4 py-2 text-xs focus:outline-none ${theme.input}`} 
              />
              <span className="flex items-center text-xs font-bold text-slate-400">% Per Settlement</span>
            </div>
          </div>
        </div>

        <div className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-rose-500">Emergency Maintenance Intercept</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Platform Public Access</p>
              <p className="text-[11px] text-slate-400">Toggle user client API traffic routing availability</p>
            </div>
            <button onClick={() => setIsPlatformOnline(!isPlatformOnline)}>
              {isPlatformOnline ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-rose-500" />}
            </button>
          </div>
          {!isPlatformOnline && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] uppercase text-rose-400 font-bold mb-1.5">Public Banner Notice Message</label>
              <input 
                type="text" 
                value={maintenanceMessage} 
                onChange={e => setMaintenanceMessage(e.target.value)} 
                className={`w-full rounded-xl px-4 py-2 text-xs focus:outline-none border border-rose-500/30 ${theme.input}`} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}