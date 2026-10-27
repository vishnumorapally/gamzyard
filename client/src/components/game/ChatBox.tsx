// client/src/components/game/ChatBox.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, Smile, ShieldAlert } from 'lucide-react';
import { ChatMessage, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { DEFAULT_AVATARS } from '../../services/storage';

interface ChatBoxProps {
  multiplayerData: MultiplayerMatchData | null;
}

const QUICK_REACTIONS = [
  { label: '🔥 Fire', text: '🔥' },
  { label: 'GG', text: 'GG!' },
  { label: '🧠 200 IQ', text: '🧠' },
  { label: '💀 RIP', text: '💀' },
  { label: '👏 Nice', text: '👏' },
  { label: '⚡ Hype', text: '⚡' },
  { label: '🎯 Bullseye', text: '🎯' },
  { label: '😮 Wow', text: '😮' },
  { label: '😂 LOL', text: '😂' },
  { label: 'GLHF', text: 'Good luck! 🍀' }
];

export const ChatBox: React.FC<ChatBoxProps> = ({ multiplayerData }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastSnippet, setLastSnippet] = useState<{ sender: string; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const snippetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getAvatarEmoji = (avatarId?: string) => {
    if (!avatarId) return '🎮';
    const found = DEFAULT_AVATARS.find(a => a.id === avatarId);
    return found ? found.emoji : avatarId.length <= 2 ? avatarId : '🎮';
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!multiplayerData) return;

    const socket = getSocket();

    const handleChat = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      sound.play('chat');

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);

        // Show floating quick-snippet notification when chat is closed
        const isMe = msg.senderId === multiplayerData.you.socketId;
        if (!isMe) {
          setLastSnippet({ sender: msg.senderName, text: msg.text });
          if (snippetTimerRef.current) clearTimeout(snippetTimerRef.current);
          snippetTimerRef.current = setTimeout(() => {
            setLastSnippet(null);
          }, 4500);
        }
      }
    };

    socket.on('chat_message', handleChat);

    return () => {
      socket.off('chat_message', handleChat);
      if (snippetTimerRef.current) clearTimeout(snippetTimerRef.current);
    };
  }, [multiplayerData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setLastSnippet(null);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!multiplayerData) return null;

  const opponentEmoji = getAvatarEmoji(multiplayerData.opponent.avatar);
  const myEmoji = getAvatarEmoji(multiplayerData.you.avatar);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const socket = getSocket();
    socket.emit('send_chat', {
      roomId: multiplayerData.roomId,
      text: text.trim()
    });
    setInputVal('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputVal);
  };

  return (
    <>
      {/* Floating Preview Snippet Toast (When chat is closed) */}
      {!isOpen && lastSnippet && (
        <div
          onClick={() => {
            setIsOpen(true);
            sound.play('click');
          }}
          className="fixed bottom-20 right-4 z-40 max-w-xs bg-gray-900/95 border border-purple-500/50 backdrop-blur-xl p-2.5 rounded-2xl shadow-2xl shadow-purple-950/60 animate-bounce cursor-pointer flex items-center space-x-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-sm shrink-0">
            {opponentEmoji}
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider truncate">
              {lastSnippet.sender}
            </p>
            <p className="text-xs font-semibold text-gray-200 truncate">
              {lastSnippet.text}
            </p>
          </div>
        </div>
      )}

      {/* Modern Floating Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          sound.play('click');
        }}
        className="fixed bottom-4 right-4 z-40 group flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl shadow-purple-900/60 ring-2 ring-purple-400/30 hover:ring-purple-400/80 active:scale-95 transition-all cursor-pointer"
        aria-label="Toggle Live Game Chat"
        title="Live Match Chat"
      >
        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />

        {/* Unread Message Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg shadow-rose-950/80 border-2 border-gray-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Cyber Glass In-Game Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[330px] sm:w-[360px] max-w-[calc(100vw-1.5rem)] h-[440px] bg-[#0c1021]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/80 flex flex-col overflow-hidden animate-fade-in select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-gradient-to-r from-gray-950 via-purple-950/40 to-gray-950 border-b border-purple-500/20">
            <div className="flex items-center space-x-2.5">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-white tracking-wider uppercase">
                    Match Chat
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <span>vs</span>
                  <span className="font-bold text-gray-200">
                    {opponentEmoji} {multiplayerData.opponent.name}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                sound.play('click');
              }}
              className="p-1.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-all cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Reaction Pills Carousel */}
          <div className="px-2.5 py-2 bg-gray-950/60 border-b border-purple-500/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_REACTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sendMessage(item.text);
                  sound.play('click');
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-gray-900/90 hover:bg-purple-950/80 hover:border-purple-500/50 border border-gray-800 text-[11px] font-bold text-gray-300 hover:text-purple-200 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs select-text">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-2xl mb-2 text-purple-400">
                  💬
                </div>
                <p className="text-xs font-bold text-gray-300">No messages yet</p>
                <p className="text-[11px] text-gray-500 mt-1 max-w-[200px]">
                  Break the ice! Send a reaction or message your opponent.
                </p>
              </div>
            ) : (
              messages.map(m => {
                const isMe = m.senderId === multiplayerData.you.socketId;
                const senderAvatar = isMe ? myEmoji : opponentEmoji;

                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* User Avatar Badge */}
                    <div className="w-6 h-6 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-xs shrink-0 select-none shadow-sm mb-0.5">
                      {senderAvatar}
                    </div>

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[78%]`}>
                      {/* Sender Name & Time */}
                      <div className="flex items-center space-x-1.5 px-1 mb-0.5 text-[9px] text-gray-400 select-none">
                        <span className={isMe ? 'text-purple-300 font-bold' : 'text-cyan-300 font-bold'}>
                          {isMe ? 'You' : m.senderName}
                        </span>
                        <span>•</span>
                        <span>{formatTime(m.timestamp)}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs break-words shadow-md leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-tr-xs border border-purple-400/30'
                            : 'bg-[#181d33] text-gray-100 rounded-tl-xs border border-white/10'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-gray-950/90 border-t border-purple-500/20 flex items-center space-x-2"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={`Chat with ${multiplayerData.opponent.name}...`}
                maxLength={120}
                className="w-full px-3.5 py-2 bg-gray-900/90 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-purple-900/40 active:scale-95 transition-all cursor-pointer"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
