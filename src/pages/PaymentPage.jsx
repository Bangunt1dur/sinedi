import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PaymentPage() {
    const { id } = useParams();
    const { payOrder } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            // 1. Check if order data passed via navigation state (Fastest)
            if (location.state?.job) {
                setOrder(location.state.job);
                setLoading(false);
                return;
            }

            // 2. Fallback to Firestore if fresh load/refresh
            try {
                const docRef = doc(db, 'jobs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such order!");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, location.state]);

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    <p className="text-slate-500 text-sm font-bold">Memuat Detail Pembayaran...</p>
                </div>
            </div>
        );
    }

    if (!order) return <div className="p-10 text-center text-slate-500 font-bold">Order not found. Silakan kembali ke menu utama.</div>;

    const handleConfirmPayment = () => {
        payOrder(id);
        navigate('/dashboard'); // Change to dashboard to see "Active/Queue" status
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 ml-2">Pembayaran</h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 flex flex-col items-center">

                        {/* QR Container */}
                        <div className="relative bg-slate-900 p-6 rounded-3xl shadow-lg mb-8 group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-bold px-4 py-1 rounded-full border border-slate-700 tracking-widest uppercase">
                                Scan QRIS
                            </div>

                            {/* QR Placeholder Grid Effect */}
                            <div className="w-48 h-48 bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                                <div className="grid grid-cols-5 gap-2 opacity-30">
                                    {[...Array(25)].map((_, i) => (
                                        <div key={i} className="w-6 h-6 bg-slate-600 rounded-md"></div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-transparent"></div>
                                <div className="absolute bg-white px-4 py-2 rounded-lg font-bold text-slate-900 text-xl shadow-lg">SINEDI</div>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm font-medium mb-1">Total Pembayaran</p>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Rp {order.price?.toLocaleString()}</h2>

                        <div className="bg-yellow-50 text-yellow-800 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 mb-8">
                            <Clock className="w-4 h-4" />
                            Menunggu pembayaran... {formatTime(timeLeft)}
                        </div>

                        <button
                            onClick={handleConfirmPayment}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 text-lg"
                        >
                            Saya Sudah Bayar
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
