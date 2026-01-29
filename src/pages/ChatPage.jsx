import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Search, Plus, Video, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ChatPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { user, addNotification, orders } = useApp();
    const location = useLocation();

    // Use job data from navigation state if available, else derive from context
    // Use job data from navigation state if available, else derive from context
    const navJob = location.state?.job;
    const activeOrder = navJob || orders.find(o => o.id === orderId);

    // DYNAMIC HEADER LOGIC: Determine who we are talking TO
    const isTutor = user?.id === activeOrder?.tutorId;
    const chatWith = isTutor
        ? (activeOrder?.studentName || 'Mahasiswa')
        : (activeOrder?.tutorName || 'Tutor');

    // Status & Lock Logic
    // Normalize status check (allow 'done', 'Done', 'completed')
    const currentStatus = activeOrder?.status?.toLowerCase() || '';
    const isLocked = currentStatus === 'done' || currentStatus === 'completed';

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Real-time Messages Sync
    useEffect(() => {
        if (!orderId) return;

        const messagesRef = collection(db, 'jobs', orderId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setLoading(false);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [orderId]);

    // Auto-scroll on new message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLocked) return;

        try {
            const messagesRef = collection(db, 'jobs', orderId, 'messages');
            await addDoc(messagesRef, {
                text: message,
                sender: user?.name || 'Anonymous',
                role: user?.role || 'student',
                createdAt: serverTimestamp()
            });

            setMessage('');

            // Send notification to the "other" party (Simulated logic since we don't have separate auth sessions to check online status)
            // In a real app, Cloud Functions would handle this.
            /* 
            if (activeOrder) {
               // Logic to notify recipient
            } 
            */

        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    if (loading && !messages.length) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
        );
    }

    if (!activeOrder && !loading) {
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
                    {/* Avatar with Dynamic Initial or Random */}
                    <div className="w-10 h-10 rounded-full border-2 border-[#10B981] overflow-hidden bg-white">
                        <img
                            src={`https://ui-avatars.com/api/?name=${chatWith}&background=random`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm leading-tight flex items-center gap-2">
                            {chatWith}
                            {isLocked && <span className="bg-green-500 text-[10px] px-1.5 rounded">Selesai</span>}
                        </h2>
                        <p className="text-xs text-slate-300 line-clamp-1 w-40">
                            {activeOrder?.title || 'Chat Room'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {isLocked ? (
                <div className="bg-green-50 border-b border-green-100 p-3 flex items-center gap-3 shadow-sm z-10">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                        <h3 className="font-bold text-green-900 text-xs">Transaksi Selesai</h3>
                        <p className="text-green-700 text-[10px]">Chat ini telah diarsipkan karena tugas sudah selesai.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center gap-3 shadow-sm z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-xs">Status: {activeOrder?.status}</h3>
                        <p className="text-blue-700 text-[10px]">Diskusi aktif. Sopan santun dijaga ya!</p>
                    </div>
                </div>
            )}

            {/* Chat Body */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F2F5] ${isLocked ? 'opacity-80' : ''}`}>
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-50 text-sm">
                        Belum ada pesan. Mulai percakapan sekarang!
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === user?.name || msg.role === user?.role ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 shadow-sm relative text-sm leading-relaxed ${(msg.sender === user?.name || msg.role === user?.role)
                            ? 'bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-none'
                            : 'bg-white text-slate-900 rounded-2xl rounded-tl-none'
                            }`}>
                            <p>{msg.text}</p>
                            <span className={`text-[10px] block mt-1 text-right ${(msg.sender === user?.name || msg.role === user?.role) ? 'text-slate-500' : 'text-slate-400'}`}>
                                {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
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
