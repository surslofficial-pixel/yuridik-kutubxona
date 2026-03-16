import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Bot, User, Send, BookOpen, Library, Search, BookMarked, Loader2, ArrowLeft } from "lucide-react"

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const quickPrompts = [
    { icon: "📖", label: "Alisher Navoiy asarlari", prompt: "Alisher Navoiyning eng mashhur asarlari haqida batafsil ma'lumot bering" },
    { icon: "⚖️", label: "Huquq kitoblari", prompt: "Yuridik fanlar bo'yicha eng yaxshi darsliklarni tavsiya qiling" },
    { icon: "📚", label: "O'zbek adabiyoti", prompt: "O'zbek adabiyotidagi eng yaxshi 5 ta kitobni tavsiya qiling" },
    { icon: "🎓", label: "Darsliklar", prompt: "Texnikum talabalari uchun eng foydali darsliklarni tavsiya qiling" },
];

export function AIChatPage() {
    const navigate = useNavigate();
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, chatLoading]);

    const handleSendMessage = async (customMessage?: string) => {
        const trimmed = (customMessage || chatInput).trim();
        if (!trimmed || chatLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: trimmed };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmed,
                    history: chatMessages,
                }),
                signal: controller.signal,
            });

            const data = await res.json();
            if (data.reply) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Serverdan xatolik qaytdi' }]);
            }
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Tarmoq bilan aloqa yo\'q. Iltimos tekshirib ko\'ring.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const renderMessageContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            const isInfoLine = /^[📖✍️📅📄🏷️📝⭐🔹🔸📚⚖️🌍🎯🚫💡✅❌🔍]/.test(line.trim());

            if (isInfoLine) {
                return (
                    <p key={i} className={`${i !== 0 ? 'mt-1.5' : ''} font-medium`} dangerouslySetInnerHTML={{ __html: formatted }} />
                );
            }

            return (
                <p key={i} className={i !== 0 ? 'mt-2' : ''} dangerouslySetInnerHTML={{ __html: formatted }} />
            );
        });
    };

    const handleReset = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setChatMessages([]);
        setChatInput('');
        setChatLoading(false);
    };

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-64px)] w-full flex flex-col font-sans">
            <div className="flex-1 rounded-none overflow-hidden flex flex-col relative bg-[#FDFDFE]">

                {/* Decorative background glow - softer for light mode */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 px-3 sm:px-8 py-3 sm:py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-2.5 sm:gap-4 relative z-50">
                        <button onClick={handleReset}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-900 cursor-pointer relative z-50 shadow-sm">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl xs:rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0"
                            style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)' }}>
                            <BookOpen className="w-4 h-4 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                AI Kutubxonachi
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs sm:text-base font-medium text-slate-600">
                                    Online yordamchi
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                </div>

                {/* Messages Area */}
                <div className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 scrollbar-thin"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>

                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 sm:space-y-10 px-4 pb-10">
                            {/* Hero Icon */}
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden bg-white shadow-2xl shadow-emerald-500/5 border border-slate-100">
                                    <Library className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500/60" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white">
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                            </div>

                            {/* Welcome Text */}
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Qanday yordam bera olaman?</h2>
                                <p className="text-slate-600 text-sm sm:text-xl max-w-lg leading-relaxed px-4 font-medium">
                                    Surxondaryo yuridik texnikumi kutubxonasi bo'yicha <span className="text-emerald-600 font-bold underline decoration-emerald-300 decoration-2 underline-offset-4">aqlli qidiruv</span> xizmati
                                </p>
                            </div>

                            {/* Quick Prompts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                                {quickPrompts.map((qp, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(qp.prompt)}
                                        className="group flex items-center gap-3 xs:gap-4 px-3 xs:px-5 py-3 xs:py-4 rounded-xl xs:rounded-2xl text-left transition-all duration-300 bg-white border border-slate-100 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                                    >
                                        <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-slate-50 flex items-center justify-center text-xl xs:text-2xl group-hover:scale-110 transition-transform duration-300">
                                            {qp.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block text-[14px] sm:text-[15px] font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors truncate">{qp.label}</span>
                                            <span className="block text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">So'rab ko'ring...</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        chatMessages.map((msg, idx) => (
                            <div key={idx}
                                className={`flex gap-3 sm:gap-4 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                style={{ animationDelay: `${idx * 50}ms` }}>

                                {/* Avatar */}
                                <div className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-500/10'
                                    : 'bg-white text-emerald-600 border-slate-100 shadow-slate-200/50'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`max-w-[85%] sm:max-w-[75%] px-4 sm:px-6 py-3 sm:py-4 text-[14px] sm:text-[16px] leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'rounded-2xl rounded-tr-md bg-emerald-600 text-white shadow-emerald-500/10'
                                    : 'rounded-2xl rounded-tl-md bg-white text-slate-800 border border-slate-100 shadow-slate-200/40'
                                    }`}>
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Loading State */}
                    {chatLoading && (
                        <div className="flex gap-3 sm:gap-4 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl sm:rounded-2xl bg-white text-emerald-600 border border-slate-100 flex items-center justify-center shadow-sm">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="px-6 py-4 rounded-2xl rounded-tl-md bg-white border border-slate-100 flex items-center gap-3 shadow-sm">
                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                <span className="text-sm font-medium text-slate-500">Kitob qidirilmoqda...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} className="h-6" />
                </div>

                {/* Input Area */}
                <div className="relative z-10 p-4 sm:p-6 bg-white border-t border-slate-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative flex items-center group">
                            <div className="flex-1 flex items-center bg-slate-50 rounded-[2rem] border border-slate-200 transition-all duration-300 focus-within:border-emerald-500/40 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-emerald-500/5 px-1 xs:px-2 py-1 xs:py-2">
                                <div className="pl-2 xs:pl-4 text-slate-400 shrink-0">
                                    <Search className="w-4 h-4 xs:w-5 xs:h-4 group-focus-within:text-emerald-500 transition-colors" />
                                </div>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={window.innerWidth < 640 ? "Kitob qidirish..." : "Kitob nomi, muallifi yoki fan nomi..."}
                                    className="w-full min-w-0 bg-transparent border-none px-3 py-2.5 sm:py-3.5 text-[14px] sm:text-[16px] text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-400 font-medium"
                                />

                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!chatInput.trim() || chatLoading}
                                    className="shrink-0 w-12 h-12 sm:w-[120px] sm:h-auto sm:px-6 sm:py-3.5 rounded-full font-bold text-sm transition-all duration-300 disabled:opacity-30 disabled:grayscale text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    <span className="hidden sm:inline italic">Qidirish</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 sm:mt-4 opacity-60">
                            <p className="text-[10px] sm:text-[12px] text-slate-500 font-medium flex items-center gap-1">
                                <BookMarked className="w-3 h-3" /> Faqat kitoblar bo'yicha
                            </p>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <p className="text-[10px] sm:text-[12px] text-slate-500 font-medium tracking-wide uppercase">
                                Surxondaryo texnikumi
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
