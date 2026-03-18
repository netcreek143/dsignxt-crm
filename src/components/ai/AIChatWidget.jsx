import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Bot, User, RefreshCcw } from 'lucide-react';
import useStore from '../../data/store';

export default function AIChatWidget() {
    const { aiMessages, sendAiChat, isAiLoading, clearAiChat, currentUser, clients } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);
    const scrollRef = useRef(null);

    // Only show if user has permission (internal) or if enabled for client
    const isClient = currentUser?.role === 'client';
    const client = isClient ? clients.find(c => c.id === currentUser.clientId) : null;
    const isEnabled = !isClient || (client && client.aiChatEnabled);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [aiMessages]);

    if (!isEnabled) return null;

    const handleSend = () => {
        if (!input.trim() || isAiLoading) return;
        sendAiChat(input);
        setInput('');
    };

    return (
        <div className={`ai-chat-widget ${isOpen ? 'open' : ''} ${isMaximized ? 'maximized' : ''}`}>
            {!isOpen ? (
                <button className="ai-chat-trigger shadow-lg" onClick={() => setIsOpen(true)}>
                    <Sparkles className="sparkle-icon" size={20} />
                    <span className="text-white font-bold ml-2">Ask DSignXT AI</span>
                </button>
            ) : (
                <div className="ai-chat-container">
                    <div className="ai-chat-header" style={{ background: '#1e1b4b', color: 'white' }}>
                        <div className="ai-header-info">
                            <div className="ai-avatar-glow" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                                <Bot size={24} color="white" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-black text-base leading-none tracking-tight" style={{ color: 'white' }}>DSignXT AI</h3>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]"></div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: 'rgba(255,255,255,0.8)' }}>Online Assistant</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-all text-white/90 hover:text-white" title="Clear Chat" onClick={(e) => { e.stopPropagation(); clearAiChat(); }}>
                                <RefreshCcw size={18} />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-all text-white/90 hover:text-white" title={isMaximized ? "Minimize" : "Maximize"} onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}>
                                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center hover:bg-red-500 rounded-full transition-all text-white/90 hover:text-white" title="Close" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="ai-chat-messages" ref={scrollRef}>
                        {aiMessages.length === 0 && (
                            <div className="ai-welcome">
                                <div className="ai-welcome-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                    <Sparkles size={36} />
                                </div>
                                <h4 className="text-white font-black text-2xl mb-4 tracking-tighter">AI Inteligencia</h4>
                                <p className="text-white/40 text-sm leading-8 max-w-[300px] mx-auto font-medium">
                                    Analyze your leads, summarize your pipeline, and find your next hot prospect instantly.
                                </p>
                                <div className="mt-10 flex flex-wrap justify-center gap-2">
                                    {['Summarize my leads', 'Top prospects?', 'Recent activity'].map(s => (
                                        <button key={s} onClick={() => sendAiChat(s)} className="bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-8">
                            {aiMessages.map((m, i) => (
                                <div key={i} className={`ai-msg-group ${m.role === 'user' ? 'user' : 'bot'}`}>
                                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                                        m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/60 border border-white/10'
                                    }`}>
                                        {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className="ai-bubble p-4 text-[15px] leading-relaxed">
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isAiLoading && (
                                <div className="ai-msg-group bot">
                                    <div className="w-9 h-9 rounded-2xl bg-white/10 text-white/60 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={16} />
                                    </div>
                                    <div className="ai-bubble flex items-center gap-3 italic text-white/30 text-sm">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ai-input-area" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                        <div className="ai-input-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '8px' }}>
                            <input 
                                className="ai-input-field flex-1"
                                placeholder={isAiLoading ? "Processing..." : "Message DSignXT AI..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                style={{ background: 'transparent', color: 'white', border: 'none', padding: '12px 18px', outline: 'none' }}
                                disabled={isAiLoading}
                            />
                            <button 
                                className="ai-send-btn w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30"
                                onClick={handleSend}
                                disabled={!input.trim() || isAiLoading}
                                style={{ background: '#6366f1', color: 'white', border: 'none' }}
                            >
                                {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
