import React, { useState, useEffect } from 'react';
import { Check, X, Bell, Loader2, RefreshCw } from 'lucide-react'; 

export default function VerificationView({ theme, transactions, setTransactions }) {
  const [loadingId, setLoadingId] = useState(null);
  const [fetching, setFetching] = useState(false);

  // ─── ၁။ DATABASE မှ PENDING ဖြစ်နေသော TRANSACTION များ ဆွဲထုတ်ခြင်း ───
  const fetchPendingTransactions = async () => {
    setFetching(true);
    try {
      // မှတ်ချက်- သင်၏ API configurations အလိုက် လမ်းကြောင်းကို လိုအပ်သလို ပြောင်းလဲနိုင်သည်
      const response = await fetch('http://localhost:5000/api/admin/pending-transactions');
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions || data); 
      }
    } catch (error) {
      console.error("Database fetch failed:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  // ─── ၂။ APPROVE သို့မဟုတ် CANCEL ACTION များ လုပ်ဆောင်ခြင်း ───
  const handleVerifyTxn = async (txn, action) => {
    const transactionId = txn.id || txn.txn_id; 
    setLoadingId(transactionId);

    try {
      if (action === 'approve') {
        // Backend ရှိ /api/admin/approve-transaction endpoint သို့ ချိတ်ဆက်ခြင်း
        const response = await fetch('http://localhost:5000/api/admin/approve-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: transactionId,
            toWallet: txn.to_wallet // COBOL ဘက်က ပစ်မှတ် Wallet ထဲမှ လက်ခံမည့် amount ကို လျှော့ချ/ညှိနှိုင်းရန်
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setTransactions(prev => 
            prev.map(t => (t.id === transactionId || t.txn_id === transactionId) ? { ...t, status: '1' } : t)
          );
          alert(data.message || 'Transaction approved and funds settled via COBOL!');
        } else {
          alert(`Approval Error: ${data.message || 'Failed to process'}`);
        }

      } else {
        // Backend ရှိ /api/admin/cancel-transaction endpoint သို့ တိုက်ရိုက်ချိတ်ဆက်ခြင်း
        const response = await fetch('http://localhost:5000/api/admin/cancel-transaction', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transactionId: transactionId 
          }) 
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setTransactions(prev => 
            prev.map(t => (t.id === transactionId || t.txn_id === transactionId) ? { ...t, status: '2' } : t)
          );
          alert(data.message || 'Transaction cancelled. Ledger state correctly adjusted back.');
        } else {
          alert(`Cancellation Error: ${data.message || 'Failed to cancel transaction'}`);
        }
      }
    } catch (error) {
      console.error("Verification processing failed:", error);
      alert("Server Connection Terminal Error.");
    } finally {
      setLoadingId(null);
    }
  };

  // Status '0' (Pending) များကိုသာ စစ်ဆေးရန် စစ်ထုတ်ခြင်း
  const pendingTransactions = transactions.filter(t => t.status === '0' || t.status === 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className={`text-xl font-extrabold uppercase ${theme.textTitle}`}>Voucher Auditing Desk</h2>
          <button 
            onClick={fetchPendingTransactions} 
            disabled={fetching}
            className="p-1.5 rounded-lg border hover:bg-slate-500/10 transition-colors"
          >
            <RefreshCw size={14} className={`${fetching ? 'animate-spin' : ''} ${theme.textTitle}`} />
          </button>
        </div>
        
        <button className={`p-2 rounded-xl border relative transition-colors ${theme.tableBg} hover:opacity-80`}>
          <Bell size={20} className={theme.textTitle} />
          {pendingTransactions.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className={`font-extrabold border-b uppercase ${theme.th}`}>
                <th className="p-2 sm:p-4">Customer Network</th>
                <th className="p-2 sm:p-4 text-amber-500">Route & Txn Code</th>
                <th className="p-2 sm:p-4">Send / Receive Amount</th>
                <th className="p-2 sm:p-4 text-right">Verification Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fetching ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center font-bold text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> ဇယားအချက်အလက်များရယူနေသည်...
                    </div>
                  </td>
                </tr>
              ) : pendingTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center font-bold text-slate-400">
                    No pending vouchers to review.
                  </td>
                </tr>
              ) : (
                pendingTransactions.map(txn => {
                  const currentId = txn.id || txn.txn_id;
                  const sendAmt = txn.send_amount || txn.amount || 0;
                  const receiveAmt = txn.receive_amount || (sendAmt * 0.98);

                  return (
                    <tr key={currentId} className="font-medium">
                      <td className="p-2 sm:p-4">
                        <p className={`font-bold ${theme.textTitle}`}>{txn.sender_name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">From: {txn.sender_phone}</p>
                        {txn.receiver_phone && (
                          <p className="text-[11px] text-slate-400 font-mono">To: {txn.receiver_name} ({txn.receiver_phone})</p>
                        )}
                      </td>
                      <td className="p-2 sm:p-4">
                        <span className="px-2 py-0.5 text-[10px] rounded-md font-bold bg-slate-500/10 text-slate-400 mr-2">
                          {txn.from_wallet || 'ANY'} ➔ {txn.to_wallet || 'ANY'}
                        </span>
                        <span className="font-mono font-bold text-amber-500 bg-amber-500/5 px-2 py-1 rounded">
                          {txn.txn_id_tail || txn.code}
                        </span>
                        {txn.created_at && <p className="text-[10px] text-slate-400 mt-1">{txn.created_at}</p>}
                      </td>
                      <td className="p-2 sm:p-4">
                        <p className={`font-bold ${theme.textTitle}`}>{Number(sendAmt).toLocaleString()} MMK (Sent)</p>
                        <p className="text-[11px] text-emerald-500 font-semibold">{Number(receiveAmt).toLocaleString()} MMK (Net Recv)</p>
                      </td>
                      <td className="p-2 sm:p-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                        {loadingId === currentId ? (
                          <div className="inline-flex items-center gap-1 text-slate-400 font-bold px-4 py-1.5">
                            <Loader2 size={14} className="animate-spin" /> Processing...
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleVerifyTxn(txn, 'reject')} 
                              className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-500 hover:text-white px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all"
                            >
                              <X size={14} /> <span className="hidden sm:inline">Cancel / Reject</span>
                            </button>
                            <button 
                              onClick={() => handleVerifyTxn(txn, 'approve')} 
                              className="bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-600 hover:text-white px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                            >
                              <Check size={14} /> <span className="hidden sm:inline">Approve Ledger</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}