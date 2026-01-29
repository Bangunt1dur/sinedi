import { CheckCircle, AlertCircle } from 'lucide-react';

export default function NotificationModal({ show, type = 'success', title, message, detail, onClose }) {
    if (!show) return null;

    // Default titles if not provided
    const displayTitle = title || (type === 'success' ? 'Berhasil!' : 'Gagal!');
    const displayMessage = message || (type === 'success' ? 'Aksi berhasil dilakukan.' : 'Terjadi kesalahan.');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {type === 'success' ? (
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    ) : (
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{displayTitle}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {displayMessage}
                    </p>
                    {type === 'success' && detail && (
                        <div className="bg-slate-50 rounded-xl p-4 mt-4 text-left border border-slate-100">
                            {detail}
                        </div>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 ${type === 'success'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        }`}
                >
                    {type === 'success' ? 'Selesai' : 'Coba Lagi'}
                </button>
            </div>
        </div>
    );
}
