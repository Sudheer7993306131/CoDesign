import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, X, User } from 'lucide-react';

const ChatWindow = ({ mentor, userEmail, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  // 1. Fetch Chat History
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/history/${userEmail}/${mentor.email}`
      );
      setMessages(response.data);
    } catch (err) {
      console.error("Chat fetch error:", err);
    }
  };

  // 2. Set up Polling (Auto-refresh every 3 seconds)
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [mentor.email]);

  // 3. Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Logic
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`http://localhost:8000/api/chat/send/${userEmail}`, {
        receiver_email: mentor.email,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(); // Refresh immediately after sending
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white shadow-2xl rounded-3xl flex flex-col border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center text-xs font-bold">
            {mentor.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm leading-none">{mentor.name}</p>
            <p className="text-[10px] text-indigo-200 uppercase mt-1 tracking-wider">Active Mentor</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-indigo-500 p-1 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender_email === userEmail ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
              msg.sender_email === userEmail 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button 
          type="submit"
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;