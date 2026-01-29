import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Wallet, X, Building, CreditCard, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationModal from '../components/NotificationModal';

export default function WalletHistoryPage() {
    const { user, withdrawFunds } = useApp();
    const navigate = useNavigate();

    // Mock Data for History
    const history = [
        { id: 1, type: 'income', title: 'Pembayaran Mentoring', date: '29 Jan 2026', amount: 150000, status: 'Success' },
        { id: 2, type: 'withdraw', title: 'Penarikan Dana', date: '25 Jan 2026', amount: 500000, status: 'Success' },
        { id: 3, type: 'income', title: 'Jual Video Calculus', date: '24 Jan 2026', amount: 50000, status: 'Success' },
        { id: 4, type: 'income', title: 'Joki Tugas Fisika', date: '22 Jan 2026', amount: 200000, status: 'Success' },
        { id: 5, type: 'withdraw', title: 'Penarikan Dana', date: '15 Jan 2026', amount: 300000, status: 'Pending' },
    ];

    // Modal State
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Notification State (Success/Error)
    const [notification, setNotification] = useState({
        show: false,
        type: 'success', // 'success' | 'error'
        title: '',
        message: '',
        detail: null // optional detail object for success
    });

    const [formData, setFormData] = useState({
        bank: '',
        accountNumber: '',
        accountName: '',
        amount: ''
    });

    const banks = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'Jago', 'SeaBank', 'GoPay', 'OVO', 'Dana'];

    const showNotify = (type, title, message, detail = null) => {
        setNotification({ show: true, type, title, message, detail });
    };

    const closeNotify = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    const handleWithdrawClick = () => {
        // Time check: 08:00 - 16:00 (DISABLED FOR TESTING)
        // const now = new Date();
        // const currentHour = now.getHours();
        // if (currentHour >= 8 && currentHour < 16) {
        setShowWithdrawModal(true);
        // } else {
        //    showNotify('error', 'Di luar Jam Operasional', 'Penarikan dana hanya dapat dilakukan pada jam 08:00 - 16:00 WIB.');
        // }
    };

    const handleSubmitWithdraw = () => {
        const { amount, bank, accountNumber, accountName } = formData;

        // Parse formatted amount (remove non-digits)
        const parsedAmount = parseInt(amount.replace(/\D/g, '') || '0');

        if (!parsedAmount || !bank || !accountNumber || !accountName) {
            showNotify('error', 'Data Belum Lengkap', 'Mohon lengkapi semua data form penarikan (Nominal, Bank, No. Rekening, Atas Nama).');
            return;
        }

        if (parsedAmount > user.wallet) {
            showNotify('error', 'Saldo Tidak Mencukupi', `Saldo Anda saat ini Rp ${user.wallet?.toLocaleString()}. Mohon kurangi nominal penarikan.`);
            return;
        }

        const adminFee = Math.floor(parsedAmount * 0.05);
        const netAmount = parsedAmount - adminFee;

        if (withdrawFunds(parsedAmount)) {
            setShowWithdrawModal(false);
            // Show Success Notification with Net Amount details
            showNotify(
                'success',
                'Permintaan Terkirim!',
                `Permintaan penarikan Rp ${netAmount.toLocaleString('id-ID')} berhasil diajukan (Potongan admin 5%).`,
                { amount: parsedAmount, netAmount: netAmount, adminFee: adminFee, bank, accountNumber, accountName }
            );
            setFormData({ bank: '', accountNumber: '', accountName: '', amount: '' });
        } else {
            showNotify('error', 'Gagal Memproses', 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
        }
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
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Saldo Aktif</p>
                        <h2 className="text-3xl font-bold">Rp {user.wallet?.toLocaleString() || 0}</h2>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleWithdrawClick}
                                className="w-full bg-yellow-400 text-slate-900 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors shadow-lg"
                            >
                                <ArrowDownLeft className="w-4 h-4" /> Withdraw
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
                        {history.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {item.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{item.title}</p>
                                        <p className="text-xs text-slate-400">{item.date} • <span className={item.status === 'Success' ? 'text-green-600' : 'text-orange-500'}>{item.status}</span></p>
                                    </div>
                                </div>
                                <span className={`font-bold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {item.type === 'income' ? '+' : '-'} Rp {item.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WITHDRAW MODAL */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 relative overflow-hidden">

                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl">Tarik Dana</h3>
                                <p className="text-xs text-slate-500">Isi detail rekening tujuan pencairan.</p>
                            </div>
                            <button onClick={() => setShowWithdrawModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Amount */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Nominal Penarikan</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-yellow-500 transition-colors">Rp</span>
                                    <input
                                        type="text"
                                        value={formData.amount}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                            const formatted = val ? parseInt(val).toLocaleString('id-ID') : '';
                                            setFormData({ ...formData, amount: formatted });
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder:text-slate-300"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1 mb-2">
                                    <p className="text-[10px] text-slate-400">Min. Penarikan Rp 50.000</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Saldo: <span className="text-slate-900">Rp {user.wallet?.toLocaleString()}</span></p>
                                </div>

                                {/* Receipt Breakdown */}
                                {formData.amount && (
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Nominal Penarikan</span>
                                            <span>Rp {formData.amount}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-red-500 font-medium">
                                            <span>Biaya Aplikasi (5%)</span>
                                            <span>-Rp {Math.floor(parseInt(formData.amount.replace(/\D/g, '')) * 0.05).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                                        <div className="flex justify-between text-sm text-green-700 font-bold">
                                            <span>Total Diterima</span>
                                            <span>Rp {Math.floor(parseInt(formData.amount.replace(/\D/g, '')) * 0.95).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bank */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Bank / E-Wallet Tujuan</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
                                    <select
                                        value={formData.bank}
                                        onChange={e => setFormData({ ...formData, bank: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="">Pilih Bank / E-Wallet</option>
                                        {banks.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Account No */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Nomor Rekening / HP</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
                                    <input
                                        type="tel"
                                        value={formData.accountNumber}
                                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder:text-slate-300"
                                        placeholder="Contoh: 1234567890"
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Atas Nama</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.accountName}
                                        onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder:text-slate-300 uppercase"
                                        placeholder="NAMA PEMILIK REKENING"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4">
                            <button
                                onClick={handleSubmitWithdraw}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                Ajukan Penarikan Dana
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATION MODAL (SUCCESS / ERROR) */}
            <NotificationModal
                show={notification.show}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotify}
                detail={notification.type === 'success' && notification.detail && (
                    <>
                        <p className="text-xs text-slate-400 mb-1">Detail Penarikan:</p>
                        <div className="space-y-1 mb-2">
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500">Nominal Awal</span>
                                <span className="text-xs font-medium text-slate-900">Rp {parseInt(notification.detail.amount).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-red-500">Biaya Admin (5%)</span>
                                <span className="text-xs font-medium text-red-500">-Rp {parseInt(notification.detail.adminFee || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                            <div className="flex justify-between">
                                <span className="text-sm font-bold text-slate-700">Total Cair</span>
                                <span className="text-lg font-bold text-green-600">Rp {parseInt(notification.detail.netAmount || notification.detail.amount).toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-200 my-2"></div>
                        <p className="text-xs text-slate-600 font-medium">{notification.detail.bank} - {notification.detail.accountNumber}</p>
                        <p className="text-xs text-slate-400 uppercase">{notification.detail.accountName}</p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-green-600 font-bold">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Dana masuk estimasi 2x24 Jam
                        </div>
                    </>
                )}
            />
        </div>
    );
}
