import React, { useEffect, useState, useContext } from 'react';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { ThemeContext } from '../../App.jsx'; 
import Swal from 'sweetalert2';

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
  
  const { refreshSettings } = useContext(ThemeContext) || {};

  // 1. Fetch System Settings from rates table
  useEffect(() => {
    async function fetchSystemSettings() {
      try {
        const response = await fetch(`${BASE_URL}/api/settings`); 
        if (response.ok) {
          const data = await response.json();
          // FIX: Read the camelCase keys returned by the backend GET route
          setFeeRate(data.feeRate);
          setIsPlatformOnline(data.isPlatformOnline ? 'Y' : 'N');
        }
      } catch (error) {
        console.error("There was an error fetching data!", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSystemSettings();
  }, [setFeeRate, setIsPlatformOnline]); 

const handleToggleMaintenance = async () => {
    const nextState = isPlatformOnline === 'Y' ? 'N' : 'Y';

    const result = await Swal.fire({
      html: `
        <div class="flex flex-col items-center">            
          <h2 class="text-sm font-bold text-slate-800 m-0 mb-5">
            ${isPlatformOnline === 'Y' ? 'Lock Platform?' : 'Activate Platform?'}
          </h2>             
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: isPlatformOnline === 'Y' ? '#e11d48' : '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: isPlatformOnline === 'Y' ? 'Lock' : 'Activate',
      reverseButtons: true,
      width: '260px',
      customClass: {
        popup: '!p-4 !rounded-xl !h-auto',
        actions: '!mt-0 !mb-0 !gap-2',
        confirmButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold',
        cancelButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold'
      }
    });

    if (!result.isConfirmed) return;
    setIsPlatformOnline(nextState);
    handleUpdateSettings({ is_platform_online: nextState });
  };

  

  // 2. Submit Updates to Backend & Auto Update App State
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

      if (refreshSettings) {
        await refreshSettings();
      }

      if (updatedFields.fee_rate !== undefined) {
        alert(`Success: Service Fee Rate has been updated!.`);

      }

      if (updatedFields.is_platform_online !== undefined) {
        const message = updatedFields.is_platform_online === 'N' 
          ? 'Emergency Maintenance Activated. All user wallets set to is_active = N.' 
          : 'Maintenance Deactivated. Restored wallets (Balance < 1000 set to N, others set to Y).';
       // alert(message);
      }
    } catch (error) {
      console.error("There was an error when updating!", error);
      alert("Error: Failed to update settings. Please check your backend connection!");
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
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme?.textTitle || ''}`}>System Settings & Operational Control</h2>
          <p className={`text-xs mt-1 ${theme?.textMuted || ''}`}>Adjust commercial transactional rates and set public network availability gates</p>
        </div>
        {isSaving && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Updating DB...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Processing Fee Section */}
        <div className={`border p-6 rounded-2xl space-y-4 ${theme?.card || ''}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Create Rate</h3>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Processing Fees %</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                step="0.01"
                value={feeRate !== undefined && feeRate !== null ? feeRate : 2}
                onChange={e => setFeeRate(e.target.value)}
                onBlur={() => handleUpdateSettings({ fee_rate: parseFloat(feeRate) })} 
                className={`w-24 rounded-xl px-4 py-2 text-xs focus:outline-none ${theme?.input || ''}`} 
              />
              <span className="flex items-center text-xs font-bold text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Emergency Maintenance Intercept Section */}
        <div className={`border p-6 rounded-2xl space-y-4 ${theme?.card || ''}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-rose-500">Emergency Maintenance Intercept</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">
                Platform Status: {isPlatformOnline === 'Y' ? <span className="text-emerald-500">ONLINE</span> : <span className="text-rose-500">MAINTENANCE LOCKED</span>}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Instantly lock or activate all user wallet operations across the platform</p>
            </div>
            <button 
              disabled={isSaving}
              onClick={handleToggleMaintenance} 
              className="focus:outline-none disabled:opacity-50"
            >
              {isPlatformOnline === 'Y' ? (
                <ToggleRight size={32} className="text-emerald-500" />
              ) : (
                <ToggleLeft size={32} className="text-rose-500" />
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}