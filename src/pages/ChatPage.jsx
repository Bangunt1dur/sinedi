import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Search, Plus, Video, Lock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ChatPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { user, addNotification, orders } = useApp();
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Get Active Order
    const activeOrder = orders.find(o => o.id === orderId);
    const isLocked = activeOrder?.status === 'Done';

    // Mock Messages
    const [messages, setMessages] = useState([
        { id: 1, sender: 'me', text: 'Halo kak, untuk tugas ini apakah sudah sesuai?', time: '10:30' },
        { id: 2, sender: 'other', text: 'Sedang saya cek ya, sebentar.', time: '10:32' },
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || isLocked) return;

        const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        setMessage('');

        // Simulate Reply
        setTimeout(() => {
            const replyMsg = {
                id: Date.now() + 1,
                sender: 'other',
                text: 'Baik, pengerjaan akan saya lanjutkan.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, replyMsg]);

            // Push Notification
            addNotification({
                title: `Pesan Baru (Order #${activeOrder?.id?.slice(-4)})`,
                desc: replyMsg.text,
                type: 'info'
            });
        }, 2000);
    };

    if (!activeOrder) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Pesanan tidak ditemukan.</p>
                    <button onClick={() => navigate('/activity')} className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold">
                        Kembali ke Aktivitas
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-[#F0F2F5] font-sans">
            {/* Header */}
            <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between text-white shadow-md z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full border-2 border-[#10B981] overflow-hidden bg-white">
                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm leading-tight flex items-center gap-2">
                            {activeOrder.tutorName || 'Tutor'}
                            {isLocked && <span className="bg-red-500 text-[10px] px-1.5 rounded">Selesai</span>}
                        </h2>
                        <p className="text-xs text-slate-300 line-clamp-1 w-40">
                            {activeOrder.title}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {isLocked ? (
                <div className="bg-red-50 border-b border-red-100 p-3 flex items-center gap-3 shadow-sm z-10">
                    <Lock className="w-5 h-5 text-red-500" />
                    <div>
                        <h3 className="font-bold text-red-900 text-xs">Chat Terkunci</h3>
                        <p className="text-red-700 text-[10px]">Tugas ini telah selesai. Anda tidak dapat mengirim pesan baru.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center gap-3 shadow-sm z-10">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <div>
                        <h3 className="font-bold text-blue-900 text-xs">Status: {activeOrder.status}</h3>
                        <p className="text-blue-700 text-[10px]">Chat akan dikunci otomatis setelah tugas selesai.</p>
                    </div>
                </div>
            )}

            {/* Chat Body */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F2F5] ${isLocked ? 'opacity-80' : ''}`}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 shadow-sm relative text-sm leading-relaxed ${msg.sender === 'me'
                                ? 'bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-none'
                                : 'bg-white text-slate-900 rounded-2xl rounded-tl-none'
                            }`}>
                            <p>{msg.text}</p>
                            <span className={`text-[10px] block mt-1 text-right ${msg.sender === 'me' ? 'text-slate-500' : 'text-slate-400'}`}>
                                {msg.time}
                            </span>
                        </div>
                    </div>
                ))}

                {isLocked && (
                    <div className="text-center py-4">
                        <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-bold">
                            Sesi Chat Berakhir
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className={`bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center gap-3 ${isLocked ? 'grayscale opacity-70 cursor-not-allowed' : ''}`}>
                <button disabled={isLocked} className="text-slate-400 hover:text-slate-600 p-2">
                    <Plus className="w-6 h-6" />
                </button>
                <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
                    <input
                        type="text"
                        disabled={isLocked}
                        value={isLocked ? 'Chat dikunci karena tugas selesai.' : message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-full py-3 px-5 text-sm text-slate-900 outline-none focus:border-slate-300 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isLocked}
                        className="w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-slate-800 transition-colors"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
