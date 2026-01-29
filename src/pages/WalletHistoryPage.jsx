import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Wallet, X, Building, CreditCard, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationModal from '../components/NotificationModal';
import WithdrawModal from '../components/WithdrawModal';

export default function WalletHistoryPage() {
    const context = useApp();
    const { user, withdrawFunds } = context;
    const navigate = useNavigate();

    // Data Source: Direct from 'orders'
    const { orders } = useApp();

    // 1. Filter ALL jobs where I am the tutor OR the student (buyer)
    const myJobs = orders.filter(o => o.tutorId === user.id || o.studentId === user.id);

    // 2. Map to history format
    const history = myJobs.map(job => ({
        id: job.id,
        title: job.title,
        date: job.createdAt,
        amount: parseInt(job.price) || 0,
        status: job.status, // Keep original status for checking
        type: job.type,
        tutorId: job.tutorId, // Needed for isIncome check
        studentId: job.studentId
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    // 3. Calculate ACTIVE BALANCE (Sum of all 'done' jobs)
    // Case-insensitive check for 'done'
    // 3. Calculate ACTIVE BALANCE (Sum of all 'done' jobs)
    // FIX PERHITUNGAN SALDO: Sum all 'done' types (task, mentoring, video_buy)
    const totalEarnings = history.reduce((acc, item) => {
        const status = item.status?.toLowerCase();
        const isIncome = item.tutorId === user.id;

        // Universal Done Check: Covers 'task', 'mentoring', etc.
        const isDone = ['done', 'completed', 'success', 'Done'].includes(item.status) || ['done', 'completed', 'success'].includes(status);
        const isVideo = item.type === 'video_buy';

        if (isIncome && (isDone || isVideo)) {
            return acc + item.amount;
        }
        return acc;
    }, 0);

    // Modal State
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const handleWithdrawClick = () => {
        setShowWithdrawModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold">Dompet & Riwayat</h1>
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-6 animate-in fade-in">
                {/* Balance Card */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Saldo Tersedia</p>
                            <button onClick={context.recalculateWallet} className="bg-slate-800 p-1 rounded-full text-white/50 hover:text-white hover:bg-slate-700 transition-colors" title="Sinkronkan Saldo">
                                {/* Ensure Icon is imported or just text */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
                            </button>
                        </div>
                        {/* Real DB Balance */}
                        <h2 className="text-3xl font-bold">
                            Rp {(user?.wallet || 0).toLocaleString()}
                        </h2>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleWithdrawClick}
                                className="w-full bg-yellow-400 text-slate-900 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors shadow-lg"
                            >
                                <ArrowDownLeft className="w-4 h-4" /> Tarik Dana
                            </button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* History List */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-slate-500" />
                        Riwayat Transaksi
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-sm">
                        {history.length > 0 ? history.map(item => {
                            // Logic: If I am the tutor (tutorId == myID), it's INCOME (+).
                            // If I am the student (studentId == myID) OR I bought it, it's EXPENSE (-).
                            // Since this list is filtered by 'myJobs' (tutorId === user.id) in the previous logic, 
                            // we need to broaden the initial filter to show expenses too?
                            // Wait, the user request says "LOGIC ARAH UANG VIDEO TERBALIK".
                            // If I bought a video, I am the student.
                            // So 'myJobs' should probably include jobs where I am student too if we want to show expenses.
                            // But for now, let's fix the direction logic specifically requested:
                            // "const isIncome = job.tutorId === currentUser.uid;"

                            // Correct Logic for Withdraw vs Income
                            const isWithdraw = item.type === 'withdraw';
                            const isIncome = !isWithdraw && item.tutorId === user.id; // Income if I am tutor and it's NOT a withdraw
                            const isExpense = isWithdraw; // For now only withdrawals are expenses for tutors

                            return (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            {/* Fix Title for Withdrawals */}
                                            <p className="font-bold text-sm text-slate-900">{isWithdraw ? 'Penarikan Dana' : item.title}</p>
                                            <p className="text-xs text-slate-400">{item.date ? new Date(item.date).toLocaleDateString() : 'Invalid Date'} • <span className={isIncome ? 'text-green-600' : 'text-orange-500'}>{item.status}</span></p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                                        {isIncome ? '+' : '-'} Rp {item.amount.toLocaleString()}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Belum ada riwayat transaksi.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* WITHDRAW MODAL - Calling the Prop Cleanly */}
            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                balance={totalEarnings}
            />
        </div>
    );
}
