import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';

export default function ChatModal({ isOpen, onClose, vendorId, vendorName, product }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Derive unique room name for Buyer & Seller pair
  const buyerId = user?.id || 0;
  const sellerId = vendorId || product?.shop_owner_id || 0;
  const roomName = buyerId < sellerId ? `${buyerId}_${sellerId}` : `${sellerId}_${buyerId}`;

  useEffect(() => {
    if (!isOpen || !user || !sellerId) return;

    // 1. Fetch initial chat history via REST API
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get(`messages/?other_user_id=${sellerId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();

    // 2. Connect to Django Channels WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//localhost:8000/ws/chat/${roomName}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to WebSocket room:', roomName);
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log('WebSocket Connection Closed');
      setIsConnected(false);
    };

    return () => {
      if (socket) socket.close();
    };
  }, [isOpen, user, sellerId, roomName]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current || !isConnected) return;

    const payload = {
      message: inputMessage.trim(),
      sender_id: user.id,
      receiver_id: sellerId,
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] transition-all">
      
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              🏪
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-emerald-600 ${isConnected ? 'bg-green-400' : 'bg-amber-400'}`}></span>
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">
              {vendorName || product?.shop_name || 'Vendor Chat'}
            </h3>
            <span className="text-[10px] text-emerald-100 flex items-center gap-1">
              {isConnected ? '● Connected live' : '○ Connecting...'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Chat"
          className="p-1 rounded-lg hover:bg-white/20 transition text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Product Highlight Banner */}
      {product && (
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
          <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
          <div className="truncate flex-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate">{product.title}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{product.price}</span>
          </div>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No messages yet. Ask the seller about product availability or delivery!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id || msg.sender === user?.id;
            return (
              <div
                key={index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-sm ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type message to seller..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-emerald-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || !isConnected}
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center shadow-md"
        >
          Send
        </button>
      </form>

    </div>
  );
}
