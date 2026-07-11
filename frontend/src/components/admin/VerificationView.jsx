import React, { useState, useEffect, useRef } from 'react';
import { Check, X, RefreshCw, AlertCircle, Search, Calendar, Bell, BellOff } from 'lucide-react';

export default function VerificationView({ theme }) {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Batch tracking and notification configurations
  const [selectedIds, setSelectedIds] = useState([]);
  const [isNotiEnabled, setIsNotiEnabled] = useState(true);
  const [newUpdatesCount, setNewUpdatesCount] = useState(0);
  const previousTxnLength = useRef(0);

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'approve', 'cancel', 'bulkApprove'
    targetId: null,
    targetWallet: null,
    message: ''
  });

  // Fetch pending records from API pipeline 
  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/pending-transactions'); 
      const data = await response.json();
      if (response.ok) {
        const fetchedRecords = Array.isArray(data) ? data : [];
        
        // Trigger notification count if new entries populate and notifications are turned ON
        if (fetchedRecords.length > previousTxnLength.current && previousTxnLength.current !== 0) {
          if (isNotiEnabled) {
            const addedCount = fetchedRecords.length - previousTxnLength.current;
            setNewUpdatesCount(prev => prev + addedCount);
          }
        }
        
        previousTxnLength.current = fetchedRecords.length;
        setTransactions(fetchedRecords);
      } else {
        showFeedback('error', 'Failed to pull ledger queue records.');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showFeedback('error', 'Server connection failure. Please check backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();
    
    // Auto-polling cycle every 30 seconds to catch incoming items dynamically
    const pollInterval = setInterval(fetchPendingTransactions, 30000);
    return () => clearInterval(pollInterval);
  }, [isNotiEnabled]);

  const showFeedback = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Checkbox state managers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentFilteredIds = filteredTransactions.map(t => t.txn_id);
      setSelectedIds(currentFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (txnId) => {
    setSelectedIds(prev => 
      prev.includes(txnId) ? prev.filter(id => id !== txnId) : [...prev, txnId]
    );
  };

  // Custom Modal Trigger Handlers
  const triggerBulkApproveModal = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'bulkApprove',
      targetId: null,
      targetWallet: null,
      message: `Are you sure you want to APPROVE ${selectedIds.length} selected transactions?`
    });
  };

  const triggerApproveModal = (txnId, toWallet) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      targetId: txnId,
      targetWallet: toWallet,
      message: `Are you sure you want to APPROVE transaction #${txnId}?`
    });
  };

  const triggerCancelModal = (txnId) => {
    setConfirmModal({
      isOpen: true,
      type: 'cancel',
      targetId: txnId,
      targetWallet: null,
      message: `Are you sure you want to CANCEL transaction #${txnId}?`
    });
  };

  const closeModal = () => {
    setConfirmModal({ isOpen: false, type: '', targetId: null, targetWallet: null, message: '' });
  };

  // Executions after confirmation
  const handleModalConfirm = () => {
    const { type, targetId, targetWallet } = confirmModal;
    closeModal();

    if (type === 'bulkApprove') {
      executeBulkApprove();
    } else if (type === 'approve') {
      executeApprove(targetId, targetWallet);
    } else if (type === 'cancel') {
      executeCancel(targetId);
    }
  };

  // Bulk processing request engine
  const executeBulkApprove = async () => {
    setActionLoading('bulk');
    let successfulApprovals = 0;

    try {
      for (const id of selectedIds) {
        const matchingTxn = transactions.find(t => t.txn_id === id);
        if (!matchingTxn) continue;

        const response = await fetch('http://localhost:5000/api/admin/approve-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: id, toWallet: matchingTxn.to_wallet })
        });
        const result = await response.json();
        if (result.success) successfulApprovals++;
      }

      showFeedback('success', `Successfully processed ${successfulApprovals} batch allocations.`);
      setTransactions(prev => prev.filter(t => !selectedIds.includes(t.txn_id)));
      setSelectedIds([]);
    } catch (error) {
      showFeedback('error', 'An error occurred during multi-record verification processing.');
    } finally {
      setActionLoading(null);
    }
  };

  const executeApprove = async (txnId, toWallet) => {
    setActionLoading(txnId);
    try {
      const response = await fetch('http://localhost:5000/api/admin/approve-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txnId, toWallet: toWallet })
      });
      const result = await response.json();

      if (result.success) {
        showFeedback('success', result.message);
        setTransactions(prev => prev.filter(t => String(t.txn_id) !== String(txnId)));
        setSelectedIds(prev => prev.filter(id => id !== txnId));
      } else {
        showFeedback('error', result.message);
      }
    } catch (error) {
      showFeedback('error', 'Internal Server Error.');
    } finally {
      setActionLoading(null);
    }
  };

  const executeCancel = async (txnId) => {
    setActionLoading(txnId);
    try {
      const response = await fetch('http://localhost:5000/api/admin/cancel-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txnId })
      });
      const result = await response.json();

      if (result.success) {
        showFeedback('success', result.message);
        setTransactions(prev => prev.filter(t => String(t.txn_id) !== String(txnId)));
        setSelectedIds(prev => prev.filter(id => id !== txnId));
      } else {
        showFeedback('error', result.message);
      }
    } catch (error) {
      showFeedback('error', 'Internal Server Error.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    const txnId = txn.txn_id ? String(txn.txn_id).toLowerCase() : '';
    const tail = txn.txn_id_tail ? String(txn.txn_id_tail).toLowerCase() : '';
    const sName = txn.sender_name ? String(txn.sender_name).toLowerCase() : '';
    const sPhone = txn.sender_phone ? String(txn.sender_phone) : '';
    const rName = txn.receiver_name ? String(txn.receiver_name).toLowerCase() : '';
    const rPhone = txn.receiver_phone ? String(txn.receiver_phone) : '';
    const fromW = txn.from_wallet ? String(txn.from_wallet).toLowerCase() : '';
    const toW = txn.to_wallet ? String(txn.to_wallet).toLowerCase() : '';

    return (
      txnId.includes(searchLower) ||
      tail.includes(searchLower) ||
      sName.includes(searchLower) ||
      sPhone.includes(searchLower) ||
      rName.includes(searchLower) ||
      rPhone.includes(searchLower) ||
      fromW.includes(searchLower) ||
      toW.includes(searchLower)
    );
  });

  const handleBellClick = () => {
    setIsNotiEnabled(!isNotiEnabled);
    setNewUpdatesCount(0); 
  };

  return (
    <div className="space-y-6 relative">
      
      {/* COMPACT & CENTERED CONFIRMATION POPUP MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 animate-fadeIn">
          <div className={`w-full max-w-xs p-5 rounded-2xl border shadow-2xl text-center transform transition-all ${
            theme.sidebar === 'bg-white border-slate-200 text-slate-900' 
              ? 'bg-white border-slate-200 text-slate-800' 
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            
            <p className="text-xs font-semibold mb-5 opacity-95 leading-relaxed px-1">
              {confirmModal.message}
            </p>
            
            <div className="flex items-center justify-center gap-3 text-xs">
              <button
                onClick={closeModal}
                className={`px-4 py-2 font-bold rounded-xl border transition-all active:scale-95 ${
                  theme.sidebar === 'bg-white border-slate-200 text-slate-900'
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className={`px-4 py-2 font-bold rounded-xl transition-all active:scale-95 ${
                  confirmModal.type === 'cancel'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/10'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Control Segment */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>
            Transaction Verification
          </h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Review the pending transaction details</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search Txn ID, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full text-xs pl-9 pr-12 py-2.5 rounded-xl border outline-none font-medium transition-all ${
                theme.sidebar === 'bg-white border-slate-200 text-slate-900' 
                  ? 'bg-white border-slate-200 focus:border-amber-500 text-slate-800 shadow-sm' 
                  : 'bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-100'
              }`}
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={handleBellClick}
            className={`relative p-2.5 rounded-xl border transition-all duration-300 focus:outline-none flex items-center justify-center shrink-0 ${
              isNotiEnabled && newUpdatesCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-bounce' 
                : theme.sidebar === 'bg-white border-slate-200 text-slate-900'
                  ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={isNotiEnabled ? `Notifications Enabled: ${newUpdatesCount} new items` : "Notifications Disabled"}
          >
            {isNotiEnabled ? <Bell size={16} /> : <BellOff size={16} className="text-rose-400/80" />}
            
            {isNotiEnabled && newUpdatesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950 shadow-sm">
                {newUpdatesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bulk Processing Ribbon Layer */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <span className="font-bold text-amber-500">Selected {selectedIds.length} item(s)</span>
          <button
            onClick={triggerBulkApproveModal}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
          >
            {actionLoading === 'bulk' ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} strokeWidth={3} />}
            Approve Selected
          </button>
        </div>
      )}

      <hr className={theme.sidebar === 'bg-white border-slate-200 text-slate-900' ? 'border-slate-200' : 'border-slate-800'} />

      {/* Toast Prompts */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      {/* Main Table Layout */}
      <div className={`overflow-x-auto rounded-xl border max-h-[440px] overflow-y-auto ${theme.sidebar === 'bg-white border-slate-200 text-slate-900' ? 'border-slate-200 shadow-sm' : 'border-slate-800'}`}>
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className={`border-b font-bold select-none ${theme.sidebar === 'bg-white border-slate-200 text-slate-900' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                  className="rounded border-slate-300 accent-amber-500 scale-110 cursor-pointer"
                />
              </th>
              <th className="p-4">Txn ID</th>
              <th className="p-4">Sender (From Account)</th>
              <th className="p-4">Receiver (To Account)</th>
              <th className="p-4 text-right">Send Amount</th>
              <th className="p-4 text-right">Receive Amount</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-12 text-center font-bold text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-amber-500" />
                    Querying real-time ledger pipeline data...
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center font-bold text-slate-400">
                  {searchTerm ? 'No matching records found.' : 'No pending transactions currently.'}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn.txn_id} className={`border-b last:border-0 transition-colors ${theme.sidebar === 'bg-white border-slate-200 text-slate-900' ? 'border-slate-100 hover:bg-slate-50/50' : 'border-slate-800/60 hover:bg-slate-900/30'} ${selectedIds.includes(txn.txn_id) ? 'bg-amber-500/5' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(txn.txn_id)}
                      onChange={() => handleSelectRow(txn.txn_id)}
                      className="rounded border-slate-300 accent-amber-500 scale-110 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-mono font-bold">
                    <div className="font-bold">#{txn.txn_id}</div>
                    <div className="text-[10px] text-amber-500 mt-0.5">Tail: {txn.txn_id_tail}</div>
                    <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-1 font-sans font-normal">
                      <Calendar size={10} /> {txn.created_at ? new Date(txn.created_at).toLocaleString() : 'N/A'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{txn.sender_name || 'Anonymous'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{txn.sender_phone || 'No Phone'}</div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-400 font-black rounded text-[10px] tracking-wide">{txn.from_wallet}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{txn.receiver_name || 'Anonymous'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{txn.receiver_phone || 'No Phone'}</div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-purple-500/10 text-purple-400 font-black rounded text-[10px] tracking-wide">{txn.to_wallet}</span>
                  </td>
                  <td className="p-4 text-right font-black text-rose-400 text-sm font-mono">
                    {txn.send_amount ? Number(txn.send_amount).toLocaleString() : '0'}
                  </td>
                  <td className="p-4 text-right font-black text-emerald-400 text-sm font-mono">
                    {txn.receive_amount ? Number(txn.receive_amount).toLocaleString() : '0'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/10 animate-pulse tracking-wider">PENDING</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => triggerApproveModal(txn.txn_id, txn.to_wallet)}
                        disabled={actionLoading !== null}
                        className="p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-emerald-500/10"
                        title="Approve & Execute Core Settlement"
                      >
                        {actionLoading === txn.txn_id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                      </button>
                      <button
                        onClick={() => triggerCancelModal(txn.txn_id)}
                        disabled={actionLoading !== null}
                        className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-400 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-rose-500/10"
                        title="Reject & Revert Funds to Source"
                      >
                        {actionLoading === txn.txn_id ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}