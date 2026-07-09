import React, { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

const BASE_URL = 'http://localhost:5000';

export default function MaintenanceView({ 
  theme, 
  feeRate, 
  setFeeRate, 
  isPlatformOnline, 
  setIsPlatformOnline, 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    async function fetchSystemSettings() {
      try {
        const response = await fetch(`${BASE_URL}/api/settings`); 
        if (response.ok) {
          const data = await response.json();
          setFeeRate(data.feeRate);
          setIsPlatformOnline(data.isPlatformOnline);
        }
      } catch (error) {
        console.error("There was an error fetching data!", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSystemSettings();
  }, [setFeeRate, setIsPlatformOnline]); 

  // 2. Update Data
  const handleUpdateSettings = async (updatedFields) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/api/settings/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error('Cannot Update!');
      }
      console.log('Data Stored Successfully!');

      // Trigger a simple native alert if feeRate was updated successfully
      if (updatedFields.feeRate !== undefined) {
        alert(`Success: Service Fee Rate has been updated to ${updatedFields.feeRate}%.`);
      }
    } catch (error) {
      console.error("There was an error when updating!", error);
      alert("Error: Failed to update settings. Please check your backend connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-slate-400" size={24} />
        <span className="ml-2 text-xs text-slate-400">Loading data..</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>System Settings & Operational Control</h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Adjust commercial transactional rates and set public network availability gates</p>
        </div>
        {isSaving && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Updating DB...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Processing Fee Section */}
        <div className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Global Rate Margins</h3>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Processing Fee %</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={feeRate} 
                onChange={e => setFeeRate(Number(e.target.value))}
                onBlur={() => handleUpdateSettings({ feeRate })} 
                className={`w-24 rounded-xl px-4 py-2 text-xs focus:outline-none ${theme.input}`} 
              />
              <span className="flex items-center text-xs font-bold text-slate-400">% Per Settlement</span>
            </div>
          </div>
        </div>

        {/* Emergency Maintenance Intercept Section */}
        <div className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-rose-500">Emergency Maintenance Intercept</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Platform Public Access</p>
              <p className="text-[11px] text-slate-400">Toggle user client API traffic routing availability</p>
            </div>
            <button onClick={() => {
              const nextState = !isPlatformOnline;
              setIsPlatformOnline(nextState);
              handleUpdateSettings({ isPlatformOnline: nextState });
            }}>
              {isPlatformOnline ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-rose-500" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}