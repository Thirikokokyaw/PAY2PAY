import React, { useState, useEffect } from 'react';
import { CornerDownLeft, Reply, Bell, BellOff, Search } from 'lucide-react';

export default function SupportTicketsView({ theme, isDarkMode, tickets, setTickets }) {
  const [replyText, setReplyText] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [isNotiEnabled, setIsNotiEnabled] = useState(true);
  const [newUpdatesCount, setNewUpdatesCount] = useState(0);
  const previousTicketsLength = React.useRef(0);

  // Fetch tickets from the database
  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      const data = await response.json();
      if (response.ok) {
        const fetchedRecords = Array.isArray(data) ? data : [];
        
        if (fetchedRecords.length > previousTicketsLength.current && previousTicketsLength.current !== 0) {
          if (isNotiEnabled) {
            const addedCount = fetchedRecords.length - previousTicketsLength.current;
            setNewUpdatesCount(prev => prev + addedCount);
          }
        }
        previousTicketsLength.current = fetchedRecords.length;
        setTickets(fetchedRecords);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    const pollInterval = setInterval(fetchTickets, 15000);
    return () => clearInterval(pollInterval);
  }, [isNotiEnabled]);

  const handleBellClick = () => {
    setIsNotiEnabled(!isNotiEnabled);
    setNewUpdatesCount(0); 
  };

const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    const txnNo = ticket.txn_no ? String(ticket.txn_no).toLowerCase() : '';
    const message = ticket.user_message ? String(ticket.user_message).toLowerCase() : '';

    return txnNo.includes(searchLower) || message.includes(searchLower);
  });


  const handleSendReply = async (ticketId) => {
    if (!replyText[ticketId]?.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/reply/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText[ticketId] })
      });

      if (response.ok) {
        setReplyText(prev => ({ ...prev, [ticketId]: '' }));
        fetchTickets(); // Refresh list to reflect changes
      }
    } catch (error) {
      console.error("Error updating reply:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-extrabold uppercase ${theme.textTitle}`}>Customer Support Inbound</h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Review transfer discrepancies and transmit dispatch solutions</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by TXN No..."
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


      <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (

            <div 
              key={ticket.id} 
              className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 transition-all ${theme.card} ${ticket.status === 'Pending' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500 opacity-75'}`}
            >
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-amber-500/10 text-amber-500 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {ticket.txn_no}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{ticket.route}</span>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${ticket.status === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <p className={`text-xs font-medium pl-1 ${theme.textTitle}`}>{ticket.user_message}</p>

                {ticket.admin_reply && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs font-sans font-medium flex items-start gap-2 ${isDarkMode ? 'bg-slate-950/60 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}>
                    <CornerDownLeft size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[10px] uppercase block text-slate-400 tracking-wider">Admin Response:</span>
                      {ticket.admin_reply}
                    </div>
                  </div>
                )}
              </div>

              {ticket.status === 'Pending' && (
                <div className="md:w-72 shrink-0 flex flex-col gap-2 justify-end">
                  <input 
                    type="text" 
                    placeholder="Type reply message..." 
                    value={replyText[ticket.id] || ''} 
                    onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`} 
                  />
                  <button 
                    onClick={() => handleSendReply(ticket.id)} 
                    className="w-full py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Reply size={13} /> Dispatch Reply
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-12">
            {searchTerm ? 'No matching records found.' : 'No active customer tickets found.'}
          </p>

        )}
      </div>
    </div>
  );
}