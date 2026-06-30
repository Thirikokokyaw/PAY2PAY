import React from 'react';
import { Check, X } from 'lucide-react';

export default function VerificationView({ theme, transactions, setTransactions }) {
  const handleVerifyTxn = (id, action) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'Success' : 'Rejected' } : t));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className={`text-xl font-extrabold uppercase ${theme.textTitle}`}>Voucher Auditing Desk</h2>

      <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className={`font-extrabold border-b uppercase ${theme.th}`}>
                <th className="p-2 sm:p-4">Customer Network</th>
                <th className="p-2 sm:p-4 text-amber-500">Txn Code</th>
                <th className="p-2 sm:p-4">Amount</th>
                <th className="p-2 sm:p-4 text-right">Verification Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.filter(t => t.status === 'Pending').map(txn => (
                <tr key={txn.id} className="font-medium">
                  <td className="p-2 sm:p-4">
                    <p className={`font-bold ${theme.textTitle}`}>{txn.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{txn.phone}</p>
                  </td>
                  <td className="p-2 sm:p-4 font-mono font-bold text-amber-500 bg-amber-500/5">{txn.code}</td>
                  <td className={`p-2 sm:p-4 font-bold ${theme.textTitle}`}>{txn.amount.toLocaleString()} MMK</td>
                  <td className="p-2 sm:p-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                    <button onClick={() => handleVerifyTxn(txn.id, 'reject')} className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-500 hover:text-white px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                      <X size={14} /> <span className="hidden sm:inline">Reject</span>
                    </button>
                    <button onClick={() => handleVerifyTxn(txn.id, 'approve')} className="bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-600 hover:text-white px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                      <Check size={14} /> <span className="hidden sm:inline">Approve</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}