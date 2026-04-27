import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Send, X, Users, Hash, ShieldCheck, 
  Paperclip, Smile, Info, LogOut, MoreHorizontal,
  MessageCircle, Globe, ArrowLeft
} from 'lucide-react';

const CommunityChat = ({ community, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showInfo, setShowInfo] = useState(true); 
  
  const userEmail = localStorage.getItem('user_email');
  const scrollRef = useRef(null);

  // 1. FETCH MESSAGES
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/communities/${community.id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // 2. POLLING & AUTO-SCROLL
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [community.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. SEND MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await axios.post(`http://localhost:8000/api/communities/${community.id}/message/${userEmail}`, {
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(); 
    } catch (err) { console.error("Send Error:", err); }
  };

  const handleLeaveCommunity = async () => {
    if (community.mentor_owner === userEmail) return alert("Owners cannot leave.");
    if (window.confirm("Exit this community permanently?")) {
      try {
        await axios.post(`http://localhost:8000/api/communities/${community.id}/leave/${userEmail}`);
        onClose();
        window.location.reload();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="h-screen bg-[#F0F2F5] flex overflow-hidden font-sans text-slate-900">
      
      {/* --- LEFT SIDEBAR (Standard Social Navigation) --- */}
      <aside className="hidden xl:flex w-72 flex-col p-4 bg-white border-r border-slate-200">
        
        {/* --- BACK BUTTON --- */}
        <button 
          onClick={onClose}
          className="flex items-center gap-3 p-3 w-full hover:bg-slate-100 rounded-xl transition-all mb-6 group"
        >
          <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-white" />
          </div>
          <span className="font-bold text-sm text-slate-700">Back to Ecosystem</span>
        </button>
        
        <h3 className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Context</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold text-sm">General Chat</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-xl transition-colors opacity-50 cursor-not-allowed">
            <Globe className="w-5 h-5 text-slate-500" />
            <span className="font-bold text-sm">Resources</span>
          </div>
        </div>
      </aside>

      {/* --- CENTER: MAIN FEED --- */}
      <div className="flex-1 flex flex-col h-full bg-white shadow-sm overflow-hidden">
        
        {/* HEADER */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-none truncate max-w-[150px] sm:max-w-xs">
                {community.name}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> {community.members?.length || 0} Members
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button onClick={() => setShowInfo(!showInfo)} className={`p-2 rounded-full transition-colors ${showInfo ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Info className="w-5 h-5" />
             </button>
             {/* Header Back Button for smaller screens */}
             <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-500 rounded-full">
                <X className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* MESSAGE STREAM */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F0F2F5]/30">
          <div className="flex flex-col items-center py-10">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
             </div>
             <h4 className="font-black text-slate-900 text-base">Academy Secure Channel</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Starting point of #{community.name.toLowerCase()}</p>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.sender_email === userEmail;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-300">
                    {msg.sender_name?.charAt(0)}
                  </div>
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[11px] font-bold text-slate-500 ml-1 mb-1">{msg.sender_name}</span>}
                    <div className={`px-5 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-1.5 px-1 uppercase">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INPUT AREA */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-5xl mx-auto bg-slate-100 p-2 rounded-full">
            <button type="button" className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"><Smile className="w-5 h-5" /></button>
            <input 
              type="text" 
              placeholder={`Message #${community.name.toLowerCase()}...`}
              className="flex-1 bg-transparent px-3 py-1 text-sm font-medium outline-none text-slate-800"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md">
                <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDEBAR --- */}
      {showInfo && (
        <aside className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center mb-4 border border-blue-100">
                    <Hash className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{community.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{community.category}</p>
            </div>

            <div className="space-y-8 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                <section>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">Goal</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                        {community.description || "Professional peer exchange and collective learning."}
                    </p>
                </section>

                <section>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">Admin</h4>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center font-black text-white text-xs">
                            {community.mentor_owner?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">
                                {community.mentor_owner?.split('@')[0]}
                            </p>
                            <span className="text-[9px] font-bold text-blue-600 uppercase">Founder</span>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
                <button onClick={handleLeaveCommunity} className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Leave Community
                </button>
            </div>
        </aside>
      )}
    </div>
  );
};

export default CommunityChat;