import { useState, useEffect } from 'react';
import { X, Building, CreditCard, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WithdrawModal({ isOpen, onClose, balance }) {
    const { user, withdrawFunds } = useApp();

    // Notification State matches standard
    const [notification, setNotification] = useState({
        show: false,
        type: 'success',
        title: '',
        message: '',
        detail: null
    });

    const [formData, setFormData] = useState({
        bank: '',
        accountNumber: '',
        accountName: '',
        amount: ''
    });

    const banks = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'Jago', 'SeaBank', 'GoPay', 'OVO', 'Dana'];

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({ bank: '', accountNumber: '', accountName: '', amount: '' });
            setNotification({ show: false, type: 'success', title: '', message: '', detail: null });
        }
    }, [isOpen]);

    const showNotify = (type, title, message, detail = null) => {
        setNotification({ show: true, type, title, message, detail });
    };

    const handleSubmitWithdraw = async () => {
        const { amount, bank, accountNumber, accountName } = formData;

        // Parse formatted amount (remove non-digits)
        const parsedAmount = parseInt(amount.replace(/\D/g, '') || '0');

        if (!parsedAmount || !bank || !accountNumber || !accountName) {
            showNotify('error', 'Data Belum Lengkap', 'Mohon lengkapi semua data form penarikan (Nominal, Bank, No. Rekening, Atas Nama).');
            return;
        }

        // Validate against Prop Balance
        // FIX: Ensure Number comparison to avoid string coercion bugs
        if (parsedAmount > Number(balance || 0)) {
            showNotify('error', 'Saldo Tidak Mencukupi', `Saldo Anda saat ini Rp ${(balance || 0).toLocaleString('id-ID')}. Mohon kurangi nominal penarikan.`);
            return;
        }

        const adminFee = Math.floor(parsedAmount * 0.05);
        const netAmount = parsedAmount - adminFee;

        // Attempt Withdraw (Note: withdrawFunds in context might update DB, but we rely on balance prop for display)
        const success = await withdrawFunds(parsedAmount, formData);

        if (success) {
            showNotify(
                'success',
                'Permintaan Terkirim!',
                `Permintaan penarikan Rp ${netAmount.toLocaleString('id-ID')} berhasil diajukan (Potongan admin 5%).\nCek status di menu Aktivitas.`,
                { amount: parsedAmount, netAmount: netAmount, adminFee: adminFee, bank, accountNumber, accountName }
            );
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            showNotify('error', 'Gagal Memproses', 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 relative overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="font-bold text-slate-900 text-xl">Tarik Dana</h3>
                        <p className="text-xs text-slate-500">Isi detail rekening tujuan pencairan.</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
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
                            <p className="text-[10px] text-slate-500 font-medium">Saldo: <span className="text-slate-900">
                                {/* Dynamic Balance Display */}
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(balance || 0)}
                            </span></p>
                        </div>
                        {/* Receipt removed for brevity/duplicate prevention as per original, keeping it simple or follow previous? 
                            I'll keep the receipt preview as it's good UX.
                        */}
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

                    {/* Bank & Account section */}
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
                        </div>
                    </div>

                    {/* Account Params */}
                    <div className="grid grid-cols-1 gap-4">
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

                {/* Inline Notification */}
                {notification.show && (
                    <div className={`p-3 rounded-xl border ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} text-xs font-medium`}>
                        <p className="font-bold">{notification.title}</p>
                        <p>{notification.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
